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
    const [isRetrying, setIsRetrying] = useState(false);
    const [isPendingTranslation, setIsPendingTranslation] = useState(false);
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
    
    // Fonction utilitaire pour diviser le texte en segments
    const splitTextIntoSegments = useCallback((text: string, maxLength: number): string[] => {
        const segments: string[] = [];
        let currentSegment = '';
        
        // Diviser le texte en phrases
        const sentences = text.split(/(?<=[.!?])\s+/);
        
        for (const sentence of sentences) {
            if (currentSegment.length + sentence.length <= maxLength) {
                currentSegment += (currentSegment ? ' ' : '') + sentence;
            } else {
                if (currentSegment) segments.push(currentSegment);
                currentSegment = sentence;
            }
        }
        
        if (currentSegment) segments.push(currentSegment);
        return segments;
    }, []);
    
    // Amélioration du défilement automatique
    const scrollToBottom = useCallback(() => {
        if (translatedPanelRef.current) {
            // Utiliser requestAnimationFrame pour un défilement plus fluide
            requestAnimationFrame(() => {
                const element = translatedPanelRef.current;
                if (element) {
                    // S'assurer que le contenu est bien rendu avant de défiler
                    const scrollHeight = element.scrollHeight;
                    const height = element.clientHeight;
                    const maxScrollTop = scrollHeight - height;
                    
                    // Défiler uniquement si ce n'est pas déjà en bas
                    if (Math.abs(element.scrollTop - maxScrollTop) > 5) {
                        element.scrollTop = maxScrollTop;
                        console.log('📜 Scroll automatique effectué');
                    }
                }
            });
        }
    }, []);
    
    // Gestion du défilement avec MutationObserver
    useEffect(() => {
        if (translatedText) {
            // Utiliser MutationObserver pour réagir aux changements de contenu
            const observer = new MutationObserver(() => {
                scrollToBottom();
            });
            
            if (translatedPanelRef.current) {
                observer.observe(translatedPanelRef.current, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            }
            
            // Déclencher un premier défilement
            scrollToBottom();
            
            return () => {
                observer.disconnect();
            };
        }
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
    
    // Amélioration de la fonction de traduction
    const translateText = useCallback(async (text: string): Promise<void> => {
        if (!text.trim() || isProcessingRef.current) return;
        
        console.log('🔥 DÉBUT TRADUCTION - Texte:', text.substring(0, 50) + '...');
        isProcessingRef.current = true;
        setIsTranslating(true);
        setIsPendingTranslation(false);
        setApiError(null);
        
        // Annuler la requête précédente
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        abortControllerRef.current = new AbortController();
        
        try {
            console.log('Envoi de la requête de traduction...');
            
            // Diviser le texte en segments plus petits pour une traduction plus rapide
            const segments = splitTextIntoSegments(text, 100); // 100 caractères par segment
            let accumulatedTranslation = translatedText.trim() ? translatedText + '\n\n' : '';
            
            // Traiter les segments séquentiellement
            for (const segment of segments) {
                if (!segment.trim()) continue;
                
                const response = await fetch('/api/groq-proxy', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        type: 'translate',
                        payload: { 
                            text: segment.trim(), 
                            targetLang: targetLang
                        }
                    }),
                    signal: abortControllerRef.current.signal
                });
                
                if (!response.ok) {
                    throw new Error(`Erreur serveur: ${response.status}`);
                }
                
                if (!response.body) {
                    throw new Error("Pas de réponse du serveur");
                }
                
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let segmentTranslation = '';
                
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (!line.trim() || !line.startsWith('data: ')) continue;
                        
                        const data = line.substring(6).trim();
                        if (data === '[DONE]') break;
                        
                        try {
                            const parsed = JSON.parse(data);
                            
                            if (parsed.detected_language && targetLang === 'auto') {
                                setDetectedLanguage(parsed.detected_language);
                            }
                            
                            const contentDelta = parsed.choices?.[0]?.delta?.content;
                            if (contentDelta) {
                                segmentTranslation += contentDelta;
                                accumulatedTranslation += contentDelta;
                                setTranslatedText(accumulatedTranslation);
                                scrollToBottom(); // Appel direct à la fonction de scroll
                            }
                        } catch (parseError) {
                            console.warn('Erreur parsing chunk:', parseError);
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
            
            let errorMessage = "Erreur de traduction";
            if (error.message.includes('500')) {
                errorMessage = "Erreur serveur - Vérifiez la configuration API";
            } else if (error.message.includes('network')) {
                errorMessage = "Erreur de connexion réseau";
            } else if (error.message.includes('timeout')) {
                errorMessage = "Délai d'attente dépassé";
            }
            
            setApiError(errorMessage);
            
            if (error.message.includes('500') || error.message.includes('network')) {
                setIsRetrying(true);
                setTimeout(() => {
                    setApiError(null);
                    setIsRetrying(false);
                    translateText(text);
                }, 3000);
            }
        } finally {
            isProcessingRef.current = false;
            setIsTranslating(false);
            abortControllerRef.current = null;
        }
    }, [targetLang, translatedText, scrollToBottom, splitTextIntoSegments]);
    
    // Gestion de la transcription avec debounce optimisé
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        const processTranscript = () => {
            const newText = fullTranscript.substring(sentTranscriptRef.current.length).trim();
            // Réduire le seuil minimum pour une réactivité accrue
            if (newText.length > 0) { 
                console.log('Nouveau texte à traduire:', newText);
                sentTranscriptRef.current = fullTranscript;
                translateText(newText);
            }
        };
        
        if (isListening && fullTranscript) {
            // Utiliser un délai adaptatif : plus court au début, puis plus long
            const isFirstTranslation = sentTranscriptRef.current.length === 0;
            const debounceDelay = isFirstTranslation ? 300 : 1000;
            
            debounceTimerRef.current = window.setTimeout(processTranscript, debounceDelay);
            
            // Pour la première traduction, ajouter un indicateur visuel
            if (sentTranscriptRef.current.length === 0) {
                setIsPendingTranslation(true);
            }
        } else if (!isListening && fullTranscript.length > sentTranscriptRef.current.length) {
            setIsPendingTranslation(false);
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
            setIsPendingTranslation(false);
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
                    className="bg-white p-6 h-full w-full rounded-lg shadow-inner"
                    style={{ 
                        overflowY: 'scroll',
                        overflowX: 'hidden',
                        maxHeight: '100%',
                        scrollBehavior: 'auto' // Changé de 'smooth' à 'auto' pour plus de réactivité
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
                        {(isTranslating || isRetrying || isPendingTranslation) && (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <div className={`w-2 h-2 rounded-full animate-pulse ${
                                    isPendingTranslation ? 'bg-orange-500' : 'bg-green-500'
                                }`}></div>
                                {isRetrying ? 'Reconnexion...' : 
                                 isPendingTranslation ? 'Traduction imminente...' : 
                                 'Traduction en cours...'}
                            </div>
                        )}
                    </div>
                    
                    {!isListening && !translatedText && !isPendingTranslation ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 -mt-8">
                            <Languages size={48} className="mb-4 text-slate-400" />
                            <h3 className="text-lg font-semibold">Prêt à traduire</h3>
                            <p>Appuyez sur le bouton du microphone pour commencer.</p>
                        </div>
                    ) : (
                        <>
                            {isPendingTranslation && !translatedText && (
                                <div className="flex items-center justify-center text-orange-600 text-sm mb-4">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
                                    Préparation de la traduction...
                                </div>
                            )}
                            <div className="text-slate-800 whitespace-pre-wrap leading-relaxed text-lg break-words">
                                {translatedText}
                                {(isTranslating || isRetrying || isPendingTranslation) && (
                                    <span className={`inline-block w-2.5 h-6 animate-pulse ml-1 align-bottom rounded-sm ${
                                        isPendingTranslation ? 'bg-orange-500' : 'bg-slate-600'
                                    }`}></span>
                                )}
                            </div>
                        </>
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