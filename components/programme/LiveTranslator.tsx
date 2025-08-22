import React, { useState, useEffect, useRef } from 'react';
import type { Session } from '../../types';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { ArrowLeft, Mic, Square, Languages, AlertCircle } from 'lucide-react';

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
    const { isListening, finalTranscript, startListening, stopListening, error: recognitionError } = useSpeechRecognition();
    
    const lastTranslatedRef = useRef('');
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
        scrollToBottom(translatedPanelRef);
    }, [translatedText, isTranslating]);

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

            if (!response.ok || !response.body) {
                const errorText = await response.text();
                let errorMessage = `Erreur serveur (${response.status}).`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.error || "Une erreur est survenue lors de la traduction.";
                } catch (e) {
                    console.error("Server returned non-JSON error:", errorText);
                    errorMessage = "Impossible de communiquer avec le serveur de traduction. Veuillez réessayer.";
                }
                throw new Error(errorMessage);
            }
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            setTranslatedText(prev => prev.trim() + ' ');

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

                for (const line of lines) {
                    const data = line.substring(6);
                    if (data === '[DONE]') {
                        setIsTranslating(false);
                        return;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        const contentDelta = parsed.choices[0]?.delta?.content;
                        if (contentDelta) {
                            setTranslatedText(prev => prev + contentDelta);
                        }
                    } catch (e) {
                        console.error('Error parsing stream data chunk:', data);
                    }
                }
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
            
            {/* Content Panel */}
            <div className="flex-grow bg-slate-100 overflow-hidden p-1 flex">
                <div ref={translatedPanelRef} className="bg-white p-6 overflow-y-auto h-full w-full rounded-lg shadow-inner">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Traduction ({LANGUAGES.find(l=>l.code === targetLang)?.name})</h3>
                    
                    { !isListening && !translatedText ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 -mt-8">
                            <Languages size={48} className="mb-4 text-slate-400" />
                            <h3 className="text-lg font-semibold">Prêt à traduire</h3>
                            <p>Appuyez sur le bouton du microphone pour commencer.</p>
                        </div>
                    ) : (
                        <p className="text-slate-800 whitespace-pre-wrap leading-relaxed text-lg">
                            {translatedText}
                            {isTranslating && <span className="inline-block w-2.5 h-6 bg-slate-600 animate-pulse ml-1 align-bottom rounded-sm"></span>}
                        </p>
                    )}
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