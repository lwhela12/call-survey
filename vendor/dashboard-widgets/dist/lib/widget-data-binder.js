import { calculateMetrics, generateQuestionStats, prepareMetricData, prepareChartData, } from './data-transform';
/**
 * Bind data to a widget based on its configuration
 */
export function bindWidgetData(widget, responses) {
    // Handle widgets without data bindings
    if (!widget.data) {
        return getDefaultDataForWidget(widget, responses);
    }
    // Handle array of data bindings
    if (Array.isArray(widget.data)) {
        return bindMultipleDataSources(widget.data, responses);
    }
    // Handle single data binding
    return bindSingleDataSource(widget.data, responses, widget);
}
/**
 * Bind a single data source to widget data
 */
function bindSingleDataSource(binding, responses, widget) {
    const { source, aggregation } = binding;
    // Metric source (built-in metrics like totalResponses, completionRate)
    if (source?.kind === 'metric') {
        return prepareMetricData(responses, source.value);
    }
    // Question source (data from a specific survey question)
    if (source?.kind === 'question') {
        const questionId = source.value;
        switch (aggregation) {
            case 'count':
                // Count total answers for this question
                const stats = generateQuestionStats(responses, questionId);
                return {
                    value: stats.totalAnswers,
                    label: `Responses to ${questionId}`,
                };
            case 'distribution':
            case 'percentage':
                // Get answer distribution for charts
                const chartType = widget.presentation?.chart?.variant || 'donut';
                return prepareChartData(responses, questionId, chartType);
            default:
                // Default to distribution
                return prepareChartData(responses, questionId);
        }
    }
    // Variable source (custom calculations)
    if (source?.kind === 'variable') {
        // This would handle custom variable calculations
        // For now, return empty
        return {};
    }
    return {};
}
/**
 * Bind multiple data sources (for widgets that need multiple data points)
 */
function bindMultipleDataSources(bindings, responses) {
    const data = {};
    bindings.forEach((binding, index) => {
        const key = binding.id || `data${index}`;
        data[key] = bindSingleDataSource(binding, responses, {});
    });
    return data;
}
/**
 * Get default data for widgets without explicit data bindings
 */
function getDefaultDataForWidget(widget, responses) {
    const metrics = calculateMetrics(responses);
    // Default data based on widget type
    switch (widget.type) {
        case 'metric':
            // Default to total responses
            return {
                value: metrics.totalResponses,
                label: widget.title || 'Total Responses',
            };
        case 'chart':
            // No default chart data - would need question binding
            return {
                segments: [],
            };
        case 'text':
            // Text widgets use content from config
            return {
                content: widget.content || '',
            };
        case 'custom':
            // Custom widgets (like AI summary) might have their own data
            if (widget.component === 'ai-summary') {
                return {
                    summary: 'AI summary would be generated here',
                    insights: [],
                };
            }
            return {};
        default:
            return {};
    }
}
/**
 * Prepare sample/mock data for widgets (useful for preview)
 */
export function generateSampleDataForWidget(widget) {
    switch (widget.type) {
        case 'metric':
            return {
                value: Math.floor(Math.random() * 1000),
                label: widget.title || 'Sample Metric',
                delta: {
                    value: Math.floor(Math.random() * 20) - 10,
                    direction: Math.random() > 0.5 ? 'up' : 'down',
                },
            };
        case 'chart':
            const variant = widget.presentation?.chart?.variant;
            if (variant === 'donut' || !variant) {
                return {
                    segments: [
                        { label: 'Option A', value: 45 },
                        { label: 'Option B', value: 30 },
                        { label: 'Option C', value: 25 },
                    ],
                };
            }
            if (variant === 'funnel') {
                return {
                    stages: [
                        { label: 'Started', value: 100, percentage: 100 },
                        { label: 'In Progress', value: 75, percentage: 75 },
                        { label: 'Completed', value: 60, percentage: 60 },
                    ],
                };
            }
            return { segments: [] };
        case 'text':
            return {
                content: widget.content || 'Sample insight text',
            };
        default:
            return {};
    }
}
