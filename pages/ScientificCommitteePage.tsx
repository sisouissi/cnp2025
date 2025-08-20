
import React from 'react';
import type { Tab } from '../App';
import { SCIENTIFIC_COMMITTEE_DATA } from '../constants';
import { Award } from 'lucide-react';

interface ScientificCommitteePageProps {
  setActiveTab: (tab: Tab) => void;
}

const ScientificCommitteePage: React.FC<ScientificCommitteePageProps> = ({ setActiveTab }) => {
  const president = SCIENTIFIC_COMMITTEE_DATA.find(m => m.role === 'Président');
  const members = SCIENTIFIC_COMMITTEE_DATA.filter(m => m.role === 'Membre').sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tighter mb-8">Comité Scientifique</h1>

        {president && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#033238] mb-4 border-b-2 border-[#033238]/20 pb-2">Président</h2>
            <div className="inline-block">
                <div className="bg-gradient-to-br from-[#033238] to-[#054c55] text-white rounded-xl shadow-xl p-6 flex items-center space-x-5">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-medium flex-shrink-0">
                        {president.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h3 className="font-bold text-xl">{president.name}</h3>
                        <div className="flex items-center text-sm opacity-80 mt-1">
                            <Award size={16} className="mr-1.5" />
                            <span>{president.role}</span>
                        </div>
                    </div>
                </div>
            </div>
          </section>
        )}

        <section>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b-2 border-slate-200 pb-2">Membres</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {members.map((member) => (
                <div 
                    key={member.name} 
                    className="bg-white rounded-xl shadow-md border border-slate-200/80 p-5"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-lg font-medium text-slate-500 flex-shrink-0">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{member.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </section>

      </main>
    </div>
  );
};

export default ScientificCommitteePage;
