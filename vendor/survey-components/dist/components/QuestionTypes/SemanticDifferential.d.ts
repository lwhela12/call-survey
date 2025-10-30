import React from 'react';
import { Question } from '../../types/survey';
interface SemanticDifferentialProps {
    question: Question;
    onAnswer: (answer: Record<string, number>) => void;
    disabled?: boolean;
}
declare const SemanticDifferential: React.FC<SemanticDifferentialProps>;
export default SemanticDifferential;
//# sourceMappingURL=SemanticDifferential.d.ts.map
