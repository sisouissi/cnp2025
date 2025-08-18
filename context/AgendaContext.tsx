
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { Session } from '../types';
import { SESSIONS_DATA } from '../constants';

interface AgendaContextType {
  personalAgenda: Session[];
  favorites: Set<string>;
  summaries: Record<string, string>;
  addToAgenda: (session: Session) => void;
  removeFromAgenda: (sessionId: string) => void;
  toggleFavorite: (sessionId: string) => void;
  addSummary: (sessionId: string, summary: string) => void;
  activeSession: Session | null;
  isRecordingOnOpen: boolean;
  showSessionModal: (session: Session, startRecording?: boolean) => void;
  hideSessionModal: () => void;
  promptedSessions: Set<string>;
  markSessionAsPrompted: (sessionId: string) => void;
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

export const AgendaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [personalAgenda, setPersonalAgenda] = useState<Session[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [isRecordingOnOpen, setIsRecordingOnOpen] = useState(false);
  const [promptedSessions, setPromptedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const storedAgenda = localStorage.getItem('personalAgenda');
      if (storedAgenda) {
        const agendaIds: string[] = JSON.parse(storedAgenda);
        const agendaSessions = SESSIONS_DATA.filter(s => agendaIds.includes(s.id));
        setPersonalAgenda(agendaSessions);
      }

      const storedFavorites = localStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(new Set(JSON.parse(storedFavorites)));
      }

      const storedSummaries = localStorage.getItem('sessionSummaries');
      if (storedSummaries) {
        setSummaries(JSON.parse(storedSummaries));
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
    }
  }, []);

  const addToAgenda = (session: Session) => {
    setPersonalAgenda(prevAgenda => {
      const newAgenda = [...prevAgenda, session];
      const newAgendaIds = newAgenda.map(s => s.id);
      localStorage.setItem('personalAgenda', JSON.stringify(newAgendaIds));
      return newAgenda;
    });
  };

  const removeFromAgenda = (sessionId: string) => {
    setPersonalAgenda(prevAgenda => {
      const newAgenda = prevAgenda.filter(s => s.id !== sessionId);
      const newAgendaIds = newAgenda.map(s => s.id);
      localStorage.setItem('personalAgenda', JSON.stringify(newAgendaIds));
      return newAgenda;
    });
  };

  const toggleFavorite = (sessionId: string) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(sessionId)) {
        newFavorites.delete(sessionId);
      } else {
        newFavorites.add(sessionId);
      }
      localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)));
      return newFavorites;
    });
  };

  const addSummary = (sessionId: string, summary: string) => {
    setSummaries(prevSummaries => {
      const newSummaries = { ...prevSummaries, [sessionId]: summary };
      localStorage.setItem('sessionSummaries', JSON.stringify(newSummaries));
      return newSummaries;
    });
  };

  const showSessionModal = (session: Session, startRecording = false) => {
    setActiveSession(session);
    setIsRecordingOnOpen(startRecording);
  };

  const hideSessionModal = () => {
    setActiveSession(null);
    setIsRecordingOnOpen(false);
  };
  
  const markSessionAsPrompted = (sessionId: string) => {
    setPromptedSessions(prev => new Set(prev).add(sessionId));
  };

  return (
    <AgendaContext.Provider value={{ personalAgenda, favorites, summaries, addToAgenda, removeFromAgenda, toggleFavorite, addSummary, activeSession, isRecordingOnOpen, showSessionModal, hideSessionModal, promptedSessions, markSessionAsPrompted }}>
      {children}
    </AgendaContext.Provider>
  );
};

export const useAgenda = (): AgendaContextType => {
  const context = useContext(AgendaContext);
  if (context === undefined) {
    throw new Error('useAgenda must be used within an AgendaProvider');
  }
  return context;
};
