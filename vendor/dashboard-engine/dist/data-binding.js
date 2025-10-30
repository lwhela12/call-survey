/**
 * Dashboard data binding logic
 * Transforms survey responses into widget-specific data
 */
/**
 * Normalize metric names from snake_case (builder) to camelCase (runtime)
 */
function normalizeMetricName(name) {
    const mapping = {
        'total_responses': 'totalResponses',
        'completed_responses': 'completedResponses',
        'completion_rate': 'completionRate',
        'avg_completion_time': 'avgCompletionTime',
        'opt_in_rate': 'optInRate',
        'avg_donation': 'avgDonation',
    };
    return mapping[name] || name;
}
/**
 * Calculate overall dashboard metrics from survey responses
 */
export function calculateMetrics(responses) {
    const total = responses.length;
    const completed = responses.filter((r) => r.completedAt !== null).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const lastResponse = responses.reduce((latest, response) => {
        const date = response.completedAt || response.createdAt;
        if (!latest || date > latest)
            return date;
        return latest;
    }, undefined);
    return {
        totalResponses: total,
        completedResponses: completed,
        completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal
        lastResponseAt: lastResponse,
    };
}
/**
 * Generate statistics for a specific question
 */
export function generateQuestionStats(responses, questionId) {
    // Filter to completed responses only
    const completedResponses = responses.filter((r) => r.completedAt !== null);
    // Get all answers for this question
    const answers = completedResponses.flatMap((r) => r.answers.filter((a) => a.blockId === questionId));
    // Count answer distribution
    const distribution = {};
    answers.forEach((answer) => {
        // Handle different answer formats
        let value;
        if (typeof answer.answer === 'string') {
            value = answer.answer;
        }
        else if (answer.answer?.value !== undefined) {
            value = String(answer.answer.value);
        }
        else if (answer.answer?.text !== undefined) {
            value = answer.answer.text;
        }
        else {
            value = JSON.stringify(answer.answer);
        }
        distribution[value] = (distribution[value] || 0) + 1;
    });
    // Calculate percentages
    const totalAnswers = answers.length;
    const percentages = {};
    Object.entries(distribution).forEach(([key, count]) => {
        percentages[key] = totalAnswers > 0
            ? Math.round((count / totalAnswers) * 1000) / 10 // Round to 1 decimal
            : 0;
    });
    return {
        questionId,
        totalAnswers,
        answerDistribution: distribution,
        percentages,
    };
}
/**
 * Prepare data for a metric widget (KPI card)
 */
export function prepareMetricData(responses, metricType) {
    const metrics = calculateMetrics(responses);
    const normalized = normalizeMetricName(metricType);
    switch (normalized) {
        case 'totalResponses':
            return {
                value: metrics.totalResponses,
                label: 'Total Responses',
            };
        case 'completionRate':
            return {
                value: `${metrics.completionRate}%`,
                label: 'Completion Rate',
            };
        case 'completedResponses':
            return {
                value: metrics.completedResponses,
                label: 'Completed',
            };
        default:
            return {
                value: 0,
                label: metricType,
            };
    }
}
/**
 * Prepare data for a chart widget (donut, funnel, etc.)
 */
export function prepareChartData(responses, questionId, chartType = 'donut') {
    const stats = generateQuestionStats(responses, questionId);
    // Convert distribution to chart data
    const segments = Object.entries(stats.answerDistribution).map(([label, value]) => ({
        label,
        value,
    }));
    if (chartType === 'funnel' || chartType === 'line' || chartType === 'area') {
        // For funnel/line/area, use stages format with percentages
        return {
            stages: segments.map((segment, index) => ({
                ...segment,
                percentage: stats.percentages[segment.label],
            })),
        };
    }
    // Default donut/pie/bar/radial use segments
    return {
        segments,
    };
}
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
        // For chart/table widgets with single data source in array, return direct data
        if (widget.data.length === 1 && (widget.type === 'chart' || widget.type === 'table')) {
            return bindSingleDataSource(widget.data[0], responses, widget);
        }
        // For widgets with multiple data sources, return map
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
 * Format a number for display
 */
export function formatNumber(value, format) {
    switch (format) {
        case 'percentage':
            return `${Math.round(value * 10) / 10}%`;
        case 'currency':
            return `$${value.toFixed(2)}`;
        default:
            return String(value);
    }
}
/**
 * Calculate trend/delta between two values
 */
export function calculateDelta(current, previous) {
    if (previous === 0)
        return null;
    const diff = current - previous;
    const percentChange = (diff / previous) * 100;
    return {
        value: Math.round(percentChange * 10) / 10,
        direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
        absolute: diff,
    };
}
