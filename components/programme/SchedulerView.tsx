import React from 'react';
import type { Session } from '../../types';
import { getThemeGradient } from '../../constants';

interface SchedulerViewProps {
  sessions: Session[];
  onSessionClick: (session: Session) => void;
}

const LOCATIONS = ['Grand Salon 1', 'Grand Salon 2', 'Petit Salon', 'Salon Carré', 'Salon de délégation 3', 'Salle de restaurant'];

const generateTimeSlots = (startHour: number, endHour: number, intervalMinutes: number): string[] => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += intervalMinutes) {
            const h = hour.toString().padStart(2, '0');
            const m = minute.toString().padStart(2, '0');
            slots.push(`${h}:${m}`);
        }
    }
    return slots;
};

const TIME_SLOTS = generateTimeSlots(8, 19, 15); // 8:00 to 18:45

const SchedulerView: React.FC<SchedulerViewProps> = ({ sessions, onSessionClick }) => {
    
    const renderedSlots = new Set<string>();

    const day = sessions.length > 0 ? sessions[0].startTime.getDate() : null;

    let orderedLocations = [...LOCATIONS];
    if (day === 28 || day === 29) { // Friday or Saturday
        const priorityOrder = ['Grand Salon 2', 'Petit Salon'];
        // Filter out 'Grand Salon 1' for Friday and Saturday
        const availableLocations = LOCATIONS.filter(loc => loc !== 'Grand Salon 1');
        
        orderedLocations = [
            ...priorityOrder,
            ...availableLocations.filter(loc => !priorityOrder.includes(loc))
        ];
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px] border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-24 sticky left-0 bg-gray-50 z-10">Horaire</th>
                            {orderedLocations.map(location => (
                                <th key={location} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 min-w-[200px]">
                                    {location}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {TIME_SLOTS.map(time => (
                            <tr key={time} className="h-10">
                                {time.endsWith(':00') ? (
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900 w-24 sticky left-0 bg-white z-10 border-t border-gray-200 -mt-px">{time}</td>
                                ) : (
                                    <td className="px-4 py-2 text-sm text-gray-400 w-24 sticky left-0 bg-white z-10"></td>
                                )}
                                
                                {orderedLocations.map(location => {
                                    const session = sessions.find(s => {
                                        const sessionStart = s.startTime;
                                        const [hour, minute] = time.split(':').map(Number);
                                        return sessionStart.getHours() === hour && sessionStart.getMinutes() === minute && s.location === location;
                                    });

                                    if(session) {
                                        if (renderedSlots.has(session.id)) return null;

                                        const durationMinutes = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
                                        const rowSpan = Math.round(durationMinutes / 15);
                                        renderedSlots.add(session.id);
                                        
                                        return (
                                            <td key={`${location}-${time}`} rowSpan={rowSpan} className="p-0 align-top border-l border-gray-100 relative">
                                                <div
                                                    className={`absolute inset-0 m-1 p-2 rounded-lg text-white text-sm bg-gradient-to-br ${getThemeGradient(session.theme)} shadow-lg cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden`}
                                                    onClick={() => onSessionClick(session)}
                                                >
                                                    <div className="font-semibold">{session.title}</div>
                                                    <div className="opacity-80 mt-1">
                                                        {session.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {session.endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </div>
                                                </div>
                                            </td>
                                        );
                                    }

                                    // Check if this slot is covered by a multi-slot session
                                    const isCovered = sessions.some(s => {
                                        const [hour, minute] = time.split(':').map(Number);
                                        const currentTime = new Date(s.startTime);
                                        currentTime.setHours(hour, minute, 0, 0);
                                        return s.location === location && s.startTime < currentTime && s.endTime > currentTime;
                                    });

                                    if (isCovered) return null;

                                    return <td key={`${location}-${time}`} className="border-l border-gray-100"></td>;
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SchedulerView;