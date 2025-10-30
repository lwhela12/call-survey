const { dashboardConfigSchema } = require('./schema.js');

const DASHBOARD_WIDGET_TYPES = Object.freeze(['metric', 'chart', 'table', 'text', 'custom']);
const DASHBOARD_CHART_VARIANTS = Object.freeze(['line', 'bar', 'stacked-bar', 'pie', 'donut']);
const DASHBOARD_METRIC_FORMATS = Object.freeze(['number', 'percentage', 'currency', 'duration', 'custom']);

/**
 * Generate a minimal dashboard configuration scaffold.
 * @param {object} [options]
 * @param {string} [options.title] - Optional dashboard title.
 * @param {string} [options.version] - Semantic version string.
 * @returns {import('./index.d.ts').DashboardConfig}
 */
function createEmptyDashboardConfig(options = {}) {
  const title = options.title || 'New Dashboard';
  const version = options.version || '1.0.0';

  return {
    version,
    metadata: {
      title
    },
    layout: {
      columns: 12,
      gap: 24
    },
    filters: [],
    widgets: []
  };
}

module.exports = {
  dashboardConfigSchema,
  DASHBOARD_WIDGET_TYPES,
  DASHBOARD_CHART_VARIANTS,
  DASHBOARD_METRIC_FORMATS,
  createEmptyDashboardConfig
};
