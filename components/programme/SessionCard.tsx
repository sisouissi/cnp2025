
import React from 'react';
import type { Session } from '../../types';
import { getThemeColor } from '../../constants';
import { useAgenda } from '../../context/AgendaContext';
import { Heart, Plus, Check, Clock, MapPin, Users } from 'lucide-react';

interface SessionCardProps {
  session: Session;
  onCardClick: (session: Session) => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onCardClick }) => {
  const { personalAgenda, favorites, toggleFavorite, addToAgenda, removeFromAgenda } = useAgenda();
  const isFavorite = favorites.has(session.id);
  const isInAgenda = personalAgenda.some(s => s.id === session.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(session.id);
  };

  const handleAgendaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInAgenda) {
      removeFromAgenda(session.id);
    } else {
      addToAgenda(session);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md border border-slate-200/80 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
      onClick={() => onCardClick(session)}
    >
      <div className={`p-5 text-white ${getThemeColor(session.theme)}`}>
        <div className="flex items-center space-x-3 mb-2">
          <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-white/20`}>{session.type}</span>
          {session.isParallel && <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-white/20 rounded-full">Parallèle</span>}
        </div>
        <h3 className="text-lg font-bold">{session.title}</h3>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <div className="space-y-2.5 text-sm text-slate-600 mb-4 flex-grow">
          <div className="flex items-center">
            <Clock size={14} className="mr-2.5 text-slate-400 flex-shrink-0" />
            <span>{session.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {session.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
          <div className="flex items-center">
             <MapPin size={14} className="mr-2.5 text-slate-400 flex-shrink-0" />
            <span>{session.location}</span>
          </div>
           {session.speakers.length > 0 && (
             <div className="flex items-start">
                <Users size={14} className="mr-2.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{session.speakers.map(s => s.name).join(', ')}</span>
             </div>
           )}
           {session.description && (
             <div className="text-slate-500 italic pt-2 space-y-1.5">
               {session.description.split(/(?<=[.?!])\s+/).filter(s => s.trim()).map((sentence, index) => (
                 <p key={index}>{sentence}</p>
               ))}
             </div>
           )}
        </div>
       
        <div className="flex items-center justify-end space-x-2 mt-auto pt-4 border-t border-slate-100">
          <button onClick={handleFavoriteClick} aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} className={`p-2.5 rounded-full transition-colors duration-200 ${isFavorite ? 'text-rose-500 bg-rose-100' : 'text-slate-500 bg-slate-100 hover:bg-rose-100 hover:text-rose-500'}`}>
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button onClick={handleAgendaClick} aria-label={isInAgenda ? 'Retirer de mon agenda' : 'Ajouter à mon agenda'} className={`p-2.5 rounded-full transition-colors duration-200 ${isInAgenda ? 'bg-[#033238] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
            {isInAgenda ? <Check size={18} /> : <Plus size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
