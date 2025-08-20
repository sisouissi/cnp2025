
import React, { useState, useEffect, useCallback } from 'react';
import HomePage from './pages/HomePage';
import ProgrammePage from './pages/ProgrammePage';
import AgendaPage from './pages/AgendaPage';
import SpeakersPage from './pages/SpeakersPage';
import InfoPage from './pages/InfoPage';
import SubmissionPage from './pages/SubmissionPage';
import ScientificCommitteePage from './pages/ScientificCommitteePage';
import MobileNavBar from './components/layout/MobileNavBar';
import Header from './components/layout/Header';
import { AgendaProvider, useAgenda } from './context/AgendaContext';
import type { Session } from './types';
import SessionModal from './components/programme/SessionModal';
import RecordPromptModal from './components/ui/RecordPromptModal';

export type Tab = 'home' | 'programme' | 'agenda' | 'speakers' | 'info' | 'submission' | 'committee';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [searchSelectedSessionId, setSearchSelectedSessionId] = useState<string | null>(null);
  const { 
    personalAgenda, 
    promptedSessions, 
    markSessionAsPrompted, 
    showSessionModal, 
    activeSession, 
    isRecordingOnOpen, 
    hideSessionModal 
  } = useAgenda();
  
  const [sessionToPrompt, setSessionToPrompt] = useState<Session | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const upcomingSession = personalAgenda.find(session => {
        const startTime = session.startTime;
        const timeDiff = startTime.getTime() - now.getTime();
        // Prompt if session starts within the next 60 seconds or started up to 60 seconds ago
        const isImminent = timeDiff > -60000 && timeDiff <= 60000;
        return isImminent && !promptedSessions.has(session.id);
      });

      if (upcomingSession) {
        setSessionToPrompt(upcomingSession);
        markSessionAsPrompted(upcomingSession.id);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [personalAgenda, promptedSessions, markSessionAsPrompted]);
  
  const handlePromptConfirm = () => {
    if (sessionToPrompt) {
      showSessionModal(sessionToPrompt, true);
      setSessionToPrompt(null);
    }
  };

  const handlePromptDismiss = () => {
    setSessionToPrompt(null);
  };
  
  const handleSessionSearchSelect = (session: Session) => {
    setSearchSelectedSessionId(session.id);
    setActiveTab('programme');
  };

  const clearSearchSelection = useCallback(() => {
    setSearchSelectedSessionId(null);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage setActiveTab={setActiveTab} onSessionSelect={handleSessionSearchSelect} />;
      case 'programme':
        return <ProgrammePage setActiveTab={setActiveTab} searchSelectedSessionId={searchSelectedSessionId} clearSearchSelection={clearSearchSelection} />;
      case 'agenda':
        return <AgendaPage setActiveTab={setActiveTab} />;
      case 'speakers':
        return <SpeakersPage setActiveTab={setActiveTab} />;
      case 'committee':
        return <ScientificCommitteePage setActiveTab={setActiveTab} />;
      case 'submission':
        return <SubmissionPage setActiveTab={setActiveTab} />;
      case 'info':
        return <InfoPage setActiveTab={setActiveTab} />;
      default:
        return <HomePage setActiveTab={setActiveTab} onSessionSelect={handleSessionSearchSelect} />;
    }
  };
  
  return (
    <div className="font-sans pb-24 md:pb-0">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
      <MobileNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeSession && (
        <SessionModal 
          session={activeSession} 
          onClose={hideSessionModal} 
          startRecordingOnOpen={isRecordingOnOpen}
        />
      )}
      {sessionToPrompt && (
        <RecordPromptModal
          session={sessionToPrompt}
          onConfirm={handlePromptConfirm}
          onDismiss={handlePromptDismiss}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AgendaProvider>
      <AppContent />
    </AgendaProvider>
  );
};

export default App;