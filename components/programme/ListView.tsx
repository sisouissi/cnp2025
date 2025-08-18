import React, { useMemo } from 'react';
import type { Session } from '../../types';
import SessionCard from './SessionCard';

interface ListViewProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
}

const ListView: React.FC<ListViewProps> = ({ sessions, onSessionClick }) => {
  const hasMultipleDays = useMemo(() => {
    if (sessions.length < 2) return false;
    const firstDay = sessions[0]?.startTime.getDate();
    return sessions.some(s => s.startTime.getDate() !== firstDay);
  }, [sessions]);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-medium text-slate-900 mb-2">Aucune session trouvée</h3>
        <p className="text-slate-500">Essayez d'ajuster vos filtres ou votre recherche.</p>
      </div>
    );
  }

  if (hasMultipleDays) {
    const groupedByDay = sessions.reduce<Record<string, Session[]>>((acc, session) => {
        const dayKey = session.startTime.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
        if (!acc[dayKey]) {
          acc[dayKey] = [];
        }
        acc[dayKey].push(session);
        return acc;
    }, {});
    
    const dayKeys = Object.keys(groupedByDay);

    return (
        <div className="space-y-10">
            {dayKeys.map(dayKey => {
                const daySessions = groupedByDay[dayKey];
                const groupedByTime = daySessions.reduce<Record<string, Session[]>>((acc, session) => {
                    const timeKey = session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    if (!acc[timeKey]) {
                      acc[timeKey] = [];
                    }
                    acc[timeKey].push(session);
                    return acc;
                }, {});
                const sortedTimeKeys = Object.keys(groupedByTime).sort();
                
                return (
                    <section key={dayKey} aria-labelledby={`day-header-${dayKey.replace(/\s/g, '-')}`}>
                        <h2 id={`day-header-${dayKey.replace(/\s/g, '-')}`} className="text-2xl font-bold text-slate-900 mb-6 sticky top-40 bg-slate-50/80 backdrop-blur-md py-3 z-10 border-b-2 border-[#033238]">{dayKey}</h2>
                        <div className="space-y-8">
                            {sortedTimeKeys.map(time => (
                                <div key={time} className="relative">
                                    <div className="absolute left-0 top-1.5 flex items-center justify-center -translate-x-full pr-4 md:pr-8">
                                        <span className="font-bold text-[#033238] text-lg bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200">{time}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 border-slate-200">
                                        {groupedByTime[time].map(session => (
                                            <SessionCard key={session.id} session={session} onCardClick={onSessionClick} />
                                        ))}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
  }

  const groupedSessions = sessions.reduce<Record<string, Session[]>>((acc, session) => {
    const timeKey = session.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(session);
    return acc;
  }, {});

  const sortedTimeKeys = Object.keys(groupedSessions).sort();

  return (
    <div className="space-y-8">
      {sortedTimeKeys.map(time => (
        <div key={time} className="relative">
            <div className="absolute left-0 top-1.5 flex items-center justify-center -translate-x-full pr-4 md:pr-8">
                <span className="font-bold text-[#033238] text-lg bg-white px-2 py-1 rounded-md shadow-sm border border-slate-200">{time}</span>
            </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 border-slate-200">
             {groupedSessions[time].map(session => (
              <SessionCard key={session.id} session={session} onCardClick={onSessionClick} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListView;