import React from 'react';
import { Question } from '../../types/survey';
interface VideoAskQuestionProps {
    question: Question;
    onAnswer: (answer: unknown) => void;
    disabled?: boolean;
    sessionId?: string | null;
    responseId?: string | null;
}
declare const VideoAskQuestion: React.FC<VideoAskQuestionProps>;
export default VideoAskQuestion;
//# sourceMappingURL=VideoAskQuestion.d.ts.map
