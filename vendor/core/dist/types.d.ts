export interface MediaAsset {
    assetId?: string;
    url: string;
    key?: string;
    contentType?: string;
    size?: number;
    kind?: string;
    alt?: string;
    provider?: string;
    fileName?: string;
}
export type QuestionType = 'video-autoplay' | 'videoask' | 'quick-reply' | 'message-button' | 'text-input' | 'text-input-followup' | 'single-choice' | 'multi-choice' | 'scale' | 'mixed-media' | 'semantic-differential' | 'ranking' | 'yes-no' | 'contact-form' | 'demographics' | 'final-message' | 'dynamic-message';
export interface Option {
    id: string;
    label: string;
    value: string;
    description?: string;
    emoji?: string;
    next?: string;
    action?: string;
    url?: string;
    showText?: boolean;
    exclusive?: boolean;
    media?: MediaAsset;
}
export interface SemanticScale {
    id: string;
    leftLabel: string;
    rightLabel: string;
    variable: string;
}
export interface FormField {
    id: string;
    label: string;
    type: string;
    variable: string;
    required: boolean;
    placeholder?: string;
    prefill?: string;
}
export interface Question {
    id: string;
    type: QuestionType;
    content: string;
    options?: Option[];
    placeholder?: string;
    required?: boolean;
    min?: number;
    max?: number;
    maxSelections?: number;
    scales?: SemanticScale[];
    fields?: FormField[];
    videoUrl?: string;
    videoAskFormId?: string;
    videoAskId?: string;
    videoDelay?: number;
    duration?: string;
    buttonText?: string;
    persistVideo?: boolean;
    links?: Array<{
        text: string;
        url: string;
    }>;
    autoAdvance?: boolean;
    autoAdvanceDelay?: number;
    redirect?: string;
    redirectDelay?: number;
    media?: MediaAsset;
}
export interface SurveyState {
    sessionId: string;
    currentQuestion: Question | null;
    progress: number;
    variables: Record<string, unknown>;
}
export interface Answer {
    questionId: string;
    value: unknown;
    timestamp: Date;
}
//# sourceMappingURL=types.d.ts.map
