'use client';

import { ChatPreview, PreviewController } from '@nesolagus/survey-components';
import { DefaultTheme } from 'styled-components';
import { runtimeApi } from '@/lib/runtime-api';
import { useMemo, useState } from 'react';
import surveyTheme from '@/config/theme.json';

// Session storage helpers
const SESSION_STORAGE_KEY = 'nesolagus_survey_session';
const SESSION_EXPIRY_KEY = 'nesolagus_survey_expiry';

const saveSession = (sessionId: string) => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24 hour expiry
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toISOString());
};

const getStoredSession = (): string | null => {
  const sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);

  if (!sessionId || !expiry) return null;

  // Check if session has expired
  if (new Date(expiry) < new Date()) {
    clearStoredSession();
    return null;
  }

  return sessionId;
};

const clearStoredSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
};

// Default theme when no theme is configured
const DEFAULT_THEME: DefaultTheme = {
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: '8px',
};

export default function SurveyPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Use survey theme if available, otherwise use default
  const theme = useMemo(() => {
    return (surveyTheme || DEFAULT_THEME) as DefaultTheme;
  }, []);

  // Create controller for ChatPreview
  const controller: PreviewController = {
    start: async () => {
      // Check for existing session
      const storedSessionId = getStoredSession();

      if (storedSessionId) {
        try {
          // Try to resume existing session
          const state = await runtimeApi.getSessionState(storedSessionId);
          setCurrentSessionId(storedSessionId);
          return {
            sessionId: storedSessionId,
            firstQuestion: state.currentQuestion,
            responseId: state.responseId,
          };
        } catch (error) {
          console.log('Session not found on server, starting new session');
          clearStoredSession();
        }
      }

      // Start new session
      const result = await runtimeApi.startSurvey();

      setCurrentSessionId(result.sessionId);
      saveSession(result.sessionId);

      return {
        sessionId: result.sessionId,
        firstQuestion: result.firstQuestion,
        responseId: result.responseId,
      };
    },

    answer: async ({ sessionId, questionId, answer }: { sessionId: string; questionId: string; answer: any }) => {
      const result = await runtimeApi.submitAnswer({
        sessionId,
        questionId,
        answer,
      });

      // If survey is complete, clear session
      if (result.nextQuestion?.type === 'final-message') {
        clearStoredSession();
      }

      return {
        nextQuestion: result.nextQuestion,
        progress: result.progress,
      };
    },

    stop: async (sessionId: string) => {
      await runtimeApi.endSession(sessionId);
      clearStoredSession();
    },
  };

  return <ChatPreview controller={controller} theme={theme} />;
}
