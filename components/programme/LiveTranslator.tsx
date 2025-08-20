import React, { useState, useEffect, useRef } from 'react';
import type { Session } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { ArrowLeft, Mic, Square, Loader2, Languages, AlertCircle, Maximize, Minimize } from 'lucide-react';

const LANGUAGES = [
    { code: 'en', name: 'Anglais' },
    { code: 'es', name: 'Espagnol' },
    { code: 'ar', name: 'Arabe' },
];

interface LiveTranslatorProps {
    session: Session;
    onBack: () => void;
}

const LiveTranslator: React.FC<LiveTranslatorProps> = ({ session, onBack }) => {
    const [targetLang, setTargetLang] = useState('en');
    const [translatedText, setTranslatedText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [fullscreenPanel, setFullscreenPanel] = useState<'none' | 'original' | 'translated'>('none');
    const { isListening, finalTranscript, interimTranscript, startListening, stopListening, error: recognitionError } = useSpeechRecognition();
    
    const lastTranslatedRef = useRef('');
    const originalPanelRef = useRef<HTMLDivElement>(null);
    const translatedPanelRef = useRef<HTMLDivElement>(null);
    
    const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            ref.current.scrollTop = ref.current.scrollHeight;
        }
    };

    useEffect(() => {
        if (finalTranscript.length > lastTranslatedRef.current.length) {
            const newTextToTranslate = finalTranscript.substring(lastTranslatedRef.current.length);
            lastTranslatedRef.current = finalTranscript;
            translateText(newTextToTranslate.trim());
        }
    }, [finalTranscript, targetLang]);

    useEffect(() => {
        scrollToBottom(originalPanelRef);
    }, [finalTranscript, interimTranscript]);
    
    useEffect(() => {
        scrollToBottom(translatedPanelRef);
    }, [translatedText]);

    const translateText = async (text: string) => {
        if (!text) return;
        
        setIsTranslating(true);
        setApiError(null);
        try {
            const langName = LANGUAGES.find(l => l.code === targetLang)?.name || 'English';
            
            const response = await fetch('/api/groq-proxy', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'translate',
                payload: { text: text, langName: langName }
              })
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = "Une erreur est survenue lors de la traduction.";
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || errorMessage;
                } catch (e) {
                    console.error("Server returned non-JSON error:", errorText);
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            const translation = data.result;

            if (translation) {
                setTranslatedText(prev => prev + translation + ' ');
            }
        } catch (e) {
            console.error(e);
            setApiError(e instanceof Error ? e.message : "Erreur de traduction.");
        } finally {
            setIsTranslating(false);
        }
    };

    const handleToggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            setTranslatedText('');
            lastTranslatedRef.current = '';
            startListening();
        }
    };
    
    return (
        <div className="flex flex-col flex-grow min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors">
                    <ArrowLeft size={20} /> Retour
                </button>
                <div className="flex items-center gap-2">
                    <Languages size={16} className="text-slate-500" />
                    <select value={targetLang} onChange={e => setTargetLang(e.target.value)} className="border-slate-300 rounded-md py-1.5 px-2 text-sm focus:ring-sky-500 focus:border-sky-500">
                        {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                </div>
            </div>
            
            {/* Content Panels */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-200 overflow-hidden">
                <div ref={originalPanelRef} className={`bg-white p-4 overflow-y-auto relative ${fullscreenPanel === 'translated' ? 'hidden md:hidden' : ''} ${fullscreenPanel === 'original' ? 'md:col-span-2' : ''}`}>
                    <div className="sticky top-0 bg-white z-10 -mx-4 -mt-4 px-4 pt-4 pb-2 mb-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Original (Français)</h3>
                            <button 
                                onClick={() => setFullscreenPanel(fullscreenPanel === 'original' ? 'none' : 'original')}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
                                title={fullscreenPanel === 'original' ? 'Quitter le plein écran' : 'Plein écran'}
                            >
                                {fullscreenPanel === 'original' ? <Minimize size={16} /> : <Maximize size={16} />}
                            </button>
                        </div>
                    </div>
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{finalTranscript}<span className="text-slate-400">{interimTranscript}</span></p>
                </div>
                <div ref={translatedPanelRef} className={`bg-slate-50 p-4 overflow-y-auto relative ${fullscreenPanel === 'original' ? 'hidden md:hidden' : ''} ${fullscreenPanel === 'translated' ? 'md:col-span-2' : ''}`}>
                    <div className="sticky top-0 bg-slate-50 z-10 -mx-4 -mt-4 px-4 pt-4 pb-2 mb-2">
                         <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Traduction ({LANGUAGES.find(l=>l.code === targetLang)?.name})</h3>
                             <button 
                                onClick={() => setFullscreenPanel(fullscreenPanel === 'translated' ? 'none' : 'translated')}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
                                title={fullscreenPanel === 'translated' ? 'Quitter le plein écran' : 'Plein écran'}
                            >
                                {fullscreenPanel === 'translated' ? <Minimize size={16} /> : <Maximize size={16} />}
                            </button>
                        </div>
                    </div>
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{translatedText}</p>
                    {isTranslating && <Loader2 size={16} className="animate-spin text-slate-500 mt-2" />}
                </div>
            </div>
            
            {/* Footer / Controls */}
            <div className="p-4 border-t border-slate-200 flex-shrink-0 bg-slate-50 rounded-b-2xl">
                <div className="flex flex-col items-center">
                    <button onClick={handleToggleListening} className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 ${isListening ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#033238] hover:bg-[#02262B]'}`}>
                        {isListening ? <Square size={24} fill="white" /> : <Mic size={24} />}
                    </button>
                    <p className="text-sm text-slate-600 mt-2 font-medium">{isListening ? 'Arrêter la transcription' : 'Démarrer la transcription'}</p>
                    {(recognitionError || apiError) && (
                        <div className="mt-2 text-xs text-rose-600 flex items-center gap-1 bg-rose-50 p-2 rounded-md">
                            <AlertCircle size={14} /> {recognitionError || apiError}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveTranslator;