/**
 * DashboardEngine - Core dashboard logic for data binding and rendering
 * Modeled after the RuntimeEngine pattern for surveys
 */
import { bindWidgetData, calculateMetrics } from './data-binding';
import { resolveTheme, getDefaultTheme } from './theme-resolver';
/**
 * Main Dashboard Engine class
 * Provides stateless methods for dashboard data binding and theme resolution
 */
export class DashboardEngine {
    /**
     * Bind widget configuration to survey responses
     * @param widget Widget configuration from dashboard config
     * @param responses Array of survey responses
     * @returns Widget data ready for rendering
     */
    bindWidgetData(widget, responses) {
        return bindWidgetData(widget, responses);
    }
    /**
     * Bind all widgets in a dashboard configuration
     * @param config Dashboard configuration
     * @param responses Array of survey responses
     * @returns Map of widget ID to widget data
     */
    bindAllWidgets(config, responses) {
        const widgets = config?.widgets || [];
        const widgetDataMap = new Map();
        for (const widget of widgets) {
            const data = this.bindWidgetData(widget, responses);
            widgetDataMap.set(widget.id, data);
        }
        return widgetDataMap;
    }
    /**
     * Resolve dashboard theme from configuration
     * Merges config theme with defaults
     * @param config Dashboard configuration
     * @returns Fully resolved theme
     */
    resolveTheme(config) {
        return resolveTheme(config);
    }
    /**
     * Get default dashboard theme
     * @returns Default theme object
     */
    getDefaultTheme() {
        return getDefaultTheme();
    }
    /**
     * Calculate overall dashboard metrics
     * @param responses Array of survey responses
     * @returns Dashboard metrics (total, completed, completion rate, etc.)
     */
    calculateMetrics(responses) {
        return calculateMetrics(responses);
    }
    /**
     * Validate dashboard configuration
     * Checks for common issues like missing data bindings
     * @param config Dashboard configuration
     * @returns Validation result with errors and warnings
     */
    validateConfig(config) {
        const errors = [];
        const warnings = [];
        if (!config) {
            errors.push({
                field: 'config',
                message: 'Dashboard configuration is null or undefined',
            });
            return { valid: false, errors, warnings };
        }
        if (!config.widgets || !Array.isArray(config.widgets)) {
            errors.push({
                field: 'widgets',
                message: 'Dashboard config must have a widgets array',
            });
            return { valid: false, errors, warnings };
        }
        // Validate each widget
        for (const widget of config.widgets) {
            // Check for required fields
            if (!widget.id) {
                errors.push({
                    field: 'widget.id',
                    message: 'Widget is missing required id field',
                    widgetId: widget.id,
                });
            }
            if (!widget.type) {
                errors.push({
                    field: 'widget.type',
                    message: 'Widget is missing required type field',
                    widgetId: widget.id,
                });
            }
            if (!widget.layout) {
                errors.push({
                    field: 'widget.layout',
                    message: 'Widget is missing required layout field',
                    widgetId: widget.id,
                });
            }
            // Check for unbound data sources (null or 'b0' hardcode)
            if (widget.type === 'chart' || widget.type === 'table') {
                const hasData = widget.data;
                const dataSource = Array.isArray(widget.data)
                    ? widget.data[0]?.source
                    : widget.data?.source;
                if (!hasData || !dataSource) {
                    warnings.push({
                        field: 'widget.data',
                        message: `Widget "${widget.title || widget.id}" has no data binding`,
                        widgetId: widget.id,
                    });
                }
                else if (dataSource.value === 'b0') {
                    warnings.push({
                        field: 'widget.data.source.value',
                        message: `Widget "${widget.title || widget.id}" has unbound data source (b0)`,
                        widgetId: widget.id,
                    });
                }
                else if (dataSource.value === null || dataSource.value === undefined || dataSource.value === '') {
                    warnings.push({
                        field: 'widget.data.source.value',
                        message: `Widget "${widget.title || widget.id}" has no data binding`,
                        widgetId: widget.id,
                    });
                }
            }
            // Validate layout positions
            const layout = widget.layout;
            if (layout) {
                if (layout.x < 0 || layout.x >= 12) {
                    errors.push({
                        field: 'widget.layout.x',
                        message: `Widget "${widget.title || widget.id}" has invalid x position (must be 0-11)`,
                        widgetId: widget.id,
                    });
                }
                if (layout.w <= 0 || layout.w > 12) {
                    errors.push({
                        field: 'widget.layout.w',
                        message: `Widget "${widget.title || widget.id}" has invalid width (must be 1-12)`,
                        widgetId: widget.id,
                    });
                }
                if (layout.h <= 0) {
                    errors.push({
                        field: 'widget.layout.h',
                        message: `Widget "${widget.title || widget.id}" has invalid height (must be > 0)`,
                        widgetId: widget.id,
                    });
                }
            }
        }
        // Check for widget overlaps
        const overlaps = this.detectWidgetOverlaps(config.widgets);
        for (const overlap of overlaps) {
            warnings.push({
                field: 'widget.layout',
                message: `Widgets "${overlap.widget1}" and "${overlap.widget2}" overlap`,
                widgetId: overlap.widget1,
            });
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
    /**
     * Detect overlapping widgets in layout
     * @param widgets Array of widgets
     * @returns Array of overlapping widget pairs
     */
    detectWidgetOverlaps(widgets) {
        const overlaps = [];
        for (let i = 0; i < widgets.length; i++) {
            for (let j = i + 1; j < widgets.length; j++) {
                const w1 = widgets[i];
                const w2 = widgets[j];
                if (this.widgetsOverlap(w1.layout, w2.layout)) {
                    overlaps.push({
                        widget1: w1.title || w1.id,
                        widget2: w2.title || w2.id,
                    });
                }
            }
        }
        return overlaps;
    }
    /**
     * Check if two widget layouts overlap
     */
    widgetsOverlap(layout1, layout2) {
        // Skip if either layout is missing
        if (!layout1 || !layout2)
            return false;
        const l1 = layout1;
        const l2 = layout2;
        // Check if rectangles overlap
        const xOverlap = l1.x < l2.x + l2.w && l1.x + l1.w > l2.x;
        const yOverlap = l1.y < l2.y + l2.h && l1.y + l1.h > l2.y;
        return xOverlap && yOverlap;
    }
    /**
     * Normalize preview data format to runtime response format
     * Useful for studio preview where data might be in a different format
     * @param previewData Preview data from studio
     * @returns Normalized survey responses
     */
    normalizeResponses(previewData) {
        if (!previewData)
            return [];
        // If already in correct format, return as-is
        if (Array.isArray(previewData.sampleResponses)) {
            return previewData.sampleResponses.map((r) => ({
                id: r.id || r.respondentId || r.sessionId,
                sessionId: r.sessionId || r.id,
                completedAt: r.completedAt ? new Date(r.completedAt) : null,
                createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
                answers: (r.answers || []).map((a, idx) => ({
                    id: a.id || `ans-${idx}`,
                    responseId: r.id || r.respondentId || r.sessionId,
                    blockId: a.questionId || a.blockId, // Transform questionId → blockId
                    answer: a.value !== undefined ? a.value : a.answer, // Transform value → answer
                    createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
                })),
                respondentName: r.respondentName || r.persona,
                metadata: r.metadata,
            }));
        }
        // Handle other preview data formats if needed
        return [];
    }
}
/**
 * Create a new dashboard engine instance
 */
export function createDashboardEngine() {
    return new DashboardEngine();
}
