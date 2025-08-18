
import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  onBack: () => void;
  children?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, onBack, children }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <button
              onClick={onBack}
              className="flex items-center text-green-600 hover:text-green-800 font-semibold p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Retour"
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="hidden sm:inline">Retour</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          </div>
          {children && <div className="flex items-center space-x-2">{children}</div>}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;