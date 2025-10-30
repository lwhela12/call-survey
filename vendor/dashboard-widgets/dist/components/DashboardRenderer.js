'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { KpiStatCard } from './KpiStatCard';
import { FunnelChart } from './FunnelChart';
import { SegmentDonut } from './SegmentDonut';
import { BarChart } from './BarChart';
import { RadialChart } from './RadialChart';
import { LineChart } from './LineChart';
import { AreaChart } from './AreaChart';
import { InsightHighlight } from './InsightHighlight';
import { createDashboardEngine } from '@nesolagus/dashboard-engine';
const GRID_COLUMNS = 12;
const GRID_GAP = 16;
const CELL_HEIGHT = 96;
/**
 * DashboardRenderer - Renders dashboard widgets in a grid layout
 * Uses the dashboard configuration from the builder to display widgets with real data
 */
export function DashboardRenderer({ config, responses, mode = 'runtime', aiSummary, className = '', }) {
    const containerRef = useRef(null);
    const [columnWidth, setColumnWidth] = useState(180);
    // Create dashboard engine instance
    const engine = useMemo(() => createDashboardEngine(), []);
    // Extract widgets from config
    const widgets = config?.widgets || [];
    // Resolve theme using engine (handles defaults and merging)
    const theme = useMemo(() => engine.resolveTheme(config), [engine, config]);
    const title = config?.metadata?.title;
    const backgroundColor = theme.backgroundColor;
    const cardColor = theme.cardColor;
    // Measure container and calculate column width dynamically
    const measureColumns = useCallback(() => {
        const element = containerRef.current;
        if (!element)
            return;
        const width = element.clientWidth;
        const totalGap = GRID_GAP * (GRID_COLUMNS - 1);
        const available = width - totalGap;
        if (available <= 0)
            return;
        const computed = available / GRID_COLUMNS;
        setColumnWidth((prev) => (Math.abs(prev - computed) > 1 ? computed : prev));
    }, []);
    useEffect(() => {
        measureColumns();
        window.addEventListener('resize', measureColumns);
        return () => window.removeEventListener('resize', measureColumns);
    }, [measureColumns]);
    // Calculate container height and grid dimensions
    const { totalRows, columnSpanPx, rowSpanPx } = useMemo(() => {
        if (widgets.length === 0) {
            return { totalRows: 0, columnSpanPx: columnWidth + GRID_GAP, rowSpanPx: CELL_HEIGHT + GRID_GAP };
        }
        const maxY = Math.max(...widgets.map((w) => w.layout.y + w.layout.h));
        return {
            totalRows: maxY,
            columnSpanPx: columnWidth + GRID_GAP,
            rowSpanPx: CELL_HEIGHT + GRID_GAP,
        };
    }, [widgets, columnWidth]);
    // Empty state
    if (!widgets || widgets.length === 0) {
        return (_jsx("div", { className: `rounded-lg border border-gray-200 bg-white p-12 text-center ${className}`, children: _jsx("p", { className: "text-gray-500", children: "No dashboard widgets configured" }) }));
    }
    return (_jsxs("div", { className: className, style: { backgroundColor }, children: [title && (_jsx("div", { className: "mb-8", children: _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: title }) })), _jsx("div", { ref: containerRef, className: "relative w-full", style: {
                    minHeight: totalRows > 0
                        ? `${totalRows * CELL_HEIGHT + Math.max(0, totalRows - 1) * GRID_GAP}px`
                        : '400px',
                }, children: widgets.map((widget) => {
                    const { x, y, w, h } = widget.layout;
                    const widthPx = w * columnWidth + (w - 1) * GRID_GAP;
                    const heightPx = h * CELL_HEIGHT + (h - 1) * GRID_GAP;
                    const leftPx = x * columnSpanPx;
                    const topPx = y * rowSpanPx;
                    // Bind data to widget using engine
                    const widgetData = engine.bindWidgetData(widget, responses);
                    return (_jsxs("div", { className: "absolute flex flex-col rounded-xl border border-gray-200 shadow-sm", style: {
                            width: `${widthPx}px`,
                            height: `${heightPx}px`,
                            transform: `translate(${leftPx}px, ${topPx}px)`,
                            backgroundColor: cardColor,
                        }, children: [_jsx("div", { className: "flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-700", children: _jsx("span", { className: "truncate", children: widget.title || 'Untitled widget' }) }), _jsx("div", { className: "relative flex-1 p-4", style: { overflow: 'auto', backgroundColor: cardColor }, children: _jsx(WidgetContent, { widget: widget, data: widgetData, aiSummary: aiSummary }) })] }, widget.id));
                }) })] }));
}
/**
 * Render individual widget content based on type
 */
function WidgetContent({ widget, data, aiSummary }) {
    const accent = widget.accent || 'emerald';
    switch (widget.type) {
        case 'metric':
            return (_jsx(KpiStatCard, { title: widget.title || 'Metric', value: String(data.value || 0), subtitle: data.label, delta: data.delta ? {
                    value: String(data.delta.value),
                    direction: data.delta.direction,
                    label: data.delta.label,
                } : undefined, accent: accent }));
        case 'chart':
            const chartVariant = widget.presentation?.chart?.variant;
            if (chartVariant === 'donut' || !chartVariant) {
                return (_jsx(SegmentDonut, { data: data.segments || [], accent: accent, totalLabel: widget.subtitle }));
            }
            if (chartVariant === 'funnel') {
                return (_jsx(FunnelChart, { data: data.stages || [], accent: accent }));
            }
            if (chartVariant === 'bar') {
                return (_jsx(BarChart, { data: data.segments || [], accent: accent, totalLabel: widget.subtitle }));
            }
            if (chartVariant === 'radial') {
                return (_jsx(RadialChart, { data: data.segments || [], accent: accent, totalLabel: widget.subtitle }));
            }
            if (chartVariant === 'line') {
                return (_jsx(LineChart, { data: data.stages || [], accent: accent, totalLabel: widget.subtitle }));
            }
            if (chartVariant === 'area') {
                return (_jsx(AreaChart, { data: data.stages || [], accent: accent, totalLabel: widget.subtitle }));
            }
            // Fallback for unsupported chart types
            return _jsxs("div", { className: "text-sm text-gray-500", children: ["Chart type not supported: ", chartVariant] });
        case 'text':
            return (_jsx(InsightHighlight, { title: widget.title || 'Insight', body: data.content || widget.content || '', eyebrow: widget.subtitle, accent: accent }));
        case 'custom':
            // Handle custom widgets
            if (widget.component === 'ai-summary') {
                // Use aiSummary prop if available (studio preview), otherwise fall back to data
                const summaryData = aiSummary || data;
                return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "text-sm text-gray-700", children: summaryData?.summary || 'No summary available' }), summaryData?.insights && summaryData.insights.length > 0 && (_jsx("ul", { className: "list-disc list-inside space-y-1 text-sm text-gray-600", children: summaryData.insights.map((insight, i) => (_jsx("li", { children: insight }, i))) }))] }));
            }
            return _jsxs("div", { className: "text-sm text-gray-500", children: ["Custom widget: ", widget.component] });
        case 'table':
            // Table widget rendering
            if (data.rows && data.columns) {
                return (_jsx("div", { className: "overflow-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { children: _jsx("tr", { className: "border-b", children: data.columns.map((col) => (_jsx("th", { className: "text-left p-2 font-semibold", children: col.label }, col.key))) }) }), _jsx("tbody", { children: data.rows.map((row, i) => (_jsx("tr", { className: "border-b", children: data.columns.map((col) => (_jsx("td", { className: "p-2", children: row[col.key] }, col.key))) }, i))) })] }) }));
            }
            return _jsx("div", { className: "text-sm text-gray-500", children: "No table data" });
        default:
            return _jsxs("div", { className: "text-sm text-gray-500", children: ["Unknown widget type: ", widget.type] });
    }
}
