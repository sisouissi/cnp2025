
import React from 'react';
import type { Tab } from '../../App';
import { Home, CalendarDays, CalendarCheck, Users, Info, FileText, Users2 } from 'lucide-react';

interface MobileNavBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-3 pb-2 transition-colors duration-200 relative ${
      isActive ? 'text-[#033238]' : 'text-slate-500 hover:text-[#033238]'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {isActive && <div className="absolute top-0 h-1 w-8 bg-[#033238] rounded-full"></div>}
    {icon}
    <span className={`text-xs mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
  </button>
);

const MobileNavBar: React.FC<MobileNavBarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { key: 'home', label: 'Accueil', icon: <Home size={22} /> },
    { key: 'programme', label: 'Programme', icon: <CalendarDays size={22} /> },
    { key: 'agenda', label: 'Agenda', icon: <CalendarCheck size={22} /> },
    { key: 'speakers', label: 'Orateurs', icon: <Users size={22} /> },
    { key: 'committee', label: 'Comité', icon: <Users2 size={22} /> },
    { key: 'submission', label: 'Soumissions', icon: <FileText size={22} /> },
    { key: 'info', label: 'Infos', icon: <Info size={22} /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-lg border-t border-slate-200 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.05)] flex items-center justify-around z-50">
      {navItems.map((item) => (
        <NavItem
          key={item.key}
          label={item.label}
          icon={item.icon}
          isActive={activeTab === item.key}
          onClick={() => setActiveTab(item.key as Tab)}
        />
      ))}
    </nav>
  );
};

export default MobileNavBar;