import React from 'react';
import { Question } from '../../types/survey';
interface SingleChoiceProps {
    question: Question;
    onAnswer: (answer: string) => void;
    disabled?: boolean;
}
declare const SingleChoice: React.FC<SingleChoiceProps>;
export default SingleChoice;
//# sourceMappingURL=SingleChoice.d.ts.map
