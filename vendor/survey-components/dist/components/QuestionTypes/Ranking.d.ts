import React from 'react';
import type { Question } from '../../types/survey';
interface RankingProps {
    question: Question;
    onAnswer: (answer: string[]) => void;
    disabled?: boolean;
}
declare const Ranking: React.FC<RankingProps>;
export default Ranking;
//# sourceMappingURL=Ranking.d.ts.map
