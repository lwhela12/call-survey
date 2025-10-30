import React from 'react';
interface VideoRecorderProps {
    onRecordingComplete: (videoUrl: string) => void;
    onCancel: () => void;
    maxDuration?: number;
    question: string;
    videoAskUrl?: string;
}
declare const VideoRecorder: React.FC<VideoRecorderProps>;
export default VideoRecorder;
//# sourceMappingURL=VideoRecorder.d.ts.map
