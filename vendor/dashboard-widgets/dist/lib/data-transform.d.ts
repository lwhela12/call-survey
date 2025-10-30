import type { SurveyResponse, DashboardMetrics, QuestionStatistics, MetricWidgetData, ChartWidgetData } from '../types';
/**
 * Calculate overall dashboard metrics from survey responses
 */
export declare function calculateMetrics(responses: SurveyResponse[]): DashboardMetrics;
/**
 * Generate statistics for a specific question
 */
export declare function generateQuestionStats(responses: SurveyResponse[], questionId: string): QuestionStatistics;
/**
 * Prepare data for a metric widget (KPI card)
 */
export declare function prepareMetricData(responses: SurveyResponse[], metricType: 'totalResponses' | 'completionRate' | 'completedResponses' | string): MetricWidgetData;
/**
 * Prepare data for a chart widget (donut, funnel, etc.)
 */
export declare function prepareChartData(responses: SurveyResponse[], questionId: string, chartType?: 'donut' | 'funnel' | 'bar'): ChartWidgetData;
/**
 * Format a number for display
 */
export declare function formatNumber(value: number, format?: 'number' | 'percentage' | 'currency'): string;
/**
 * Calculate trend/delta between two values
 */
export declare function calculateDelta(current: number, previous: number): {
    readonly value: number;
    readonly direction: "up" | "down" | "neutral";
    readonly absolute: number;
} | null;
