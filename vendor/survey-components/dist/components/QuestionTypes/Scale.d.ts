import React from 'react';
import { Question } from '../../types/survey';
interface ScaleProps {
    question: Question;
    onAnswer: (answer: number) => void;
    disabled?: boolean;
}
declare const Scale: React.FC<ScaleProps>;
export default Scale;
//# sourceMappingURL=Scale.d.ts.map
