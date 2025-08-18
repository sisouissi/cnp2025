
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    // Show prompt after a short delay, but not if already installed
    if (!isIOS && !isInStandaloneMode) {
      setTimeout(() => setShowInstall(true), 5000);
    }
  }, []);

  if (!showInstall) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 md:bottom-4 bg-white shadow-lg rounded-lg p-4 max-w-sm z-50 animate-fade-in-up">
      <div className="flex items-start">
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">Installer l'application CNP 2025</p>
          <p className="mt-1 text-sm text-gray-500">
            Ajoutez cette application à votre écran d'accueil pour un accès rapide et hors ligne.
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={() => setShowInstall(false)}
            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;