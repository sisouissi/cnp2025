import React, { useMemo } from 'react';
import type { Speaker, Session } from '../../types';
import { SESSIONS_DATA, getThemeColor } from '../../constants';
import { X, Clock, MapPin } from 'lucide-react';
import { useAgenda } from '../../context/AgendaContext';

interface SpeakerSessionsModalProps {
  speaker: Speaker;
  onClose: () => void;
}

const SpeakerSessionsModal: React.FC<SpeakerSessionsModalProps> = ({ speaker, onClose }) => {
  const { showSessionModal } = useAgenda();
  
  const speakerSessions = useMemo(() => {
    return SESSIONS_DATA
      .filter(session => session.speakers.some(s => s.name === speaker.name))
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [speaker.name]);

  const handleSessionClick = (session: Session) => {
    showSessionModal(session);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex items-start justify-between flex-shrink-0 bg-slate-50 rounded-t-xl">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-xl font-medium text-slate-600 flex-shrink-0">
                    {speaker.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{speaker.name}</h2>
                    <p className="text-[#033238] mt-1 font-semibold">{speaker.specialty}</p>
                </div>
            </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 p-2 -m-2 rounded-full hover:bg-slate-200 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Interventions ({speakerSessions.length})</h3>
            {speakerSessions.length > 0 ? (
                <div className="space-y-4">
                    {speakerSessions.map(session => (
                        <button 
                            key={session.id}
                            onClick={() => handleSessionClick(session)}
                            className={`w-full text-left p-4 rounded-lg border-l-4 ${getThemeColor(session.theme).replace('bg-','border-')} bg-slate-50 hover:bg-slate-100 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#68A0A8]`}
                        >
                            <p className="font-semibold text-slate-800">{session.title}</p>
                            <div className="text-sm text-slate-600 mt-2 space-y-1.5">
                                <p className="flex items-center">
                                    <Clock size={14} className="mr-2 flex-shrink-0 text-slate-400" />
                                    {session.startTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric'})}, {session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {session.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="flex items-center">
                                    <MapPin size={14} className="mr-2 flex-shrink-0 text-slate-400" />
                                    {session.location}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <p className="text-slate-500">Aucune intervention programmée pour cet orateur.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default SpeakerSessionsModal;
