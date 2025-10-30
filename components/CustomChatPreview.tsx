'use client';

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { ThemeProvider, DefaultTheme } from 'styled-components';
import { QuestionRenderer, ProgressBar } from '@nesolagus/survey-components';

// Message interface
interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  question?: any;
  heroAsset?: any | null;
  timestamp: number;
}

// Import PreviewController from vendor package to ensure compatibility
import type { PreviewController } from '@nesolagus/survey-components';

// Component props
interface CustomChatPreviewProps {
  controller: PreviewController;
  theme: DefaultTheme;
  onAnswer?: (questionId: string, answer: any) => void;
  onProgress?: (progress: number) => void;
  typingDelays?: Record<string, number>;
  autoAdvanceDelay?: number;
  className?: string;
  initialMessages?: Message[];  // NEW PROP
}

const DEFAULT_TYPING_DELAYS = {
  'single-choice': 3000,
  'multi-choice': 3000,
  'semantic-differential': 3000,
  ranking: 3000,
};

const CustomChatPreview: React.FC<CustomChatPreviewProps> = ({
  controller,
  theme,
  onAnswer,
  onProgress,
  typingDelays,
  autoAdvanceDelay = 1500,
  className,
  initialMessages = [],  // NEW PROP with default
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);  // MODIFIED: Use initialMessages
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const createBotMessage = useCallback((question: any): Message => ({
    id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'bot',
    content: question.content ?? '',
    question,
    heroAsset: question.heroAsset ?? null,
    timestamp: Date.now(),
  }), []);

  const typingDelayMap = useMemo(
    () => ({ ...DEFAULT_TYPING_DELAYS, ...(typingDelays || {}) }),
    [typingDelays]
  );

  // Auto-scroll effect
  useLayoutEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const raf = requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [messages.length, isTyping, currentQuestion?.id]);

  // Initialization effect
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setIsLoading(true);
      setError(null);
      setSessionId(null);
      setCurrentQuestion(null);
      // MODIFIED: Don't reset messages if we have initialMessages
      if (initialMessages.length === 0) {
        setMessages([]);
      }
      setProgress(0);
      setIsComplete(false);

      try {
        const result = await controller.start();
        if (!mounted) return;

        setSessionId(result.sessionId);
        if (result.firstQuestion?.content) {
          // MODIFIED: Append to existing messages instead of replacing
          setMessages((prev) => [...prev, createBotMessage(result.firstQuestion)]);
        }
        setCurrentQuestion(result.firstQuestion);
        setProgress(0);
        onProgress?.(0);
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize preview';
          setError(errorMessage);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void init();

    return () => {
      mounted = false;
      if (sessionId && controller.stop) {
        controller.stop(sessionId).catch(() => undefined);
      }
    };
    // MODIFIED: Add initialMessages to dependencies
  }, [controller, createBotMessage, initialMessages, onProgress]);

  const formatAnswerForDisplay = useCallback((answer: any, question: any): string => {
    if (answer === 'acknowledged' || answer === '_auto_advance_') {
      return '';
    }
    if (typeof answer === 'boolean') {
      return answer ? 'Yes' : 'No';
    }
    if (question.options && !Array.isArray(answer)) {
      const option = question.options.find((opt: any) => opt.value === answer || opt.id === answer);
      if (option) return option.label;
    }
    if (Array.isArray(answer) && question.options) {
      return answer
        .map((value) => {
          const option = question.options?.find((opt: any) => opt.value === value || opt.id === value);
          return option?.label || value;
        })
        .join(', ');
    }
    if (
      question.type === 'semantic-differential' &&
      typeof answer === 'object' &&
      answer !== null
    ) {
      const lines: string[] = [];
      if (question.scales) {
        question.scales.forEach((scale: any) => {
          const value = answer[scale.variable];
          if (value) {
            const dots = Array(5)
              .fill('○')
              .map((dot, i) => (i + 1 === value ? '●' : dot))
              .join(' ');
            lines.push(dots);
          }
        });
      }
      return lines.join('\n');
    }
    if (typeof answer === 'object' && answer !== null) {
      if (answer.email) return String(answer.email);
      if (answer.phone) return String(answer.phone);
      if (answer.text) return String(answer.text);
      if (answer.type === 'skipped') return 'Skipped';
    }
    return String(answer);
  }, []);

  const handleAnswer = useCallback(
    async (answer: any) => {
      if (!currentQuestion || !sessionId || isLoading) return;

      setIsLoading(true);
      setError(null);
      onAnswer?.(currentQuestion.id, answer);

      const displayableTypes = new Set([
        'text-input',
        'text-input-followup',
        'single-choice',
        'multi-choice',
        'scale',
        'mixed-media',
        'semantic-differential',
        'ranking',
        'yes-no',
        'contact-form',
        'demographics',
        'quick-reply',
        'message-button',
      ]);

      if (displayableTypes.has(currentQuestion.type)) {
        const displayAnswer = formatAnswerForDisplay(answer, currentQuestion);
        if (displayAnswer) {
          setMessages((prev) => [
            ...prev,
            {
              id: `user-${Date.now()}`,
              type: 'user',
              content: displayAnswer,
              timestamp: Date.now(),
            },
          ]);
        }
      }

      setIsTyping(true);

      try {
        const response = await controller.answer({
          sessionId,
          questionId: currentQuestion.id,
          answer,
        });

        const { nextQuestion, progress: newProgress } = response;
        setProgress(newProgress);
        onProgress?.(newProgress);

        const delay = nextQuestion ? (typingDelayMap[nextQuestion.type as keyof typeof typingDelayMap] ?? 600) : 600;

        setTimeout(() => {
          setIsTyping(false);
          if (nextQuestion) {
            setCurrentQuestion(nextQuestion);
            if (nextQuestion.content) {
              setMessages((prev) => [...prev, createBotMessage(nextQuestion)]);
            }
          } else {
            setIsComplete(true);
            setCurrentQuestion(null);
            setProgress(100);
            onProgress?.(100);
          }
        }, delay);
      } catch (err) {
        console.error('Preview submission failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer';
        setError(errorMessage);
        setIsTyping(false);
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentQuestion,
      sessionId,
      isLoading,
      formatAnswerForDisplay,
      onAnswer,
      controller,
      typingDelayMap,
      onProgress,
      createBotMessage,
    ]
  );

  // Auto-advance effect
  useEffect(() => {
    if (!currentQuestion || isLoading || isTyping) return;

    const isAutoAdvance =
      currentQuestion.type === 'dynamic-message';

    if (isAutoAdvance) {
      const timer = setTimeout(() => {
        void handleAnswer('acknowledged');
      }, currentQuestion.autoAdvanceDelay || autoAdvanceDelay);

      return () => clearTimeout(timer);
    }
  }, [currentQuestion, isLoading, isTyping, autoAdvanceDelay, handleAnswer]);

  const renderContent = () => {
    if (error) {
      return (
        <ErrorContainer>
          <ErrorCard>
            <h3>Preview Error</h3>
            <p>{error}</p>
          </ErrorCard>
        </ErrorContainer>
      );
    }

    if (!sessionId || (!currentQuestion && !isComplete)) {
      return (
        <LoadingState>
          <span className="pulse">Loading preview…</span>
        </LoadingState>
      );
    }

    if (isComplete || currentQuestion?.type === 'final-message' || currentQuestion?.type === 'end') {
      const completionAsset = currentQuestion?.heroAsset;
      return (
        <CompletionContainer>
          <CompletionCard>
            {completionAsset?.url && (
              <CompletionImage>
                <img src={completionAsset.url} alt={completionAsset.fileName ?? 'Completion media'} />
              </CompletionImage>
            )}
          </CompletionCard>
        </CompletionContainer>
      );
    }

    const nonRenderable = new Set([
      'dynamic-message',
      'final-message',
      'videoask',
      'video-autoplay',
    ]);

    const shouldRenderQuestion =
      currentQuestion && !nonRenderable.has(currentQuestion.type) && !isTyping;

    return (
      <ChatArea ref={chatContainerRef}>
        <ChatContent>
          {messages.map((message) => (
            <MessageRow key={message.id} $kind={message.type}>
              {message.type === 'bot' && (theme.hero as any)?.avatar?.url && (
                <Avatar src={(theme.hero as any).avatar.url} alt={(theme.hero as any).avatar.fileName || 'Bot avatar'} />
              )}
              <MessageBubble $kind={message.type}>
                <MessageText>{message.content}</MessageText>
                {message.heroAsset?.url && (
                  <HeroImage>
                    <img src={message.heroAsset.url} alt={message.heroAsset.fileName ?? 'Message media'} />
                  </HeroImage>
                )}
              </MessageBubble>
            </MessageRow>
          ))}
          {isTyping && (
            <MessageRow $kind="bot">
              {(theme.hero as any)?.avatar?.url && (
                <Avatar src={(theme.hero as any).avatar.url} alt={(theme.hero as any).avatar.fileName || 'Bot avatar'} />
              )}
              <TypingIndicator>
                <TypingDot delay="0ms" />
                <TypingDot delay="150ms" />
                <TypingDot delay="300ms" />
              </TypingIndicator>
            </MessageRow>
          )}
          {shouldRenderQuestion && (
            <QuestionContainer>
              <QuestionRenderer
                question={currentQuestion}
                onAnswer={handleAnswer}
                disabled={isLoading || isTyping}
              />
            </QuestionContainer>
          )}
        </ChatContent>
      </ChatArea>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Wrapper className={className}>
        {(theme.branding as any)?.logo?.url && (
          <HeaderContainer>
            <Logo src={(theme.branding as any).logo.url} alt={(theme.branding as any).logo.fileName || 'Survey logo'} />
          </HeaderContainer>
        )}
        {(theme.progressBar as any)?.enabled !== false && (
          <ProgressBarContainer>
            <ProgressBar progress={progress} />
          </ProgressBarContainer>
        )}
        {renderContent()}
      </Wrapper>
    </ThemeProvider>
  );
};

// Styled components (unchanged from original)
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.background} 0%,
    ${({ theme }) => theme.colors.surface} 100%
  );
`;

const ProgressBarContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}40;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
`;

const Logo = styled.img`
  max-height: 48px;
  max-width: 200px;
  object-fit: contain;
`;

const ChatArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`;

const ChatContent = styled.div`
  max-width: 48rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageRow = styled.div<{ $kind: 'bot' | 'user' }>`
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  align-self: ${({ $kind }) => ($kind === 'bot' ? 'flex-start' : 'flex-end')};
  max-width: 100%;
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const MessageBubble = styled.div<{ $kind: 'bot' | 'user' }>`
  background: ${({ theme, $kind }) =>
    $kind === 'bot' ? theme.colors.surface : theme.colors.primary};
  color: ${({ theme, $kind }) =>
    $kind === 'bot' ? theme.colors.text.primary : theme.colors.text.inverse};
  padding: 1rem 1.25rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  max-width: 32rem;
  white-space: pre-wrap;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MessageText = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.base};
`;

const HeroImage = styled.div`
  margin-top: 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    max-height: 220px;
    object-fit: cover;
  }
`;

const QuestionContainer = styled.div`
  margin-top: 0.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 1.5rem;
`;

const TypingIndicator = styled.div`
  display: inline-flex;
  gap: 0.375rem;
  padding: 0.75rem 1rem;
  border-radius: 9999px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const TypingDot = styled.div<{ delay: string }>`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: ${({ theme }) => theme.colors.text.secondary};
  animation: bounce 1.4s infinite ease-in-out;
  animation-delay: ${({ delay }) => delay};

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
      opacity: 0.4;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const LoadingState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  .pulse {
    color: ${({ theme }) => theme.colors.text.secondary};
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
    }
    50% {
      opacity: 1;
    }
  }
`;

const CompletionContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
`;

const CompletionCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 3rem;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  max-width: 28rem;
  width: 100%;

  .icon {
    font-size: 3.5rem;
    margin-bottom: 1rem;
  }

  h2 {
    margin: 0;
    font-size: 1.75rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const CompletionImage = styled.div`
  margin-top: 1.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    max-height: 260px;
    object-fit: cover;
  }
`;

const ErrorContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const ErrorCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  max-width: 24rem;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  h3 {
    margin-bottom: 0.75rem;
    color: ${({ theme }) => theme.colors.error};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export default CustomChatPreview;
