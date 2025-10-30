'use client';

import { PreviewController } from '@nesolagus/survey-components';
import { DefaultTheme } from 'styled-components';
import { runtimeApi } from '@/lib/runtime-api';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import surveyTheme from '@/config/theme.json';
import WelcomeBackScreen from '@/components/WelcomeBackScreen';
import CustomChatPreview from '@/components/CustomChatPreview';
import surveyConfig from '@/config/survey.json';
import styled from 'styled-components';

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
const DEFAULT_THEME = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    surface: '#FFFFFF',
    text: {
      primary: '#1f2937',
      secondary: '#4A5568',
      light: '#718096',
      inverse: '#FFFFFF',
    },
    border: '#E2E8F0',
  },
  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    heading: "'Poppins', 'Inter', sans-serif",
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
};

export default function SurveyPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [returningSessionData, setReturningSessionData] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [userChoice, setUserChoice] = useState<'continue' | 'fresh' | null>(null);

  // Use refs to avoid controller recreation
  const userChoiceRef = useRef<'continue' | 'fresh' | null>(null);
  const currentSessionIdRef = useRef<string | null>(null);
  const returningSessionDataRef = useRef<any>(null);

  // Keep refs in sync with state
  useEffect(() => {
    userChoiceRef.current = userChoice;
    currentSessionIdRef.current = currentSessionId;
    returningSessionDataRef.current = returningSessionData;
  }, [userChoice, currentSessionId, returningSessionData]);

  // Use survey theme if available, otherwise use default
  const theme = useMemo(() => {
    return (surveyTheme || DEFAULT_THEME) as DefaultTheme;
  }, []);

  // Get estimated minutes from survey config
  const estimatedMinutes = (surveyConfig as any)?.survey?.metadata?.estimatedMinutes || 8;

  // Check for existing session on mount
  useEffect(() => {
    const checkForExistingSession = async () => {
      const storedSessionId = getStoredSession();

      if (storedSessionId) {
        try {
          // Try to fetch existing session state
          const state = await runtimeApi.getSessionState(storedSessionId);

          // Show welcome-back screen if session exists
          setReturningSessionData(state);
          setCurrentSessionId(storedSessionId);
          setShowWelcomeBack(true);
        } catch (error) {
          console.log('Session not found on server, starting new session');
          clearStoredSession();
        }
      }

      setIsCheckingSession(false);
    };

    checkForExistingSession();
  }, []);

  // Handler for continuing from welcome-back screen
  const handleContinue = () => {
    setUserChoice('continue');
    setShowWelcomeBack(false);
    // ChatPreview will now render and resume with the existing session
  };

  // Handler for starting fresh
  const handleStartFresh = () => {
    setShowConfirmDialog(true);
  };

  // Handler for confirming start fresh
  const handleConfirmStartFresh = () => {
    clearStoredSession();
    setShowConfirmDialog(false);
    setShowWelcomeBack(false);
    setReturningSessionData(null);
    setCurrentSessionId(null);
    setUserChoice('fresh');
    // ChatPreview will now render and start a fresh session
  };

  // Create controller for ChatPreview - memoized with no dependencies to prevent re-creation
  const controller: PreviewController = useMemo(() => ({
    start: async () => {
      // Use refs to get current values without causing re-creation
      const choice = userChoiceRef.current;
      const sessionId = currentSessionIdRef.current;
      const sessionData = returningSessionDataRef.current;

      // If user chose to continue, resume with existing session
      if (choice === 'continue' && sessionId && sessionData) {
        return {
          sessionId: sessionId,
          firstQuestion: sessionData.currentQuestion,
          responseId: sessionData.responseId,
        };
      }

      // Otherwise, start new session
      const result = await runtimeApi.startSurvey();

      setCurrentSessionId(result.sessionId);
      currentSessionIdRef.current = result.sessionId;
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
      try {
        await runtimeApi.endSession(sessionId);
      } catch (error) {
        console.error('Error ending session:', error);
        // Don't throw - session might already be ended
      }
      clearStoredSession();
    },
  }), []); // Empty deps - controller never changes

  // Calculate time remaining based on progress
  const calculateTimeRemaining = (progress: number): number => {
    const remainingPercentage = (100 - progress) / 100;
    const timeRemaining = Math.ceil(estimatedMinutes * remainingPercentage);
    return Math.max(1, timeRemaining); // At least 1 minute
  };

  // Convert conversation history to message format for CustomChatPreview
  const initialMessages = useMemo(() => {
    if (userChoice !== 'continue' || !returningSessionData?.conversationHistory) {
      return [];
    }

    const messages: any[] = [];

    for (const item of returningSessionData.conversationHistory) {
      // Add bot message (question)
      messages.push({
        id: `history-bot-${item.blockId}`,
        type: 'bot',
        content: item.questionContent,
        timestamp: Date.now(),
      });

      // Add user message (answer) if not bot-only
      if (!item.isBotOnly && item.answerContent) {
        messages.push({
          id: `history-user-${item.blockId}`,
          type: 'user',
          content: item.answerContent,
          timestamp: Date.now(),
        });
      }
    }

    return messages;
  }, [userChoice, returningSessionData]);

  // Don't render anything while checking for session
  if (isCheckingSession) {
    return null;
  }

  return (
    <>
      {showWelcomeBack && returningSessionData ? (
        <WelcomeBackScreen
          onContinue={handleContinue}
          onStartFresh={handleStartFresh}
          progress={returningSessionData.progress || 0}
          estimatedTimeRemaining={calculateTimeRemaining(returningSessionData.progress || 0)}
          theme={theme}
        />
      ) : (
        <CustomChatPreview
          controller={controller}
          theme={theme}
          initialMessages={initialMessages}
        />
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <ConfirmDialog>
          <DialogOverlay onClick={() => setShowConfirmDialog(false)} />
          <DialogContent>
            <DialogTitle>Start Fresh?</DialogTitle>
            <DialogMessage>
              Are you sure you want to start over? You'll lose your progress ({Math.round(returningSessionData?.progress || 0)}% complete).
            </DialogMessage>
            <DialogButtons>
              <CancelButton onClick={() => setShowConfirmDialog(false)}>Cancel</CancelButton>
              <ConfirmButton onClick={handleConfirmStartFresh}>Yes, Start Fresh</ConfirmButton>
            </DialogButtons>
          </DialogContent>
        </ConfirmDialog>
      )}
    </>
  );
}

// Styled components for confirmation dialog
const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DialogOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
`;

const DialogContent = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors?.surface || '#FFFFFF'};
  border-radius: ${({ theme }) => theme.borderRadius?.lg || '1rem'};
  box-shadow: ${({ theme }) => theme.shadows?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
  padding: ${({ theme }) => theme.spacing?.xl || '2rem'};
  max-width: 500px;
  width: 90%;
  z-index: 10001;

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    padding: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
  }
`;

const DialogTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts?.heading || 'Poppins, Inter, sans-serif'};
  font-size: ${({ theme }) => theme.fontSizes?.xxl || '1.5rem'};
  font-weight: ${({ theme }) => theme.fontWeights?.bold || 700};
  color: ${({ theme }) => theme.colors?.text?.primary || '#1F2937'};
  margin: 0 0 ${({ theme }) => theme.spacing?.md || '1rem'} 0;
`;

const DialogMessage = styled.p`
  font-family: ${({ theme }) => theme.fonts?.body || 'Inter, sans-serif'};
  font-size: ${({ theme }) => theme.fontSizes?.base || '1rem'};
  color: ${({ theme }) => theme.colors?.text?.secondary || '#4A5568'};
  margin: 0 0 ${({ theme }) => theme.spacing?.xl || '2rem'} 0;
  line-height: 1.5;
`;

const DialogButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  justify-content: flex-end;

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    flex-direction: column-reverse;
  }
`;

const CancelButton = styled.button`
  background: transparent;
  border: 2px solid ${({ theme }) => theme.colors?.border || '#E2E8F0'};
  border-radius: ${({ theme }) => theme.borderRadius?.md || '0.5rem'};
  padding: 12px 24px;
  font-family: ${({ theme }) => theme.fonts?.body || 'Inter, sans-serif'};
  font-size: ${({ theme }) => theme.fontSizes?.base || '1rem'};
  font-weight: ${({ theme }) => theme.fontWeights?.medium || 500};
  color: ${({ theme }) => theme.colors?.text?.secondary || '#4A5568'};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions?.normal || '300ms'};

  &:hover {
    border-color: ${({ theme }) => theme.colors?.text?.secondary || '#4A5568'};
    background: ${({ theme }) => theme.colors?.surface || '#FFFFFF'};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    width: 100%;
  }
`;

const ConfirmButton = styled.button`
  background: ${({ theme }) => theme.colors?.error || '#E53E3E'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius?.md || '0.5rem'};
  padding: 12px 24px;
  font-family: ${({ theme }) => theme.fonts?.body || 'Inter, sans-serif'};
  font-size: ${({ theme }) => theme.fontSizes?.base || '1rem'};
  font-weight: ${({ theme }) => theme.fontWeights?.medium || 500};
  color: #FFFFFF;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions?.normal || '300ms'};

  &:hover {
    background: #C53030;
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    width: 100%;
  }
`;
