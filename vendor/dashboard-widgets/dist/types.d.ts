/**
 * Type definitions for DashboardRenderer
 * These are minimal interfaces that the renderer needs from survey responses
 */
export interface SurveyResponse {
    id: string;
    sessionId: string;
    completedAt: Date | null;
    createdAt: Date;
    answers: SurveyAnswer[];
    respondentName?: string | null;
    metadata?: any;
}
export interface SurveyAnswer {
    id: string;
    responseId: string;
    blockId: string;
    answer: any;
    createdAt: Date;
}
export interface DashboardMetrics {
    totalResponses: number;
    completedResponses: number;
    completionRate: number;
    averageTimeToComplete?: number;
    lastResponseAt?: Date;
}
export interface QuestionStatistics {
    questionId: string;
    questionText?: string;
    questionType?: string;
    totalAnswers: number;
    answerDistribution: Record<string, number>;
    percentages: Record<string, number>;
}
export interface WidgetData {
    [key: string]: any;
}
export interface MetricWidgetData {
    value: number | string;
    label?: string;
    delta?: {
        value: number;
        direction: 'up' | 'down' | 'neutral';
        label?: string;
    };
}
export interface ChartWidgetData {
    segments?: Array<{
        label: string;
        value: number;
        color?: string;
    }>;
    stages?: Array<{
        label: string;
        value: number;
        percentage?: number;
    }>;
    series?: Array<{
        name: string;
        data: number[];
    }>;
    labels?: string[];
}
export interface TableWidgetData {
    columns: Array<{
        key: string;
        label: string;
    }>;
    rows: Array<Record<string, any>>;
}
export interface TextWidgetData {
    content: string;
    insights?: string[];
}
