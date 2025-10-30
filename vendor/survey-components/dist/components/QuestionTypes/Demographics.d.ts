import React from 'react';
import { Question, Option } from '../../types/survey';
interface DemographicsQuestion extends Question {
    questions?: Array<{
        id: string;
        content: string;
        type: string;
        variable: string;
        options?: Option[];
        placeholder?: string;
    }>;
}
interface DemographicsProps {
    question: DemographicsQuestion;
    onAnswer: (answer: unknown) => void;
    disabled?: boolean;
}
declare const Demographics: React.FC<DemographicsProps>;
export default Demographics;
//# sourceMappingURL=Demographics.d.ts.map
