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
    const [targetLang, setTargetLang] = useState('en'); // Anglais par défaut
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
    
    // Fonction pour diviser le texte en petits fragments pour une traduction rapide
    const splitIntoFragments = useCallback((text: string): string[] => {
        // Diviser en phrases complètes mais en fragments plus petits
        const sentences = text.split(/(?<=[.!?])\s+/);
        const fragments: string[] = [];
        
        for (const sentence of sentences) {
            if (sentence.length > 100) {
                // Diviser les longues phrases en fragments de ~100 caractères
                let remaining = sentence;
                while (remaining.length > 0) {
                    const fragment = remaining.substring(0, 100);
                    fragments.push(fragment);
                    remaining = remaining.substring(100);
                }
            } else {
                fragments.push(sentence);
            }
        }
        
        return fragments.filter(fragment => fragment.trim().length > 0);
    }, []);
    
    // Défilement automatique optimisé
    const scrollToBottom = useCallback(() => {
        if (translatedPanelRef.current) {
            // Utiliser requestAnimationFrame pour un défilement fluide
            requestAnimationFrame(() => {
                const element = translatedPanelRef.current;
                if (element) {
                    // Forcer le défilement immédiat en bas
                    element.scrollTop = element.scrollHeight;
                    console.log('📜 Scroll automatique effectué');
                }
            });
        }
    }, []);
    
    // Effet pour le défilement automatique à chaque mise à jour du texte
    useEffect(() => {
        if (translatedText) {
            scrollToBottom();
        }
    }, [translatedText, scrollToBottom]);
    
    // Traduction optimisée pour une latence minimale
    const translateFragment = useCallback(async (fragment: string): Promise<string> => {
        if (!fragment.trim()) return '';
        
        console.log('🔥 Traduction du fragment:', fragment.substring(0, 50) + '...');
        
        try {
            const response = await fetch('/api/groq-proxy', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'translate',
                    payload: { 
                        text: fragment.trim(), 
                        targetLang: targetLang
                    }
                }),
            });
            
            if (!response.ok) {
                throw new Error(`Erreur serveur: ${response.status}`);
            }
            
            const data = await response.json();
            return data.result || '';
        } catch (error) {
            console.error('Erreur de traduction:', error);
            throw error;
        }
    }, [targetLang]);
    
    // Gestion de la transcription avec traitement en temps réel
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        const processTranscript = async () => {
            const newText = fullTranscript.substring(sentTranscriptRef.current.length).trim();
            if (newText.length > 0) {
                console.log('Nouveau texte à traiter:', newText);
                sentTranscriptRef.current = fullTranscript;
                
                // Diviser en fragments pour une traduction rapide
                const fragments = splitIntoFragments(newText);
                
                // Traiter chaque fragment
                for (const fragment of fragments) {
                    if (fragment.trim()) {
                        setIsTranslating(true);
                        setIsPendingTranslation(false);
                        
                        try {
                            const translatedFragment = await translateFragment(fragment);
                            
                            // Ajouter le fragment traduit au texte existant (sans saut de ligne)
                            setTranslatedText(prev => prev + (prev ? ' ' : '') + translatedFragment);
                        } catch (error) {
                            console.error('Erreur lors de la traduction du fragment:', error);
                            setApiError("Erreur de traduction. Nouvelle tentative...");
                            
                            // Réessayer après un court délai
                            setTimeout(() => {
                                translateFragment(fragment).then(translatedFragment => {
                                    setTranslatedText(prev => prev + (prev ? ' ' : '') + translatedFragment);
                                    setApiError(null);
                                });
                            }, 1000);
                        } finally {
                            setIsTranslating(false);
                        }
                    }
                }
            }
        };
        
        if (isListening && fullTranscript) {
            // Délai très court pour une réactivité maximale
            debounceTimerRef.current = window.setTimeout(processTranscript, 300);
            
            // Indicateur visuel pendant l'attente
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
    }, [fullTranscript, isListening, translateFragment, splitIntoFragments]);
    
    const handleToggleListening = useCallback(() => {
        if (isListening) {
            stopListening();
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
                        scrollBehavior: 'auto' // Utiliser 'auto' pour un défilement instantané
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                            Traduction en temps réel
                            {detectedLanguage && (
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
                                 isPendingTranslation ? 'Écoute en cours...' : 
                                 'Traduction en cours...'}
                            </div>
                        )}
                    </div>
                    
                    {!isListening && !translatedText && !isPendingTranslation ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 -mt-8">
                            <Languages size={48} className="mb-4 text-slate-400" />
                            <h3 className="text-lg font-semibold">Prêt à traduire</h3>
                            <p>Appuyez sur le bouton du microphone pour commencer la traduction en temps réel.</p>
                        </div>
                    ) : (
                        <>
                            {isPendingTranslation && !translatedText && (
                                <div className="flex items-center justify-center text-orange-600 text-sm mb-4">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-2"></div>
                                    Écoute de la conférence en cours...
                                </div>
                            )}
                            <div className="text-slate-800 leading-relaxed text-lg break-words">
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
                        {isListening ? 'Arrêter la traduction' : 'Démarrer la traduction'}
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