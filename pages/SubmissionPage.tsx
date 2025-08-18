
import React from 'react';
import type { Tab } from '../App';

interface SubmissionPageProps {
  setActiveTab: (tab: Tab) => void;
}

const SubmissionPage: React.FC<SubmissionPageProps> = ({ setActiveTab }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tighter mb-8">Soumission de Travaux</h1>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <iframe
            src="https://form.jotform.com/232212396368559"
            className="w-full h-[calc(100vh-250px)] min-h-[600px] border-0"
            title="Formulaire de soumission de travaux"
            allowFullScreen
          >
            Chargement du formulaire...
          </iframe>
        </div>
      </main>
    </div>
  );
};

export default SubmissionPage;
