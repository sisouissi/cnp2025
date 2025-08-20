import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Session } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { ArrowLeft, Mic, Square, Languages, AlertCircle } from 'lucide-react';

const LANGUAGES = [
    { code: 'auto', name: 'Détection automatique' },
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'Anglais' },
    { code: 'es', name: 'Espagnol' },
    { code: 'ar', name: 'Arabe' },
];

interface LiveTranslatorProps {
    session: Session;
    onBack: () => void;
}

const LiveTranslator: React.FC<LiveTranslatorProps> = ({ session, onBack }) => {
    const [targetLang, setTargetLang] = useState('auto');
    const [translatedText, setTranslatedText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
    const [translationQueue, setTranslationQueue] = useState<string[]>([]);
    
    const { 
        isListening, 
        finalTranscript, 
        interimTranscript, 
        startListening, 
        stopListening, 
        error: recognitionError 
    } = useSpeechRecognition();
    
    const sentTranscriptRef = useRef('');
    const translatedPanelRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isProcessingRef = useRef(false);
    const translationBufferRef = useRef('');

    const fullTranscript = finalTranscript + interimTranscript;
    
    const scrollToBottom = useCallback((ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight;
        }
    }, []);

    // Optimisation du scroll avec requestAnimationFrame
    useEffect(() => {
        const scrollTimeout = requestAnimationFrame(() => {
            scrollToBottom(translatedPanelRef);
        });
        return () => cancelAnimationFrame(scrollTimeout);
    }, [translatedText, scrollToBottom]);

    // Fonction pour diviser le texte en segments plus petits
    const splitTextIntoSegments = useCallback((text: string, maxLength = 100): string[] => {
        if (text.length <= maxLength) return [text];
        
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        const segments: string[] = [];
        let currentSegment = '';
        
        for (const sentence of sentences) {
            if ((currentSegment + sentence).length <= maxLength) {
                currentSegment += sentence + '. ';
            } else {
                if (currentSegment) segments.push(currentSegment.trim());
                currentSegment = sentence + '. ';
            }
        }
        
        if (currentSegment) segments.push(currentSegment.trim());
        return segments;
    }, []);

    const translateText = useCallback(async (text: string): Promise<void> => {
        if (!text.trim() || isProcessingRef.current) return;
        
        isProcessingRef.current = true;
        setIsTranslating(true);
        setApiError(null);

        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        try {
            const langName = targetLang === 'auto' ? 'Détection automatique' : LANGUAGES.find(l => l.code === targetLang)?.name || 'English';
            
            const response = await fetch('/api/groq-proxy', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    type: 'translate',
                    payload: { 
                        text: text.trim(), 
                        langName: langName,
                        targetLang: targetLang,
                        stream: true // Assurer le streaming
                    }
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Erreur serveur (${response.status}).`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || "Erreur de traduction.";
                } catch {
                    errorMessage = "Impossible de communiquer avec le serveur.";
                }
                throw new Error(errorMessage);
            }

            if (!response.body) {
                throw new Error("Pas de réponse du serveur");
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            translationBufferRef.current = '';
            
            // Ajouter un espace pour séparer les traductions
            setTranslatedText(prev => prev.trim() + (prev ? ' ' : ''));

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

                for (const line of lines) {
                    const data = line.substring(6).trim();
                    if (data === '[DONE]') {
                        if (translationBufferRef.current) {
                            setTranslatedText(prev => prev + translationBufferRef.current);
                            translationBufferRef.current = '';
                        }
                        return;
                    }
                    
                    try {
                        const parsed = JSON.parse(data);
                        const contentDelta = parsed.choices[0]?.delta?.content;
                        
                        // Détecter la langue si c'est en mode automatique
                        if (targetLang === 'auto' && parsed.detected_language && !detectedLanguage) {
                            setDetectedLanguage(parsed.detected_language);
                        }
                        
                        if (contentDelta) {
                            translationBufferRef.current += contentDelta;
                            
                            // Mise à jour par batch pour améliorer les performances
                            if (translationBufferRef.current.length >= 5) {
                                setTranslatedText(prev => prev + translationBufferRef.current);
                                translationBufferRef.current = '';
                            }
                        }
                    } catch (error) {
                        console.warn('Erreur parsing chunk:', data, error);
                    }
                }
            }
            
        } catch (error: any) {
            if (error.name === 'AbortError') {
                console.log('Traduction annulée');
                return;
            }
            console.error('Erreur traduction:', error);
            setApiError(error.message || "Erreur de traduction");
        } finally {
            isProcessingRef.current = false;
            setIsTranslating(false);
            abortControllerRef.current = null;
        }
    }, [targetLang]);

    // Processeur de queue pour éviter les appels simultanés
    useEffect(() => {
        const processQueue = async () => {
            if (translationQueue.length > 0 && !isProcessingRef.current) {
                const textToTranslate = translationQueue[0];
                setTranslationQueue(prev => prev.slice(1));
                await translateText(textToTranslate);
            }
        };

        if (translationQueue.length > 0) {
            processQueue();
        }
    }, [translationQueue, translateText]);

    // Gestion améliorée de la transcription
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        const processTranscript = () => {
            const newText = fullTranscript.substring(sentTranscriptRef.current.length).trim();
            if (newText.length > 0) {
                // Diviser en segments plus petits pour une traduction plus fluide
                const segments = splitTextIntoSegments(newText, 80);
                
                if (segments.length > 0) {
                    sentTranscriptRef.current = fullTranscript;
                    
                    // Ajouter à la queue plutôt que traduire directement
                    segments.forEach(segment => {
                        if (segment.trim()) {
                            setTranslationQueue(prev => [...prev, segment.trim()]);
                        }
                    });
                }
            }
        };

        if (isListening && fullTranscript) {
            // Debounce plus court pour une réactivité améliorée
            debounceTimerRef.current = window.setTimeout(processTranscript, 300);
        } else if (!isListening && fullTranscript.length > sentTranscriptRef.current.length) {
            // Traitement immédiat quand l'écoute s'arrête
            processTranscript();
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [fullTranscript, isListening, splitTextIntoSegments]);

    const handleToggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
            // Annuler toute traduction en cours
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        } else {
            // Reset de l'état
            setTranslatedText('');
            setTranslationQueue([]);
            setDetectedLanguage(null);
            sentTranscriptRef.current = '';
            translationBufferRef.current = '';
            setApiError(null);
            startListening();
        }
    }, [isListening, startListening, stopListening]);

    // Nettoyage à la destruction du composant
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);
    
    return (
        <div className="flex flex-col flex-grow min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
                <button 
                    onClick={onBack} 
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    <ArrowLeft size={20} /> Retour
                </button>
                <div className="flex items-center gap-2">
                    <Languages size={16} className="text-slate-500" />
                    <select 
                        value={targetLang} 
                        onChange={e => setTargetLang(e.target.value)} 
                        disabled={isListening}
                        className="border-slate-300 rounded-md py-1.5 px-2 text-sm focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            {/* Content Panel */}
            <div className="flex-grow bg-slate-100 overflow-hidden p-1 flex">
                <div 
                    ref={translatedPanelRef} 
                    className="bg-white p-6 overflow-y-auto h-full w-full rounded-lg shadow-inner"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                            Traduction ({targetLang === 'auto' ? 'Auto' : LANGUAGES.find(l => l.code === targetLang)?.name})
                            {detectedLanguage && targetLang === 'auto' && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    Détecté: {detectedLanguage}
                                </span>
                            )}
                        </h3>
                        {(isTranslating || translationQueue.length > 0) && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Traduction en cours...
                                {translationQueue.length > 0 && (
                                    <span className="bg-slate-200 px-2 py-1 rounded">
                                        Queue: {translationQueue.length}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {!isListening && !translatedText ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 -mt-8">
                            <Languages size={48} className="mb-4 text-slate-400" />
                            <h3 className="text-lg font-semibold">Prêt à traduire</h3>
                            <p>Appuyez sur le bouton du microphone pour commencer.</p>
                        </div>
                    ) : (
                        <div className="text-slate-800 whitespace-pre-wrap leading-relaxed text-lg">
                            {translatedText}
                            {(isTranslating || translationQueue.length > 0) && (
                                <span className="inline-block w-2.5 h-6 bg-slate-600 animate-pulse ml-1 align-bottom rounded-sm"></span>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Footer / Controls */}
            <div className="p-4 border-t border-slate-200 flex-shrink-0 bg-slate-50 rounded-b-2xl">
                <div className="flex flex-col items-center">
                    <button 
                        onClick={handleToggleListening} 
                        disabled={isProcessingRef.current && !isListening}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none ${
                            isListening 
                                ? 'bg-rose-600 hover:bg-rose-700' 
                                : 'bg-[#033238] hover:bg-[#02262B]'
                        }`}
                    >
                        {isListening ? <Square size={24} fill="white" /> : <Mic size={24} />}
                    </button>
                    <p className="text-sm text-slate-600 mt-2 font-medium">
                        {isListening ? 'Arrêter la transcription' : 'Démarrer la transcription'}
                    </p>
                    {(recognitionError || apiError) && (
                        <div className="mt-2 text-xs text-rose-600 flex items-center gap-1 bg-rose-50 p-2 rounded-md max-w-xs text-center">
                            <AlertCircle size={14} /> 
                            {recognitionError || apiError}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveTranslator;