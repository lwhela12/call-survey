import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { dashboardPalette, fontStack } from '../theme';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, } from 'recharts';
export function LineChart({ data, accent = 'emerald', totalLabel }) {
    const colors = dashboardPalette[accent];
    if (!data || data.length === 0) {
        return (_jsx(EmptyState, { children: _jsx(EmptyText, { children: "No data available" }) }));
    }
    return (_jsx(Container, { children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(RechartsLineChart, { data: data, margin: { top: 10, right: 30, left: 0, bottom: 10 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }), _jsx(XAxis, { dataKey: "label", stroke: "#94a3b8", style: { fontSize: '0.75rem' }, tick: { fill: '#64748b' } }), _jsx(YAxis, { stroke: "#94a3b8", style: { fontSize: '0.75rem' }, tick: { fill: '#64748b' } }), _jsx(Tooltip, { contentStyle: {
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                        } }), _jsx(Line, { type: "monotone", dataKey: "value", stroke: colors.gradientFrom, strokeWidth: 3, dot: { fill: colors.gradientFrom, r: 4 }, activeDot: { r: 6 } })] }) }) }));
}
const Container = styled.div `
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  font-family: ${fontStack.title};
`;
const EmptyState = styled.div `
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
`;
const EmptyText = styled.p `
  color: #94a3b8;
  font-size: 0.875rem;
  font-family: ${fontStack.title};
`;
