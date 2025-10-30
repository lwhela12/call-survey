import React from 'react';
import { DefaultTheme } from 'styled-components';
import { Question, QuestionType } from '../../types/survey';
export interface PreviewController {
    start: () => Promise<{
        sessionId: string;
        firstQuestion: Question | null;
        responseId?: string;
    }>;
    answer: (params: {
        sessionId: string;
        questionId: string;
        answer: unknown;
    }) => Promise<{
        nextQuestion: Question | null;
        progress: number;
    }>;
    stop?: (sessionId: string) => Promise<void>;
}
export interface ChatPreviewProps {
    controller: PreviewController;
    theme: DefaultTheme;
    onAnswer?: (questionId: string, answer: unknown) => void;
    onProgress?: (progress: number) => void;
    typingDelays?: Partial<Record<QuestionType, number>>;
    autoAdvanceDelay?: number;
    className?: string;
}
declare const ChatPreview: React.FC<ChatPreviewProps>;
export default ChatPreview;
//# sourceMappingURL=ChatPreview.d.ts.map
