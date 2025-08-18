
import React, { useState, useEffect } from 'react';
import type { Tab } from '../../App';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      
      const datePart = new Intl.DateTimeFormat('fr-FR', options)
        .format(now)
        .replace(/\b\w/g, char => char.toUpperCase());
        
      const timePart = now.toLocaleTimeString('fr-FR', {
        hour: 'numeric',
        minute: '2-digit'
      }).replace(':', 'h');

      setCurrentDateTime(`${datePart} : ${timePart}`);
    };

    updateDateTime();
    const timerId = setInterval(updateDateTime, 60000); // Mettre à jour chaque minute

    return () => clearInterval(timerId);
  }, []);

  const navItems: { key: Tab; label: string }[] = [
    { key: 'home', label: 'Home' },
    { key: 'programme', label: 'Programme' },
    { key: 'agenda', label: 'Mon Agenda' },
    { key: 'speakers', label: 'Orateurs' },
    { key: 'submission', label: 'Soumissions' },
    { key: 'info', label: 'Infos' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-40 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="text-md font-bold text-slate-800">{currentDateTime}</div>
          </div>
          <nav className="hidden md:flex space-x-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeTab === item.key
                    ? 'bg-slate-100 text-[#033238] font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
