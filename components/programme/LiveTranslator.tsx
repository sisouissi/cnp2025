import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Session } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { ArrowLeft, Mic, Square, Languages, AlertCircle } from 'lucide-react';

const LANGUAGES = [
    { code: 'auto', name: 'Détection automatique' },
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'Anglais' },
    { code: 'es', name: 'Espagnol' },
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

    const fullTranscript = finalTranscript + interimTranscript;
    
    const scrollToBottom = useCallback(() => {
        if (translatedPanelRef.current) {
            const element = translatedPanelRef.current;
            element.scrollTop = element.scrollHeight;
        }
    }, []);

    // Optimisation du scroll - déclenchement plus fréquent
    useEffect(() => {
        scrollToBottom();
    }, [translatedText, scrollToBottom]);

    // Fonction pour formater le texte en paragraphes
    const formatTextIntoParagraphs = useCallback((text: string) => {
        // Diviser par les points suivis d'espaces ou de nouvelles lignes
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs: string[] = [];
        let currentParagraphText = '';
        
        sentences.forEach((sentence, index) => {
            const trimmedSentence = sentence.trim();
            if (trimmedSentence) {
                currentParagraphText += trimmedSentence + '. ';
                
                // Créer un nouveau paragraphe après 2-3 phrases ou si c'est la dernière phrase
                if ((index + 1) % 3 === 0 || index === sentences.length - 1) {
                    if (currentParagraphText.trim()) {
                        paragraphs.push(currentParagraphText.trim());
                        currentParagraphText = '';
                    }
                }
            }
        });
        
        return paragraphs;
    }, []);

    const translateText = useCallback(async (text: string): Promise<void> => {
        if (!text.trim() || isProcessingRef.current) return;
        
        console.log('Début traduction:', text.substring(0, 50) + '...');
        isProcessingRef.current = true;
        setIsTranslating(true);
        setApiError(null);

        // Annuler la requête précédente
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        try {
            console.log('Envoi de la requête de traduction...');
            const response = await fetch('/api/groq-proxy', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'translate',
                    payload: { 
                        text: text.trim(), 
                        targetLang: targetLang
                    }
                }),
                signal: abortControllerRef.current.signal
            });

            if (!response.ok) {
                console.error('Erreur de réponse:', response.status);
                throw new Error(`Erreur serveur: ${response.status}`);
            }

            if (!response.body) {
                console.error('Pas de body dans la réponse');
                throw new Error("Pas de réponse du serveur");
            }
            
            console.log('Début du streaming...');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            // Ajouter un saut de ligne avant la nouvelle traduction si il y a déjà du texte
            setTranslatedText(prev => prev.trim() ? prev + '\n\n' : '');
            
            // Indiquer immédiatement que la traduction commence
            setTranslatedText(prev => prev + '');  // Force le re-render
            scrollToBottom();

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    console.log('Stream terminé');
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                console.log('Chunk reçu:', chunk.substring(0, 100) + '...');
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.trim() || !line.startsWith('data: ')) continue;
                    
                    const data = line.substring(6).trim();
                    if (data === '[DONE]') {
                        console.log('Traduction terminée - signal DONE reçu');
                        return;
                    }
                    
                    try {
                        const parsed = JSON.parse(data);
                        
                        // Gérer la détection de langue
                        if (parsed.detected_language && targetLang === 'auto') {
                            console.log('Langue détectée:', parsed.detected_language);
                            setDetectedLanguage(parsed.detected_language);
                        }
                        
                        // Gérer le contenu de traduction
                        const contentDelta = parsed.choices?.[0]?.delta?.content;
                        if (contentDelta) {
                            console.log('Nouveau contenu reçu:', contentDelta);
                            setTranslatedText(prev => {
                                const newText = prev + contentDelta;
                                // Forcer le scroll après la mise à jour
                                setTimeout(() => scrollToBottom(), 10);
                                return newText;
                            });
                        }
                    } catch (parseError) {
                        // Ignorer silencieusement les erreurs de parsing des chunks incomplets
                        if (!data.includes('"id"')) {
                            console.warn('Chunk incomplet ignoré:', data.substring(0, 50));
                        } else {
                            console.warn('Erreur parsing chunk complet:', data, parseError);
                        }
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

    // Gestion de la transcription avec debounce optimisé
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        const processTranscript = () => {
            const newText = fullTranscript.substring(sentTranscriptRef.current.length).trim();
            if (newText.length > 5) { // Seuil minimum pour éviter les fragments trop courts
                console.log('Nouveau texte à traduire:', newText);
                sentTranscriptRef.current = fullTranscript;
                translateText(newText);
            }
        };

        if (isListening && fullTranscript) {
            // Debounce de 1 seconde pendant l'écoute
            debounceTimerRef.current = window.setTimeout(processTranscript, 1000);
        } else if (!isListening && fullTranscript.length > sentTranscriptRef.current.length) {
            // Traitement immédiat quand l'écoute s'arrête
            processTranscript();
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [fullTranscript, isListening, translateText]);

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
            setDetectedLanguage(null);
            sentTranscriptRef.current = '';
            setApiError(null);
            isProcessingRef.current = false;
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
                    style={{ 
                        scrollBehavior: 'smooth',
                        maxHeight: '100%',
                        overflowY: 'auto',
                        overflowX: 'hidden'
                    }}
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
                        {isTranslating && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Traduction en cours...
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
                        <div className="text-slate-800 whitespace-pre-wrap leading-relaxed text-lg break-words">
                            {translatedText}
                            {isTranslating && (
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