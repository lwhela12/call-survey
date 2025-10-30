import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { dashboardPalette, fontStack } from '../theme';
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, } from 'recharts';
export function BarChart({ data, accent = 'emerald', totalLabel }) {
    const colors = dashboardPalette[accent];
    if (!data || data.length === 0) {
        return (_jsx(EmptyState, { children: _jsx(EmptyText, { children: "No data available" }) }));
    }
    // Sort by value descending
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    return (_jsx(Container, { children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(RechartsBarChart, { data: sortedData, layout: "vertical", margin: { top: 10, right: 30, left: 10, bottom: 10 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }), _jsx(XAxis, { type: "number", stroke: "#94a3b8", style: { fontSize: '0.75rem' } }), _jsx(YAxis, { dataKey: "label", type: "category", width: 120, stroke: "#94a3b8", style: { fontSize: '0.75rem' } }), _jsx(Tooltip, { cursor: { fill: 'rgba(0, 0, 0, 0.05)' }, contentStyle: {
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                        } }), _jsx(Bar, { dataKey: "value", radius: [0, 4, 4, 0], children: sortedData.map((entry, index) => (_jsx(Cell, { fill: colors.gradientFrom }, `cell-${index}`))) })] }) }) }));
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
