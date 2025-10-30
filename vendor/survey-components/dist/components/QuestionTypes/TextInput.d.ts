import React from 'react';
import { Question } from '../../types/survey';
interface TextInputProps {
    question: Question;
    onAnswer: (answer: string) => void;
    disabled?: boolean;
}
declare const TextInput: React.FC<TextInputProps>;
export default TextInput;
//# sourceMappingURL=TextInput.d.ts.map
