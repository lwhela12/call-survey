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
    if (chartType === 'funnel') {
        // For funnel, calculate cumulative/sequential stages
        return {
            stages: segments.map((segment, index) => ({
                ...segment,
                percentage: stats.percentages[segment.label],
            })),
        };
    }
    // Default donut/pie
    return {
        segments,
    };
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
