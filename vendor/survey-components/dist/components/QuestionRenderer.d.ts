import React from 'react';
import { Question } from '../types/survey';
interface QuestionRendererProps {
    question: Question;
    onAnswer: (answer: unknown) => void;
    disabled?: boolean;
}
declare const QuestionRenderer: React.FC<QuestionRendererProps>;
export default QuestionRenderer;
//# sourceMappingURL=QuestionRenderer.d.ts.map
