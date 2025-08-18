import React from 'react';
import useCountdown from '../../hooks/useCountdown';

const CountdownItem: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-slate-200 shadow-lg">
      <div className="text-4xl font-bold text-[#033238] tracking-tight">{String(value).padStart(2, '0')}</div>
      <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">{label}</div>
    </div>
);

const CountdownDisplay: React.FC = () => {
    const targetDate = new Date('2025-11-27T08:00:00');
    const timeLeft = useCountdown(targetDate);

    return (
        <div className="grid grid-cols-4 gap-3 md:gap-4">
            <CountdownItem value={timeLeft.days} label="Jours" />
            <CountdownItem value={timeLeft.hours} label="Heures" />
            <CountdownItem value={timeLeft.minutes} label="Minutes" />
            <CountdownItem value={timeLeft.seconds} label="Secondes" />
        </div>
    );
};

export default CountdownDisplay;