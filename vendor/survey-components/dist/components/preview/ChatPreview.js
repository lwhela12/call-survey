import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { ThemeProvider } from 'styled-components';
import QuestionRenderer from '../QuestionRenderer';
import ProgressBar from '../ProgressBar';
const DEFAULT_TYPING_DELAYS = {
    'single-choice': 3000,
    'multi-choice': 3000,
    'semantic-differential': 3000,
    ranking: 3000,
};
const ChatPreview = ({ controller, theme, onAnswer, onProgress, typingDelays, autoAdvanceDelay = 1500, className, }) => {
    const [sessionId, setSessionId] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [messages, setMessages] = useState([]);
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const chatContainerRef = useRef(null);
    const createBotMessage = useCallback((question) => ({
        id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: 'bot',
        content: question.content ?? '',
        question,
        heroAsset: question.heroAsset ?? null,
        timestamp: Date.now(),
    }), []);
    const typingDelayMap = useMemo(() => ({ ...DEFAULT_TYPING_DELAYS, ...(typingDelays || {}) }), [typingDelays]);
    useLayoutEffect(() => {
        const container = chatContainerRef.current;
        if (!container)
            return;
        const raf = requestAnimationFrame(() => {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth',
            });
        });
        return () => cancelAnimationFrame(raf);
    }, [messages.length, isTyping, currentQuestion?.id]);
    useEffect(() => {
        let mounted = true;
        const init = async () => {
            setIsLoading(true);
            setError(null);
            setSessionId(null);
            setCurrentQuestion(null);
            setMessages([]);
            setProgress(0);
            setIsComplete(false);
            try {
                const result = await controller.start();
                if (!mounted)
                    return;
                setSessionId(result.sessionId);
                if (result.firstQuestion?.content) {
                    setMessages([createBotMessage(result.firstQuestion)]);
                }
                setCurrentQuestion(result.firstQuestion);
                setProgress(0);
                onProgress?.(0);
            }
            catch (err) {
                if (mounted) {
                    const errorMessage = err instanceof Error ? err.message : 'Failed to initialize preview';
                    setError(errorMessage);
                }
            }
            finally {
                if (mounted)
                    setIsLoading(false);
            }
        };
        void init();
        return () => {
            mounted = false;
            if (sessionId && controller.stop) {
                controller.stop(sessionId).catch(() => undefined);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controller, createBotMessage]);
    const formatAnswerForDisplay = useCallback((answer, question) => {
        if (answer === 'acknowledged' || answer === '_auto_advance_') {
            return '';
        }
        if (typeof answer === 'boolean') {
            return answer ? 'Yes' : 'No';
        }
        if (question.options && !Array.isArray(answer)) {
            const option = question.options.find((opt) => opt.value === answer || opt.id === answer);
            if (option)
                return option.label;
        }
        if (Array.isArray(answer) && question.options) {
            return answer
                .map((value) => {
                const option = question.options?.find((opt) => opt.value === value || opt.id === value);
                return option?.label || value;
            })
                .join(', ');
        }
        if (question.type === 'semantic-differential' &&
            typeof answer === 'object' &&
            answer !== null) {
            const lines = [];
            if (question.scales) {
                question.scales.forEach((scale) => {
                    const answerObj = answer;
                    const value = answerObj[scale.variable];
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
            const answerObj = answer;
            if (answerObj.email)
                return String(answerObj.email);
            if (answerObj.phone)
                return String(answerObj.phone);
            if (answerObj.text)
                return String(answerObj.text);
            if (answerObj.type === 'skipped')
                return 'Skipped';
        }
        return String(answer);
    }, []);
    const handleAnswer = useCallback(async (answer) => {
        if (!currentQuestion || !sessionId || isLoading)
            return;
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
            const { nextQuestion, progress } = response;
            setProgress(progress);
            onProgress?.(progress);
            const delay = nextQuestion ? typingDelayMap[nextQuestion.type] ?? 600 : 600;
            setTimeout(() => {
                setIsTyping(false);
                if (nextQuestion) {
                    setCurrentQuestion(nextQuestion);
                    if (nextQuestion.content) {
                        setMessages((prev) => [...prev, createBotMessage(nextQuestion)]);
                    }
                }
                else {
                    setIsComplete(true);
                    setCurrentQuestion(null);
                    setProgress(100);
                    onProgress?.(100);
                }
            }, delay);
        }
        catch (err) {
            console.error('Preview submission failed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer';
            setError(errorMessage);
            setIsTyping(false);
        }
        finally {
            setIsLoading(false);
        }
    }, [currentQuestion, sessionId, isLoading, formatAnswerForDisplay, onAnswer, controller, typingDelayMap, onProgress, setMessages, setIsTyping, setCurrentQuestion, setProgress, setIsComplete, setError, setIsLoading, createBotMessage]);
    useEffect(() => {
        if (!currentQuestion || isLoading || isTyping)
            return;
        const isAutoAdvance = currentQuestion.type === 'dynamic-message' || currentQuestion.type === 'final-message';
        if (isAutoAdvance) {
            const timer = setTimeout(() => {
                void handleAnswer('acknowledged');
            }, currentQuestion.autoAdvanceDelay || autoAdvanceDelay);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion, isLoading, isTyping, autoAdvanceDelay, handleAnswer]);
    const renderContent = () => {
        if (error) {
            return (React.createElement(ErrorContainer, null,
                React.createElement(ErrorCard, null,
                    React.createElement("h3", null, "Preview Error"),
                    React.createElement("p", null, error))));
        }
        if (!sessionId || (!currentQuestion && !isComplete)) {
            return (React.createElement(LoadingState, null,
                React.createElement("span", { className: "pulse" }, "Loading preview\u2026")));
        }
        if (isComplete || currentQuestion?.type === 'final-message') {
            const completionAsset = currentQuestion?.heroAsset;
            return (React.createElement(CompletionContainer, null,
                React.createElement(CompletionCard, null,
                    React.createElement("div", { className: "icon" }, "\uD83C\uDF89"),
                    React.createElement("h2", null, currentQuestion?.content || 'Survey Complete!'),
                    completionAsset?.url && (React.createElement(CompletionImage, null,
                        React.createElement("img", { src: completionAsset.url, alt: completionAsset.fileName ?? 'Completion media' }))))));
        }
        const nonRenderable = new Set([
            'dynamic-message',
            'final-message',
            'videoask',
            'video-autoplay',
        ]);
        const shouldRenderQuestion = currentQuestion && !nonRenderable.has(currentQuestion.type) && !isTyping;
        return (React.createElement(ChatArea, { ref: chatContainerRef },
            React.createElement(ChatContent, null,
                messages.map((message) => (React.createElement(MessageRow, { key: message.id, "$kind": message.type },
                    message.type === 'bot' && theme.hero?.avatar?.url && (React.createElement(Avatar, { src: theme.hero.avatar.url, alt: theme.hero.avatar.fileName || 'Bot avatar' })),
                    React.createElement(MessageBubble, { "$kind": message.type },
                        React.createElement(MessageText, null, message.content),
                        message.heroAsset?.url && (React.createElement(HeroImage, null,
                            React.createElement("img", { src: message.heroAsset.url, alt: message.heroAsset.fileName ?? 'Message media' }))))))),
                isTyping && (React.createElement(MessageRow, { "$kind": "bot" },
                    theme.hero?.avatar?.url && (React.createElement(Avatar, { src: theme.hero.avatar.url, alt: theme.hero.avatar.fileName || 'Bot avatar' })),
                    React.createElement(TypingIndicator, null,
                        React.createElement(TypingDot, { delay: "0ms" }),
                        React.createElement(TypingDot, { delay: "150ms" }),
                        React.createElement(TypingDot, { delay: "300ms" })))),
                shouldRenderQuestion && (React.createElement(QuestionContainer, null,
                    React.createElement(QuestionRenderer, { question: currentQuestion, onAnswer: handleAnswer, disabled: isLoading || isTyping }))))));
    };
    return (React.createElement(ThemeProvider, { theme: theme },
        React.createElement(Wrapper, { className: className },
            theme.branding?.logo?.url && (React.createElement(HeaderContainer, null,
                React.createElement(Logo, { src: theme.branding.logo.url, alt: theme.branding.logo.fileName || 'Survey logo' }))),
            theme.progressBar?.enabled !== false && (React.createElement(ProgressBarContainer, null,
                React.createElement(ProgressBar, { progress: progress }))),
            renderContent())));
};
const Wrapper = styled.div `
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.background} 0%,
    ${({ theme }) => theme.colors.surface} 100%
  );
`;
const ProgressBarContainer = styled.div `
  display: flex;
  justify-content: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}40;
`;
const HeaderContainer = styled.div `
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
`;
const Logo = styled.img `
  max-height: 48px;
  max-width: 200px;
  object-fit: contain;
`;
const ChatArea = styled.div `
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
`;
const ChatContent = styled.div `
  max-width: 48rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;
const MessageRow = styled.div `
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  align-self: ${({ $kind }) => ($kind === 'bot' ? 'flex-start' : 'flex-end')};
  max-width: 100%;
`;
const Avatar = styled.img `
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;
const MessageBubble = styled.div `
  background: ${({ theme, $kind }) => $kind === 'bot' ? theme.colors.surface : theme.colors.primary};
  color: ${({ theme, $kind }) => $kind === 'bot' ? theme.colors.text.primary : theme.colors.text.inverse};
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
const MessageText = styled.p `
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.base};
`;
const HeroImage = styled.div `
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
const QuestionContainer = styled.div `
  margin-top: 0.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: 1.5rem;
`;
const TypingIndicator = styled.div `
  display: inline-flex;
  gap: 0.375rem;
  padding: 0.75rem 1rem;
  border-radius: 9999px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;
const TypingDot = styled.div `
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
const LoadingState = styled.div `
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
const CompletionContainer = styled.div `
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
`;
const CompletionCard = styled.div `
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
const CompletionImage = styled.div `
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
const ErrorContainer = styled.div `
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;
const ErrorCard = styled.div `
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
export default ChatPreview;
//# sourceMappingURL=ChatPreview.js.map
