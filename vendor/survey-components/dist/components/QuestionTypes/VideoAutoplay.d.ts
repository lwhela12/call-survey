import React from 'react';
import { Question } from '../../types/survey';
interface VideoAutoplayProps {
    question: Question;
    onComplete: (answer: string) => void;
    disabled?: boolean;
}
declare const VideoAutoplay: React.FC<VideoAutoplayProps>;
export default VideoAutoplay;
//# sourceMappingURL=VideoAutoplay.d.ts.map
