import React, { createContext, useContext, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>;
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed',
        platform: string
    }>;
    prompt(): Promise<void>;
}

interface PWAInstallContextType {
    canInstall: boolean;
    install: () => void;
}

const PWAInstallContext = createContext<PWAInstallContextType | undefined>(undefined);

export const PWAInstallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const install = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then(() => {
            setInstallPrompt(null);
        });
    };
    
    return (
        <PWAInstallContext.Provider value={{ canInstall: !!installPrompt, install }}>
            {children}
        </PWAInstallContext.Provider>
    );
};

export const usePWAInstall = (): PWAInstallContextType => {
    const context = useContext(PWAInstallContext);
    if (context === undefined) {
        throw new Error('usePWAInstall must be used within a PWAInstallProvider');
    }
    return context;
};
