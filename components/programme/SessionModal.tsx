import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '../../types';
import { getThemeColor } from '../../constants';
import { useAgenda } from '../../context/AgendaContext';
import { X, Check, Plus, Heart, Mic, BrainCircuit, Loader, AlertTriangle, Languages } from 'lucide-react';
import Groq from 'groq-sdk';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import LiveTranslator from './LiveTranslator';

interface SessionModalProps {
  session: Session;
  onClose: () => void;
  startRecordingOnOpen?: boolean;
}

const SessionModal: React.FC<SessionModalProps> = ({ session, onClose, startRecordingOnOpen = false }) => {
  const { 
    personalAgenda, 
    favorites, 
    summaries,
    toggleFavorite, 
    addToAgenda, 
    removeFromAgenda,
    addSummary
  } = useAgenda();

  const isFavorite = favorites.has(session.id);
  const isInAgenda = personalAgenda.some(s => s.id === session.id);
  const existingSummary = summaries[session.id];

  const [processingState, setProcessingState] = useState<'idle' | 'recording' | 'summarizing' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isTranslatorVisible, setIsTranslatorVisible] = useState(false);

  const { 
    isListening, 
    finalTranscript, 
    error: recognitionError, 
    startListening, 
    stopListening, 
    hasRecognitionSupport 
  } = useSpeechRecognition();

  const handleRecordClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      setProcessingState('recording');
      setErrorMessage('');
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    if (startRecordingOnOpen && hasRecognitionSupport && !existingSummary) {
      handleRecordClick();
    }
  }, [startRecordingOnOpen, hasRecognitionSupport, existingSummary, handleRecordClick]);

  useEffect(() => {
    if (recognitionError) {
      setProcessingState('error');
      setErrorMessage(recognitionError);
    }
  }, [recognitionError]);

  useEffect(() => {
    // When listening stops and we have a transcript, start summarizing
    if (!isListening && finalTranscript && processingState === 'recording') {
      generateSummary(finalTranscript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, finalTranscript, processingState]);

  const generateSummary = async (text: string) => {
    setProcessingState('summarizing');
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, dangerouslyAllowBrowser: true });
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Tu es un assistant expert en pneumologie. Ton rôle est de résumer des transcriptions de conférences de manière concise et claire, en structurant le résumé en quelques points clés importants sur des lignes séparées."
          },
          {
            role: "user",
            content: `Voici la transcription:\n\n"${text}"`
          }
        ],
        model: "llama3-8b-8192"
      });

      const summaryText = completion.choices[0]?.message?.content || null;

      if (summaryText) {
        addSummary(session.id, summaryText);
        setProcessingState('idle');
      } else {
        throw new Error("Le résumé généré est vide. La transcription était peut-être trop courte ou inaudible.");
      }
    } catch (e) {
      console.error(e);
      setProcessingState('error');
      setErrorMessage(e instanceof Error ? e.message : "Une erreur inconnue est survenue lors de la génération du résumé.");
    }
  };

  const renderSummaryTool = () => {
    if (!hasRecognitionSupport) {
      return (
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 p-3 rounded-lg">
          <AlertTriangle size={16} />
          <span>L'enregistrement audio n'est pas supporté par votre navigateur.</span>
        </div>
      );
    }

    if (existingSummary) {
      return (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <BrainCircuit size={20} className="text-[#033238]" /> Résumé par IA
          </h3>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 prose prose-sm max-w-none">
            {existingSummary.split('\n').map((line, i) => (
              line.trim() ? <p key={i} className="text-slate-700 my-1">{line}</p> : null
            ))}
          </div>
        </div>
      );
    }

    const buttonContent = {
      idle: { icon: <Mic size={16} />, text: "Enregistrer & Résumer" },
      recording: { icon: <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>, text: "Enregistrement..." },
      summarizing: { icon: <Loader size={16} className="animate-spin" />, text: "Génération en cours..." },
      error: { icon: <Mic size={16} />, text: "Réessayer l'enregistrement" }
    };

    const currentContent = processingState === 'recording' ? buttonContent.recording : buttonContent[processingState];

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Générer un résumé avec l'IA</h3>
        <p className="text-sm text-slate-500 mb-3">Enregistrez l'audio de la session pour obtenir un résumé généré automatiquement par l'IA.</p>
        <button
          onClick={handleRecordClick}
          disabled={processingState === 'summarizing'}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 text-white
            ${processingState === 'recording' ? 'bg-rose-600 hover:bg-rose-700 shadow-lg scale-105' : 'bg-[#033238] hover:bg-[#02262B]'}
            ${processingState === 'summarizing' ? 'bg-slate-400 cursor-not-allowed' : ''}
          `}
        >
          {currentContent.icon} {currentContent.text}
        </button>
        {processingState === 'recording' && <p className="text-sm text-center text-rose-600 font-medium">Cliquez pour arrêter.</p>}
        {processingState === 'error' && (
          <div className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 p-3 rounded-lg">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold">Erreur :</span> {errorMessage}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className={`p-6 rounded-t-2xl text-white ${getThemeColor(session.theme)}`}>
           <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-white/20`}>{session.type}</span>
                {session.isParallel && <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-white/20 rounded-full">Parallèle</span>}
              </div>
              <h2 className="text-2xl font-bold">{session.title}</h2>
              <p className="opacity-80 mt-1">
                {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | {session.location}
              </p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1 -m-1 rounded-full hover:bg-white/20 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>
        
        {isTranslatorVisible ? (
          <LiveTranslator session={session} onBack={() => setIsTranslatorVisible(false)} />
        ) : (
          <>
            <div className="p-6 overflow-y-auto">
              {session.introduction && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Introduction</h3>
                  <p className="text-slate-700 leading-relaxed">{session.introduction}</p>
                </div>
              )}

              {session.objectives && session.objectives.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Objectifs de la séance</h3>
                  <ul className="space-y-2">
                    {session.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className={`w-2 h-2 ${getThemeColor(session.theme)} rounded-full mt-2 mr-3 flex-shrink-0`}></span>
                        <span className="text-slate-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {session.details.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Programme détaillé</h3>
                  <ul className="space-y-2">
                    {session.details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <span className={`w-2 h-2 ${getThemeColor(session.theme)} rounded-full mt-2 mr-3 flex-shrink-0`}></span>
                        <span className="text-slate-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {session.speakers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Orateurs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {session.speakers.map((speaker, index) => (
                      <div key={index} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-lg font-medium text-slate-600 flex-shrink-0">
                          {speaker.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-slate-900">{speaker.name}</div>
                          <div className="text-sm text-slate-600">{speaker.specialty}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
                {renderSummaryTool()}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Languages size={20} className="text-[#033238]" /> Traduction en direct
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">Obtenez une traduction en temps réel de la conférence dans plusieurs langues, propulsée par l'IA.</p>
                  <button
                    onClick={() => setIsTranslatorVisible(true)}
                    disabled={!hasRecognitionSupport}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    <Mic size={16} /> Lancer le traducteur
                  </button>
                   {!hasRecognitionSupport && <p className="text-xs text-slate-500 mt-2 text-center">La traduction en direct n'est pas supportée par votre navigateur.</p>}
                </div>
              </div>

            </div>
            <div className="flex flex-wrap gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                <button onClick={() => toggleFavorite(session.id)} className={`flex items-center justify-center gap-2 w-full sm:w-auto flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${isFavorite ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>
                    <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'}/>
                    {isFavorite ? 'Dans vos favoris' : 'Ajouter aux favoris'}
                </button>
                <button onClick={() => { isInAgenda ? removeFromAgenda(session.id) : addToAgenda(session); }} className={`flex items-center justify-center gap-2 w-full sm:w-auto flex-1 px-4 py-2.5 rounded-lg font-semibold transition-colors ${isInAgenda ? 'bg-[#d9e5e7] text-[#033238]' : 'bg-[#033238] text-white hover:bg-[#02262B]'}`}>
                    {isInAgenda ? <Check size={16}/> : <Plus size={16}/>}
                    {isInAgenda ? 'Retirer de l\'agenda' : 'Ajouter à l\'agenda'}
                </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SessionModal;