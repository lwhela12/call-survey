import React from 'react';
import { Question } from '../../types/survey';
interface MultiChoiceProps {
    question: Question;
    onAnswer: (answer: string[]) => void;
    disabled?: boolean;
}
declare const MultiChoice: React.FC<MultiChoiceProps>;
export default MultiChoice;
//# sourceMappingURL=MultiChoice.d.ts.map
