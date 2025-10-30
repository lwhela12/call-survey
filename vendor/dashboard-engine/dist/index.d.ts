/**
 * @nesolagus/dashboard-engine
 *
 * Dashboard data binding and rendering engine
 * Provides consistent dashboard logic across studio and runtime contexts
 */
export { DashboardEngine, createDashboardEngine } from './DashboardEngine';
export { bindWidgetData, calculateMetrics, generateQuestionStats, prepareMetricData, prepareChartData, formatNumber, calculateDelta, } from './data-binding';
export { resolveTheme, getDefaultTheme, mergeThemes, validateTheme, } from './theme-resolver';
export type { SurveyResponse, SurveyAnswer, DashboardMetrics, QuestionStatistics, WidgetData, MetricWidgetData, ChartWidgetData, TableWidgetData, TextWidgetData, DashboardTheme, ResolvedTheme, ValidationResult, ValidationError, ValidationWarning, } from './types';
