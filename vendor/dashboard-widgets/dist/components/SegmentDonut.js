import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { dashboardPalette, fontStack } from '../theme';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, } from 'recharts';
const ChartContainer = styled.div `
  display: grid;
  grid-template-columns: minmax(220px, 260px) 1fr;
  gap: 16px;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
const LegendList = styled.ul `
  display: grid;
  gap: 10px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;
`;
const LegendItem = styled.li `
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: #ffffff;
  box-shadow: 0 12px 30px -24px rgba(15, 23, 42, 0.35);

  &:before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: ${({ $color }) => $color};
    margin-right: 10px;
  }
`;
const LegendLabel = styled.span `
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const LegendValue = styled.span `
  font-family: ${fontStack.number};
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
`;
const TotalBadge = styled.div `
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${({ $accent }) => dashboardPalette[$accent].surface};
  color: ${({ $accent }) => dashboardPalette[$accent].text};
  margin-bottom: 16px;
`;
const DefaultColors = ['#16a34a', '#0ea5e9', '#7c3aed', '#f59e0b', '#fb7185', '#22d3ee'];
export const SegmentDonut = ({ data, totalLabel, accent = 'emerald', formatValue, }) => {
    if (!Array.isArray(data) || data.length === 0) {
        return _jsx("span", { style: { fontSize: '0.85rem', color: '#94a3b8' }, children: "No segmentation data available." });
    }
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    return (_jsxs("div", { children: [totalLabel && (_jsxs(TotalBadge, { "$accent": accent, children: [_jsx("span", { children: totalLabel }), _jsx("span", { children: formatValue ? formatValue(total) : total })] })), _jsxs(ChartContainer, { children: [_jsx("div", { style: { width: '100%', height: 220 }, children: _jsx(ResponsiveContainer, { children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, dataKey: "value", nameKey: "label", innerRadius: 60, outerRadius: 90, paddingAngle: 2, stroke: "#fff", strokeWidth: 2, isAnimationActive: true, children: data.map((item, idx) => (_jsx(Cell, { fill: item.color ?? DefaultColors[idx % DefaultColors.length] }, item.label))) }), _jsx(Tooltip, { formatter: (value, _name, entry) => [
                                            formatValue ? formatValue(value) : value,
                                            entry && typeof entry?.name === 'string' ? entry.name : '',
                                        ] })] }) }) }), _jsx(LegendList, { children: data.map((item, idx) => (_jsxs(LegendItem, { "$color": item.color ?? DefaultColors[idx % DefaultColors.length], children: [_jsx(LegendLabel, { children: item.label }), _jsx(LegendValue, { children: formatValue ? formatValue(item.value) : item.value })] }, item.label))) })] })] }));
};
