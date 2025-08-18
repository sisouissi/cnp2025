
import React from 'react';
import type { Session } from '../../types';
import { Mic, X } from 'lucide-react';

interface RecordPromptModalProps {
  session: Session;
  onConfirm: () => void;
  onDismiss: () => void;
}

const RecordPromptModal: React.FC<RecordPromptModalProps> = ({ session, onConfirm, onDismiss }) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onDismiss}>
      <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onDismiss} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 -m-2 rounded-full hover:bg-slate-100 transition-colors">
          <X size={24} />
        </button>

        <div className="text-center">
            <div className="w-16 h-16 bg-[#033238]/10 text-[#033238] rounded-full flex items-center justify-center mx-auto mb-6">
                <Mic size={32} />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2">La session commence !</h2>
            <p className="text-slate-600 mb-1 font-semibold">"{session.title}"</p>
            <p className="text-slate-600 mb-8">
              Souhaitez-vous enregistrer et générer un résumé de cette conférence ?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onConfirm}
                  className="w-full flex-1 bg-[#033238] text-white px-6 py-3 rounded-lg hover:bg-[#02262B] transition-colors font-semibold"
                >
                  Oui, enregistrer
                </button>
                <button
                  onClick={onDismiss}
                  className="w-full flex-1 bg-slate-100 text-slate-700 px-6 py-3 rounded-lg hover:bg-slate-200 transition-colors font-semibold"
                >
                  Non, merci
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RecordPromptModal;
