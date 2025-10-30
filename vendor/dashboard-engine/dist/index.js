/**
 * @nesolagus/dashboard-engine
 *
 * Dashboard data binding and rendering engine
 * Provides consistent dashboard logic across studio and runtime contexts
 */
// Main engine class
export { DashboardEngine, createDashboardEngine } from './DashboardEngine';
// Data binding functions (can be used directly if needed)
export { bindWidgetData, calculateMetrics, generateQuestionStats, prepareMetricData, prepareChartData, formatNumber, calculateDelta, } from './data-binding';
// Theme resolution functions
export { resolveTheme, getDefaultTheme, mergeThemes, validateTheme, } from './theme-resolver';
