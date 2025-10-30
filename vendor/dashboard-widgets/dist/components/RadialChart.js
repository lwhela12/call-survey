import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { dashboardPalette, fontStack } from '../theme';
import { ResponsiveContainer, RadialBarChart as RechartsRadialBarChart, RadialBar, PolarAngleAxis, } from 'recharts';
export function RadialChart({ data, accent = 'emerald', totalLabel }) {
    const colors = dashboardPalette[accent];
    if (!data || data.length === 0) {
        return (_jsx(EmptyState, { children: _jsx(EmptyText, { children: "No data available" }) }));
    }
    // Take the first/primary segment for radial display
    const primaryData = data[0];
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const percentage = total > 0 ? Math.round((primaryData.value / total) * 100) : 0;
    // Format data for radial chart
    const chartData = [
        {
            name: primaryData.label,
            value: percentage,
            fill: colors.gradientFrom,
        },
    ];
    return (_jsxs(Container, { children: [_jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(RechartsRadialBarChart, { cx: "50%", cy: "50%", innerRadius: "60%", outerRadius: "90%", data: chartData, startAngle: 90, endAngle: -270, children: [_jsx(PolarAngleAxis, { type: "number", domain: [0, 100], angleAxisId: 0, tick: false }), _jsx(RadialBar, { background: true, dataKey: "value", cornerRadius: 10, fill: colors.gradientFrom })] }) }), _jsxs(CenterLabel, { children: [_jsxs(Percentage, { color: colors.gradientFrom, children: [percentage, "%"] }), _jsx(Label, { children: primaryData.label })] })] }));
}
const Container = styled.div `
  width: 100%;
  height: 100%;
  min-height: 200px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${fontStack.title};
`;
const CenterLabel = styled.div `
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
`;
const Percentage = styled.div `
  font-family: ${fontStack.number};
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 0.25rem;
  color: ${props => props.color};
`;
const Label = styled.div `
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
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
