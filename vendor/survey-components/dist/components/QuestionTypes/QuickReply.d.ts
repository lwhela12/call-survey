import React from 'react';
import { Question } from '../../types/survey';
interface QuickReplyProps {
    question: Question;
    onAnswer: (answer: string) => void;
    disabled?: boolean;
}
declare const QuickReply: React.FC<QuickReplyProps>;
export default QuickReply;
//# sourceMappingURL=QuickReply.d.ts.map
