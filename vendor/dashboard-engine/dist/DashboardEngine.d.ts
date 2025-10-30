/**
 * DashboardEngine - Core dashboard logic for data binding and rendering
 * Modeled after the RuntimeEngine pattern for surveys
 */
import type { SurveyResponse, WidgetData, ResolvedTheme, ValidationResult } from './types';
/**
 * Main Dashboard Engine class
 * Provides stateless methods for dashboard data binding and theme resolution
 */
export declare class DashboardEngine {
    /**
     * Bind widget configuration to survey responses
     * @param widget Widget configuration from dashboard config
     * @param responses Array of survey responses
     * @returns Widget data ready for rendering
     */
    bindWidgetData(widget: any, responses: SurveyResponse[]): WidgetData;
    /**
     * Bind all widgets in a dashboard configuration
     * @param config Dashboard configuration
     * @param responses Array of survey responses
     * @returns Map of widget ID to widget data
     */
    bindAllWidgets(config: any, responses: SurveyResponse[]): Map<string, WidgetData>;
    /**
     * Resolve dashboard theme from configuration
     * Merges config theme with defaults
     * @param config Dashboard configuration
     * @returns Fully resolved theme
     */
    resolveTheme(config: any): ResolvedTheme;
    /**
     * Get default dashboard theme
     * @returns Default theme object
     */
    getDefaultTheme(): ResolvedTheme;
    /**
     * Calculate overall dashboard metrics
     * @param responses Array of survey responses
     * @returns Dashboard metrics (total, completed, completion rate, etc.)
     */
    calculateMetrics(responses: SurveyResponse[]): import("./types").DashboardMetrics;
    /**
     * Validate dashboard configuration
     * Checks for common issues like missing data bindings
     * @param config Dashboard configuration
     * @returns Validation result with errors and warnings
     */
    validateConfig(config: any): ValidationResult;
    /**
     * Detect overlapping widgets in layout
     * @param widgets Array of widgets
     * @returns Array of overlapping widget pairs
     */
    private detectWidgetOverlaps;
    /**
     * Check if two widget layouts overlap
     */
    private widgetsOverlap;
    /**
     * Normalize preview data format to runtime response format
     * Useful for studio preview where data might be in a different format
     * @param previewData Preview data from studio
     * @returns Normalized survey responses
     */
    normalizeResponses(previewData: any): SurveyResponse[];
}
/**
 * Create a new dashboard engine instance
 */
export declare function createDashboardEngine(): DashboardEngine;
