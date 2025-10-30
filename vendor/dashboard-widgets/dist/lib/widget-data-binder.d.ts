import type { SurveyResponse, WidgetData } from '../types';
type DashboardWidget = any;
/**
 * Bind data to a widget based on its configuration
 */
export declare function bindWidgetData(widget: DashboardWidget, responses: SurveyResponse[]): WidgetData;
/**
 * Prepare sample/mock data for widgets (useful for preview)
 */
export declare function generateSampleDataForWidget(widget: DashboardWidget): WidgetData;
export {};
