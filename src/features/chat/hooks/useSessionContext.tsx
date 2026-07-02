import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SessionContext {
  mood: string | null;
  streak: number;
  firstSessionDate: string | null;
  previousSessionAt: Date | null;
  previousSessionMood: string | null;
  previousSessionFocus: string | null;
  sessionCount: number;
  setMood(mood: string): void;
  incrementStreak(): void;
  setJourneyFocus(focus: string): void;
}

interface SessionMeta {
  lastConversationId?: string | null;
  lastActiveAt?: string;
  messageCount?: number;
  mood?: string | null;
  journeyFocus?: string | null;
  sessionCount?: number;
  firstSessionDate?: string | null;
  streak?: number;
}

const SessionContext = createContext<SessionContext | null>(null);

function calculateStreak(lastActiveAt?: string | null): number {
  if (!lastActiveAt) return 1;
  const lastDate = new Date(lastActiveAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 1 ? 1 : diffDays + 1;
}

export function SessionContextProvider({ children }: { children: React.ReactNode }) {
  const [sessionData, setSessionData] = useState<Partial<SessionContext>>({
    mood: null,
    streak: 0,
    firstSessionDate: null,
    previousSessionAt: null,
    previousSessionMood: null,
    previousSessionFocus: null,
    sessionCount: 0,
  });

  useEffect(() => {
    const loadSession = async () => {
      try {
        const raw = await AsyncStorage.getItem('neeva_session_context');
        if (raw) {
          const data: SessionMeta = JSON.parse(raw);
          const previousSessionAt = data.lastActiveAt ? new Date(data.lastActiveAt) : null;
          const streak = calculateStreak(data.lastActiveAt);
          
          setSessionData({
            mood: data.mood || null,
            streak,
            firstSessionDate: data.firstSessionDate || null,
            previousSessionAt,
            previousSessionMood: data.mood || null,
            previousSessionFocus: data.journeyFocus || null,
            sessionCount: data.sessionCount || 0,
          });
        }
      } catch (error) {
        console.error('[SessionContext] Failed to load session:', error);
      }
    };

    loadSession();
  }, []);

  const setMood = useCallback(async (mood: string) => {
    setSessionData(prev => ({ ...prev, mood }));
    try {
      const existing = await AsyncStorage.getItem('neeva_session_context');
      const existingData = existing ? JSON.parse(existing) as SessionMeta : {};
      
      const updated: SessionMeta = {
        ...existingData,
        mood,
        lastActiveAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('neeva_session_context', JSON.stringify(updated));
    } catch (error) {
      console.error('[SessionContext] Failed to save mood:', error);
    }
  }, []);

  const incrementStreak = useCallback(() => {
    setSessionData(prev => {
      const newStreak = (prev.streak || 0) + 1;
      const updated: Partial<SessionMeta> = {
        ...prev,
        streak: newStreak,
        lastActiveAt: new Date().toISOString(),
      };
      
      AsyncStorage.getItem('neeva_session_context').then(existing => {
        const existingData = existing ? JSON.parse(existing) as SessionMeta : {};
        AsyncStorage.setItem('neeva_session_context', JSON.stringify({
          ...existingData,
          ...updated,
        }));
      }).catch(err => console.error('[SessionContext] Failed to save streak:', err));
      
      return { ...prev, streak: newStreak };
    });
  }, []);

  const setJourneyFocus = useCallback(async (focus: string) => {
    setSessionData(prev => ({ ...prev, journeyFocus: focus }));
    try {
      const existing = await AsyncStorage.getItem('neeva_session_context');
      const existingData = existing ? JSON.parse(existing) as SessionMeta : {};
      
      const updated: SessionMeta = {
        ...existingData,
        journeyFocus: focus,
        lastActiveAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('neeva_session_context', JSON.stringify(updated));
    } catch (error) {
      console.error('[SessionContext] Failed to save journey focus:', error);
    }
  }, []);

  const value: SessionContext = {
    ...sessionData,
    setMood,
    incrementStreak,
    setJourneyFocus,
  } as SessionContext;

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionContextProvider');
  }
  return context;
}
