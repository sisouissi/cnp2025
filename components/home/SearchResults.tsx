import React from 'react';
import type { Session } from '../../types';
import type { Tab } from '../../App';

interface SearchResultsProps {
    sessions: Session[];
    onSessionClick: (session: Session) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ sessions, onSessionClick }) => {
    if (sessions.length === 0) {
        return (
             <div className="bg-white p-6 rounded-lg border border-slate-200 text-center text-slate-500 shadow-sm">
                Aucun résultat trouvé.
            </div>
        )
    }

    return (
        <section className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-lg">
            <h2 className="text-lg font-bold text-slate-800 mb-3 px-2">Résultats de recherche</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
                {sessions.map(session => (
                    <div
                        key={session.id}
                        className="p-3 rounded-lg border border-transparent bg-white/50 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-pointer"
                        onClick={() => onSessionClick(session)}
                    >
                        <h3 className="font-semibold text-[#033238]">{session.title}</h3>
                        <p className="text-sm text-slate-600">
                            {session.startTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric' })} - {session.location}
                        </p>
                        {session.speakers.length > 0 && 
                            <p className="text-sm text-slate-500 mt-1">{session.speakers.map(s => s.name).join(', ')}</p>
                        }
                    </div>
                ))}
            </div>
        </section>
    );
};

export default SearchResults;