
import React, { useState, useMemo, useEffect } from 'react';
import type { Tab } from '../App';
import type { Filters, Session } from '../types';
import { SESSIONS_DATA, DAYS, THEMES, TYPES } from '../constants';
import SchedulerView from '../components/programme/SchedulerView';
import ListView from '../components/programme/ListView';
import { useAgenda } from '../context/AgendaContext';
import { SlidersHorizontal, List, GanttChartSquare, X } from 'lucide-react';

interface ProgrammePageProps {
  setActiveTab: (tab: Tab) => void;
  searchSelectedSessionId: string | null;
  clearSearchSelection: () => void;
}

const ProgrammePage: React.FC<ProgrammePageProps> = ({ setActiveTab, searchSelectedSessionId, clearSearchSelection }) => {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [filters, setFilters] = useState<Filters>({ theme: '', type: '', speaker: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'scheduler' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const { showSessionModal } = useAgenda();

  useEffect(() => {
    if (searchSelectedSessionId) {
      const session = SESSIONS_DATA.find(s => s.id === searchSelectedSessionId);
      if (session) {
        showSessionModal(session);
      }
      clearSearchSelection();
    }
  }, [searchSelectedSessionId, showSessionModal, clearSearchSelection]);

  const handleDaySelection = (dayKey: string) => {
    setSelectedDay(dayKey);
    if (dayKey === 'all') {
      setViewMode('list');
    } else {
      setViewMode('scheduler');
    }
  };

  const filteredSessions = useMemo(() => {
    let sessions;
    if (selectedDay === 'all') {
      sessions = [...SESSIONS_DATA].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    } else {
      sessions = SESSIONS_DATA.filter(session => session.startTime.getDate() === parseInt(selectedDay));
    }

    let sessionsToFilter = sessions;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      sessionsToFilter = sessionsToFilter.filter(session => 
        session.title.toLowerCase().includes(query) ||
        session.theme.toLowerCase().includes(query) ||
        session.type.toLowerCase().includes(query) ||
        session.speakers.some(s => s.name.toLowerCase().includes(query))
      );
    }

    return sessionsToFilter.filter(session => {
      const matchesTheme = !filters.theme || session.theme === filters.theme;
      const matchesType = !filters.type || session.type === filters.type;
      const matchesSpeaker = !filters.speaker || session.speakers.some(speaker => speaker.name.toLowerCase().includes(filters.speaker.toLowerCase()));
      return matchesTheme && matchesType && matchesSpeaker;
    });
  }, [selectedDay, filters, searchQuery]);

  const resetFilters = () => {
    setFilters({ theme: '', type: '', speaker: '' });
    setSearchQuery('');
  }

  const hasActiveFilters = filters.theme || filters.type || filters.speaker || searchQuery;
  const hasDropdownFilters = filters.theme || filters.type || filters.speaker;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tighter">Programme</h1>
          <div className="flex items-center space-x-1 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => handleDaySelection('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                selectedDay === 'all'
                  ? 'bg-white text-[#033238] shadow-md'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Tous
            </button>
            {DAYS.map((day) => (
              <button
                key={day.key}
                onClick={() => handleDaySelection(day.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedDay === day.key
                    ? 'bg-white text-[#033238] shadow-md'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      
        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-slate-200 mb-6 sticky top-20 z-30">
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex-grow min-w-0" style={{ flexBasis: '400px' }}>
                     <input
                        type="text"
                        placeholder="Rechercher une session, thème, orateur..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-[#68A0A8] focus:border-[#68A0A8]"
                    />
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            showFilters || hasDropdownFilters ? 'bg-[#033238] text-white' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                        }`}
                    >
                        <SlidersHorizontal size={16}/>
                        <span>Filtres</span>
                    </button>

                    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('scheduler')}
                            disabled={selectedDay === 'all'}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                viewMode === 'scheduler' ? 'bg-white text-[#033238] shadow-sm' : 'text-slate-600 hover:bg-white/60'
                            } ${selectedDay === 'all' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Vue Planning"
                        >
                            <GanttChartSquare size={16}/>
                            <span className="hidden sm:inline">Planning</span>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                viewMode === 'list' ? 'bg-white text-[#033238] shadow-sm' : 'text-slate-600 hover:bg-white/60'
                            }`}
                            title="Vue Liste"
                        >
                           <List size={16}/>
                           <span className="hidden sm:inline">Liste</span>
                        </button>
                    </div>

                    {hasActiveFilters && (
                        <button
                            onClick={resetFilters}
                            className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 p-2.5 rounded-lg hover:bg-slate-100"
                            title="Réinitialiser les filtres"
                        >
                            <X size={16}/>
                        </button>
                    )}
                </div>
            </div>

             {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200 animate-fade-in-up">
                <select value={filters.theme} onChange={(e) => setFilters({ ...filters, theme: e.target.value === 'Tous' ? '' : e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full bg-white">
                  {THEMES.map(theme => <option key={theme} value={theme}>{theme}</option>)}
                </select>
                <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value === 'Tous' ? '' : e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full bg-white">
                  {TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <input type="text" placeholder="Filtrer par orateur..." value={filters.speaker} onChange={(e) => setFilters({ ...filters, speaker: e.target.value })} className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full bg-white" />
              </div>
            )}
        </div>

        <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-800">{selectedDay === 'all' ? 'Programme Complet' : DAYS.find(d => d.key === selectedDay)?.label}</h2>
            <p className="text-slate-500">{selectedDay === 'all' ? '27 - 29 Novembre 2025' : DAYS.find(d => d.key === selectedDay)?.date}</p>
        </div>

        {viewMode === 'scheduler' ? 
            <SchedulerView sessions={filteredSessions} onSessionClick={showSessionModal} /> : 
            <ListView sessions={filteredSessions} onSessionClick={showSessionModal} />
        }
      </main>
    </div>
  );
};

export default ProgrammePage;