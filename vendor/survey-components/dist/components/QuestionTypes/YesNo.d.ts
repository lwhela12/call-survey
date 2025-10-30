import React from 'react';
import { Question } from '../../types/survey';
interface YesNoProps {
    question: Question;
    onAnswer: (answer: unknown) => void;
    disabled?: boolean;
}
declare const YesNo: React.FC<YesNoProps>;
export default YesNo;
//# sourceMappingURL=YesNo.d.ts.map
