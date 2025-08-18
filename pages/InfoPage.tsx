
import React from 'react';
import type { Tab } from '../App';

interface InfoPageProps {
  setActiveTab: (tab: Tab) => void;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tighter">{title}</h2>
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            {children}
        </div>
    </div>
);

const InfoPage: React.FC<InfoPageProps> = ({ setActiveTab }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tighter mb-8">Informations Pratiques</h1>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <InfoCard title="Inscription">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 rounded-tl-lg">Catégorie</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Avant 27/10</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700 rounded-tr-lg">Après 27/10</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr><td className="py-3 px-4 text-slate-700 font-medium">Membre STMRA</td><td className="py-3 px-4 text-right text-slate-700">200 DT</td><td className="py-3 px-4 text-right text-slate-700">250 DT</td></tr>
                      <tr><td className="py-3 px-4 text-slate-700 font-medium">Non-membre STMRA</td><td className="py-3 px-4 text-right text-slate-700">250 DT</td><td className="py-3 px-4 text-right text-slate-700">300 DT</td></tr>
                      <tr><td className="py-3 px-4 text-slate-700 font-medium">Inscription résident</td><td className="py-3 px-4 text-right text-slate-700">180 DT</td><td className="py-3 px-4 text-right text-slate-700">230 DT</td></tr>
                      <tr><td className="py-3 px-4 text-slate-700 font-medium">Inscription atelier</td><td className="py-3 px-4 text-right text-slate-700">30 DT</td><td className="py-3 px-4 text-right text-slate-700">40 DT</td></tr>
                      <tr><td className="py-3 px-4 text-slate-700 font-medium">Cotisation annuelle STMRA</td><td className="py-3 px-4 text-right text-slate-700">70 DT</td><td className="py-3 px-4 text-right text-slate-700">-</td></tr>
                    </tbody>
                  </table>
              </div>
            </InfoCard>
          </div>
          <div className="lg:col-span-2">
            <InfoCard title="Hébergement">
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-900">Hôtel Movenpick</h3>
                    <p className="text-slate-600">500 DT (Single LPD) / 610 DT (Double LPD)</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h3 className="font-semibold text-slate-900">Hôtel Acropole</h3>
                    <p className="text-slate-600">280 DT (Single LPD) / 360 DT (Double LPD)</p>
                </div>
              </div>
            </InfoCard>
          </div>
        </div>
        <div className="mt-8">
            <InfoCard title="Lieu du Congrès">
                <div className="rounded-lg overflow-hidden">
                    <iframe
                        src="https://maps.google.com/maps?q=Movenpick%20Hotel%20du%20Lac%20Tunis&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        className="w-full h-80 border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Carte du lieu du congrès : Hôtel Movenpick, Les Berges du Lac, Tunis"
                    ></iframe>
                </div>
            </InfoCard>
        </div>
        <div className="mt-8">
            <InfoCard title="Contact">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                    <div><h3 className="font-semibold text-slate-900 mb-1">Dr Sonia Maalej</h3><p className="text-slate-600">+216 98 318 199</p></div>
                    <div><h3 className="font-semibold text-slate-900 mb-1">Secrétariat</h3><p className="text-slate-600">Mme Essia Chebbi: +216 98 539 050</p></div>
                    <div><h3 className="font-semibold text-slate-900 mb-1">Email & Site Web</h3><p className="text-slate-600">info@stmra.org / www.stmra.org</p></div>
                </div>
            </InfoCard>
        </div>
      </main>
    </div>
  );
};

export default InfoPage;
