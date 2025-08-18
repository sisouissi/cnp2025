
import React, { useState, useMemo } from 'react';
import type { Tab } from '../App';
import type { Filters, Session } from '../types';
import { SESSIONS_DATA, DAYS, THEMES, TYPES } from '../constants';
import SchedulerView from '../components/programme/SchedulerView';
import ListView from '../components/programme/ListView';
import { useAgenda } from '../context/AgendaContext';
import { SlidersHorizontal, List, GanttChartSquare, X } from 'lucide-react';

interface ProgrammePageProps {
  setActiveTab: (tab: Tab) => void;
}

const ProgrammePage: React.FC<ProgrammePageProps> = ({ setActiveTab }) => {
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [filters, setFilters] = useState<Filters>({ theme: '', type: '', speaker: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'scheduler' | 'list'>('list');
  const { showSessionModal } = useAgenda();

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

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return sessions.filter(session => 
        session.title.toLowerCase().includes(query) ||
        session.theme.toLowerCase().includes(query) ||
        session.type.toLowerCase().includes(query) ||
        session.speakers.some(s => s.name.toLowerCase().includes(query))
      );
    }

    return sessions.filter(session => {
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                <div className="lg:col-span-3">
                     <input
                        type="text"
                        placeholder="Rechercher une session, thème, orateur..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-[#68A0A8] focus:border-[#68A0A8]"
                    />
                </div>
                <div className="flex items-center space-x-2">
                     <button
                        onClick={() => setViewMode('scheduler')}
                        disabled={selectedDay === 'all'}
                        className={`w-full flex justify-center items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === 'scheduler' ? 'bg-[#033238] text-white' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                        } ${selectedDay === 'all' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <GanttChartSquare size={16}/> Planning
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`w-full flex justify-center items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === 'list' ? 'bg-[#033238] text-white' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                        }`}
                    >
                       <List size={16}/> Liste
                    </button>
                </div>
                 {hasActiveFilters && <button
                    onClick={resetFilters}
                    className="text-sm text-slate-600 hover:text-[#033238] text-center flex items-center justify-center gap-1"
                 >
                    <X size={14}/> Réinitialiser
                </button>}
            </div>
             {!searchQuery && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
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
