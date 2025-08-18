import React, { useState, useMemo } from 'react';
import type { Tab } from '../App';
import type { Speaker } from '../types';
import { SESSIONS_DATA } from '../constants';
import SpeakerSessionsModal from '../components/speakers/SpeakerSessionsModal';
import { Search, User } from 'lucide-react';

interface SpeakersPageProps {
  setActiveTab: (tab: Tab) => void;
}

const SpeakersPage: React.FC<SpeakersPageProps> = ({ setActiveTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  const speakersData = useMemo(() => {
    const speakerMap = new Map<string, { speaker: Speaker; interventions: number }>();
    SESSIONS_DATA.forEach(session => {
      session.speakers.forEach(speaker => {
        if (speakerMap.has(speaker.name)) {
          speakerMap.get(speaker.name)!.interventions++;
        } else {
          speakerMap.set(speaker.name, { speaker, interventions: 1 });
        }
      });
    });

    const allSpeakers = Array.from(speakerMap.values()).sort((a, b) => a.speaker.name.localeCompare(b.speaker.name));

    if (!searchQuery) {
        return allSpeakers;
    }
    const query = searchQuery.toLowerCase();
    return allSpeakers.filter(({ speaker }) => 
        speaker.name.toLowerCase().includes(query) || speaker.specialty.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tighter mb-6">Orateurs</h1>
            <div className="mb-8 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Rechercher un orateur par nom ou spécialité..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-slate-200 bg-white focus:ring-[#68A0A8] focus:border-[#68A0A8] transition-colors shadow-sm"
                />
            </div>

            {speakersData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {speakersData.map(({ speaker, interventions }) => (
                    <button 
                        key={speaker.name} 
                        onClick={() => setSelectedSpeaker(speaker)}
                        className="bg-white rounded-xl shadow-md border border-slate-200/80 p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-[#68A0A8] focus:ring-offset-2"
                    >
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-2xl font-medium text-slate-600 flex-shrink-0">
                        {speaker.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                        <h3 className="font-bold text-slate-800 text-lg">{speaker.name}</h3>
                        <p className="text-sm text-[#033238] font-medium">{speaker.specialty}</p>
                        </div>
                    </div>
                    <div className="text-sm text-slate-500 border-t border-slate-100 pt-4 mt-4">
                        {interventions} intervention{interventions > 1 ? 's' : ''}
                    </div>
                    </button>
                ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
                    <User className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                    <h3 className="text-xl font-medium text-slate-900 mb-2">Aucun orateur trouvé</h3>
                    <p className="text-slate-500">Essayez une autre recherche.</p>
                </div>
            )}
        </main>
      </div>

      {selectedSpeaker && (
        <SpeakerSessionsModal 
            speaker={selectedSpeaker} 
            onClose={() => setSelectedSpeaker(null)}
        />
      )}
    </>
  );
};

export default SpeakersPage;