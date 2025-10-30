// frontend/src/components/Survey/ChatInterface.tsx
import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { startSurvey, submitAnswer, addBotMessage, addUserMessage, setTyping, resetSurvey } from '../../store/slices/surveySlice';
import ChatMessage from './ChatMessage';
import QuestionRenderer from './QuestionRenderer';
import TypingIndicator from './TypingIndicator';
import WelcomeScreen from './WelcomeScreen';
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
// --- Keyframes ---
const fadeInUp = keyframes `
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;
// Removed unused keyframes to satisfy type checks
// --- Component ---
// Create a context for drag state
export const DragStateContext = React.createContext({
    activeId: null,
    setActiveDragItem: () => { },
    setDragHandlers: () => { },
});
const ChatInterface = () => {
    const dispatch = useAppDispatch();
    const { messages, currentQuestion, isTyping, isLoading, sessionId } = useAppSelector((state) => state.survey);
    // --- Refs ---
    const chatContainerRef = useRef(null);
    const lastMessageRef = useRef(null);
    const bottomRef = useRef(null);
    const questionAreaRef = useRef(null);
    // --- Drag and Drop State ---
    const [activeId, setActiveId] = useState(null);
    const [activeDragItem, setActiveDragItem] = useState(null);
    const [dragHandlers, setDragHandlers] = useState({});
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }), useSensor(TouchSensor, {
        activationConstraint: {
            delay: 150,
            tolerance: 5,
        },
    }), useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    }));
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    };
    const handleDragEnd = (event) => {
        if (dragHandlers.onDragEnd) {
            dragHandlers.onDragEnd(event);
        }
        setActiveId(null);
        setActiveDragItem(null);
    };
    useLayoutEffect(() => {
        const container = chatContainerRef.current;
        if (!container)
            return;
        // Single RAF for smoother animation
        const raf = requestAnimationFrame(() => {
            // Smooth scroll to bottom
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        });
        return () => cancelAnimationFrame(raf);
    }, [messages.length, isTyping, currentQuestion?.id]);
    // --- Auto-advance & Redirect Logic ---
    useEffect(() => {
        if (currentQuestion?.type === 'dynamic-message' && !isLoading) {
            const delay = currentQuestion.autoAdvanceDelay || 1500;
            const timer = setTimeout(() => {
                handleAnswer('acknowledged');
            }, delay);
            return () => clearTimeout(timer);
        }
        if (currentQuestion?.type === 'final-message' && !isLoading) {
            if (currentQuestion.redirect) {
                const redirectDelay = currentQuestion.redirectDelay || 5000;
                const timer = setTimeout(() => {
                    window.location.href = currentQuestion.redirect;
                }, redirectDelay);
                return () => clearTimeout(timer);
            }
        }
    }, [currentQuestion, isLoading]);
    // Format answers for display in the chat transcript
    function formatAnswerForDisplay(answer, questionType) {
        if (questionType === 'text-input' || questionType === 'text-input-followup') {
            return answer || '';
        }
        if (typeof answer === 'boolean') {
            return answer ? 'Yes' : 'No';
        }
        if (questionType === 'semantic-differential' && typeof answer === 'object' && answer !== null) {
            const lines = [];
            // Use the original scales order to ensure correct display order
            if (currentQuestion?.scales) {
                currentQuestion.scales.forEach((scale) => {
                    const value = answer[scale.variable];
                    if (value) {
                        const dots = Array(5).fill('○').map((dot, i) => i + 1 === value ? '●' : dot).join(' ');
                        lines.push(dots);
                    }
                });
            }
            else {
                // Fallback to original behavior if scales not available
                Object.values(answer).forEach((value) => {
                    const dots = Array(5).fill('○').map((dot, i) => i + 1 === value ? '●' : dot).join(' ');
                    lines.push(dots);
                });
            }
            return lines.join('\n');
        }
        if (currentQuestion?.options) {
            if (Array.isArray(answer)) {
                return answer.map(value => {
                    const option = currentQuestion.options?.find(opt => opt.value === value);
                    return option?.label || value;
                }).join(', ');
            }
            const option = currentQuestion.options.find(opt => opt.value === answer);
            if (option)
                return option.label;
        }
        if (typeof answer === 'object' && answer !== null) {
            if (answer.email)
                return answer.email;
            if (answer.phone)
                return answer.phone;
            if (answer.address1)
                return answer.address1;
            if (answer.text)
                return answer.text;
            if (answer.videoUrl)
                return '🎥 Video response recorded';
            if (answer.type === 'video')
                return '🎥 Video response recorded';
            if (answer.type === 'audio')
                return '🎤 Audio response recorded';
            if (answer.type === 'text')
                return '💬 Text response submitted';
            if (answer.type === 'skipped')
                return 'Skipped';
        }
        return String(answer);
    }
    // --- Answer Handling ---
    const handleAnswer = async (answer) => {
        if (!currentQuestion || isLoading)
            return;
        if (answer && typeof answer === 'object' && answer.action) {
            if (answer.action === 'close' || answer.action === 'complete') {
                dispatch(addBotMessage({ content: "Thanks for your time! Starting fresh..." }));
                setTimeout(() => dispatch(resetSurvey()), 2000);
                return;
            }
        }
        const nonDisplayableAnswerTypes = new Set([
            'video-autoplay',
            'videoask',
            'dynamic-message'
        ]);
        if (!nonDisplayableAnswerTypes.has(currentQuestion.type)) {
            const displayAnswer = formatAnswerForDisplay(answer, currentQuestion.type);
            dispatch(addUserMessage(displayAnswer));
        }
        dispatch(setTyping(true));
        try {
            const result = await dispatch(submitAnswer({
                questionId: currentQuestion.id,
                answer
            })).unwrap();
            if (!result.nextQuestion || result.nextQuestion.type !== 'dynamic-message') {
                // Add 3s delay for single-choice, multi-choice, semantic-differential, and ranking questions
                const delayForQuestionTypes = ['single-choice', 'multi-choice', 'semantic-differential', 'ranking'];
                // Also apply delay when coming FROM a dynamic-message TO these question types
                const shouldApplyDelay = result.nextQuestion && delayForQuestionTypes.includes(result.nextQuestion.type);
                const typingDuration = shouldApplyDelay ? 3000 : 600;
                setTimeout(() => dispatch(setTyping(false)), typingDuration);
            }
        }
        catch (error) {
            console.error('Error submitting answer:', error);
            setTimeout(() => dispatch(setTyping(false)), 600);
            // Optionally show an error message to the user
            dispatch(addBotMessage({
                content: "Sorry, there was an issue saving your response. Please try again."
            }));
        }
    };
    // removed useCallback version of formatAnswerForDisplay; using function above for stability
    // --- Render ---
    return (React.createElement(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragStart: handleDragStart, onDragEnd: handleDragEnd },
        React.createElement(DragStateContext.Provider, { value: { activeId, setActiveDragItem, setDragHandlers } },
            React.createElement(Container, null,
                React.createElement(ArtisticBackground, null),
                React.createElement(ChatContainer, { ref: chatContainerRef },
                    React.createElement(ChatContent, null,
                        messages.map((message) => {
                            const isLastBotMessage = message.type === 'bot' &&
                                message === messages[messages.length - 1];
                            const isCurrentQuestion = message.question?.id === currentQuestion?.id;
                            return (React.createElement(ChatMessage, { key: message.id, ref: isLastBotMessage ? lastMessageRef : null, message: message, isCurrentQuestion: isCurrentQuestion }));
                        }),
                        isTyping && React.createElement(TypingIndicator, null),
                        (() => {
                            const nonRenderableTypes = new Set([
                                'dynamic-message', 'final-message', 'videoask', 'video-autoplay'
                            ]);
                            const shouldRenderInline = !!currentQuestion && !isLoading && !isTyping &&
                                !nonRenderableTypes.has(currentQuestion.type);
                            if (!shouldRenderInline)
                                return null;
                            return (React.createElement(QuestionArea, { ref: questionAreaRef }, (currentQuestion.type === 'single-choice' ||
                                currentQuestion.type === 'multi-choice' ||
                                currentQuestion.type === 'quick-reply' ||
                                currentQuestion.type === 'message-button') ? (React.createElement(QuestionRenderer, { key: currentQuestion.id, question: currentQuestion, onAnswer: handleAnswer, disabled: isLoading })) : (React.createElement(QuestionWrapper, null,
                                React.createElement(QuestionRenderer, { key: currentQuestion.id, question: currentQuestion, onAnswer: handleAnswer, disabled: isLoading })))));
                        })(),
                        !sessionId && !currentQuestion && (React.createElement(WelcomeScreen, { onStart: () => dispatch(startSurvey('')) })),
                        React.createElement(BottomSentinel, { ref: bottomRef }))))),
        React.createElement(DragOverlay, { dropAnimation: {
                duration: 300,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
            } }, activeDragItem)));
};
// --- Styled Components ---
const Container = styled.div `
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #FFF8F1 0%, #FFEEDE 100%);
`;
const ArtisticBackground = styled.div `
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  opacity: 0.03;
  background-image: 
    radial-gradient(circle at 20% 80%, ${({ theme }) => theme.colors.accent.purple} 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, ${({ theme }) => theme.colors.accent.coral} 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, ${({ theme }) => theme.colors.accent.teal} 0%, transparent 50%);
  pointer-events: none;
`;
const ChatContainer = styled.div `
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.full};
    &:hover { background: ${({ theme }) => theme.colors.text.secondary}; }
  }
`;
const ChatContent = styled.div `
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;
const QuestionArea = styled.div `
  margin-top: ${({ theme }) => theme.spacing.xl};
  margin-left: 48px;
  animation: ${fadeInUp} 0.5s ease-out both;
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-left: 0;
  }
`;
const QuestionWrapper = styled.div `
  background: #D9F7FF;
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  margin-left: 48px;
  
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: -8px;
    width: 0; height: 0;
    border-style: solid;
    border-width: 10px 10px 10px 0;
    border-color: transparent #D9F7FF transparent transparent;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-left: 0;
    padding: ${({ theme }) => theme.spacing.lg};
    &::before { display: none; }
  }
`;
// Removed old Welcome components - now using WelcomeScreen component
const BottomSentinel = styled.div `
  height: 1px;
`;
export default ChatInterface;
//# sourceMappingURL=ChatInterface.js.map
