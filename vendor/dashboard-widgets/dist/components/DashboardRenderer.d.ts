import type { SurveyResponse } from '../types';
export interface DashboardRendererProps {
    config: any;
    responses: SurveyResponse[];
    mode?: 'studio-preview' | 'runtime';
    aiSummary?: {
        summary: string;
        insights: string[];
    };
    className?: string;
}
/**
 * DashboardRenderer - Renders dashboard widgets in a grid layout
 * Uses the dashboard configuration from the builder to display widgets with real data
 */
export declare function DashboardRenderer({ config, responses, mode, aiSummary, className, }: DashboardRendererProps): import("react/jsx-runtime").JSX.Element;
