import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Informations</h3>
            <ul className="space-y-2">
              <li>Hôtel Movenpick, Berges du Lac 1, Tunis</li>
              <li>27-29 Novembre 2025</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>+216 98 539 050</li>
              <li>+216 98 318 199</li>
              <li>info@stmra.org</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-700 pt-8 text-center text-slate-400">
          <p>&copy; 2025 STMRA. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;