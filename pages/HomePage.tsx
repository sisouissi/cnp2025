
import React, { useState, useMemo } from 'react';
import type { Tab } from '../App';
import Footer from '../components/layout/Footer';
import CountdownDisplay from '../components/ui/CountdownDisplay';
import SearchResults from '../components/home/SearchResults';
import { SESSIONS_DATA } from '../constants';
import type { Session } from '../types';
import { ArrowRight, CheckCircle2, Search, Download, Calendar, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { usePWAInstall } from '../context/PWAInstallContext';

interface HomePageProps {
  setActiveTab: (tab: Tab) => void;
  onSessionSelect: (session: Session) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setActiveTab, onSessionSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { canInstall, install } = usePWAInstall();

    const filteredSessions = useMemo(() => {
        if (!searchQuery) return [];
        const query = searchQuery.toLowerCase();
        return SESSIONS_DATA.filter(session => {
            const matchesTitle = session.title.toLowerCase().includes(query);
            const matchesTheme = session.theme.toLowerCase().includes(query);
            const matchesType = session.type.toLowerCase().includes(query);
            const matchesSpeaker = session.speakers.some(s => s.name.toLowerCase().includes(query));
            return matchesTitle || matchesTheme || matchesType || matchesSpeaker;
        });
    }, [searchQuery]);

    const handleSessionClick = (session: Session) => {
        onSessionSelect(session);
    };

    return (
    <>
      <div className="bg-white shadow-inner-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <img
            src="https://i.imgur.com/SRKadAD.jpg"
            alt="Bannière du 29e Congrès National de Pneumologie"
            className="max-w-full h-auto rounded-xl shadow-xl"
          />
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tighter">
                  29<sup>ème</sup> Congrès de Pneumologie
                </h1>
                <p className="text-lg text-slate-600 mb-6">27 - 29 Novembre 2025 | Hôtel Movenpick, Tunis</p>
                <div className="bg-gradient-to-r from-[#033238] to-[#054c55] rounded-xl p-6 text-white shadow-2xl">
                  <h2 className="text-xl font-bold mb-2 opacity-80">Thème Principal</h2>
                  <p className="text-3xl font-semibold">Quand le poumon s'exacerbe</p>
                </div>
              </div>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher une session, un thème, un orateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 bg-white focus:ring-[#68A0A8] focus:border-[#68A0A8] transition-all duration-300 shadow-sm"
                />
              </div>

              {searchQuery && <SearchResults sessions={filteredSessions} onSessionClick={handleSessionClick} />}

              <CountdownDisplay />

              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <button
                  onClick={() => setActiveTab('programme')}
                  className="flex items-center justify-center gap-2 bg-[#033238] text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-[#02262B] transition-all duration-300 transform hover:scale-105"
                >
                  <span className="font-semibold">Consulter le programme</span>
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => setActiveTab('info')}
                  className="bg-white border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-full hover:bg-slate-100 hover:border-slate-400 transition-colors font-semibold"
                >
                  S'inscrire
                </button>
                {canInstall && (
                  <button
                    onClick={install}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <Download size={20} />
                    <span className="font-semibold">Installer l'app</span>
                  </button>
                )}
              </div>
            </div>

            <div className="relative hidden lg:block p-8">
              <img
                src="https://i.imgur.com/OduHjDf.jpeg"
                alt="Affiche du 29e Congrès National de Pneumologie"
                className="rounded-2xl shadow-2xl w-full h-auto object-cover transform rotate-3"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-6">Informations Clés</h2>
                <ul className="space-y-5">
                    <li className="flex items-start">
                        <div className="bg-slate-100 p-3 rounded-full mr-4">
                            <Calendar className="w-6 h-6 text-[#033238]" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">Dates du Congrès</h3>
                            <p className="text-slate-600">27 - 29 Novembre 2025</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <div className="bg-slate-100 p-3 rounded-full mr-4">
                            <MapPin className="w-6 h-6 text-[#033238]" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">Lieu</h3>
                            <p className="text-slate-600">Hôtel Movenpick, Les Berges du Lac 1, Tunis</p>
                        </div>
                    </li>
                    <li className="flex items-start">
                        <div className="bg-slate-100 p-3 rounded-full mr-4">
                            <CheckCircle2 className="w-6 h-6 text-[#033238]" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">Autres thèmes abordés</h3>
                            <p className="text-slate-600">Infections, BPCO, Asthme, Cancer, PID, Sommeil, VNI, IA...</p>
                        </div>
                    </li>
                </ul>
            </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Contact & Soumissions</h2>
            <ul className="space-y-5 mb-6">
                <li className="flex items-start">
                    <div className="bg-slate-100 p-3 rounded-full mr-4">
                        <Phone className="w-6 h-6 text-[#033238]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800">Téléphones</h3>
                        <p className="text-slate-600">Dr Sonia Maalej: +216 98 318 199</p>
                        <p className="text-slate-600">Secrétariat: +216 98 539 050</p>
                    </div>
                </li>
                <li className="flex items-start">
                    <div className="bg-slate-100 p-3 rounded-full mr-4">
                        <Mail className="w-6 h-6 text-[#033238]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800">Email</h3>
                        <p className="text-slate-600">info@stmra.org</p>
                    </div>
                </li>
            </ul>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-start">
                    <div className="bg-slate-100 p-3 rounded-full mr-4">
                        <FileText className="w-6 h-6 text-[#033238]" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800">Appel à Abstracts</h3>
                        <p className="text-slate-600 text-sm mb-3">Dernier délai de soumission le dimanche 28 septembre 2025.</p>
                        <button
                            onClick={() => setActiveTab('submission')}
                            className="flex items-center justify-center gap-2 bg-[#033238] text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:bg-[#02262B] transition-all duration-300 text-sm font-semibold"
                        >
                            <span>Soumettre un travail</span>
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
