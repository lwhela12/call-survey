import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { dashboardPalette, fontStack } from '../theme';
const Wrapper = styled.div `
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const Row = styled.div `
  display: grid;
  grid-template-columns: 140px 1fr auto;
  gap: 12px;
  align-items: center;
`;
const Label = styled.div `
  font-size: 0.9rem;
  color: #334155;
`;
const Hint = styled.div `
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 2px;
`;
const BarTrack = styled.div `
  position: relative;
  height: 14px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.18);
  overflow: hidden;

  &:after {
    content: '';
    position: absolute;
    inset: 0;
    background: ${({ $accent }) => `linear-gradient(90deg, ${dashboardPalette[$accent].gradientFrom} 0%, ${dashboardPalette[$accent].gradientTo} 100%)`};
    border-radius: inherit;
    transform-origin: left center;
    transform: scaleX(var(--progress, 0));
    transition: transform 0.4s ease;
  }
`;
const Value = styled.div `
  font-family: ${fontStack.number};
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
  text-align: right;
`;
export const FunnelChart = ({ data, maxValue, accent = 'emerald', showValue = true, valueFormat, }) => {
    if (!Array.isArray(data) || data.length === 0) {
        return _jsx(Hint, { children: "No funnel data available." });
    }
    const computedMax = maxValue ?? Math.max(...data.map((d) => d.value || 0), 1);
    return (_jsx(Wrapper, { children: data.map((entry) => {
            const progress = Math.min(1, Math.max(0, entry.value / computedMax));
            return (_jsxs(Row, { children: [_jsxs("div", { children: [_jsx(Label, { children: entry.label }), entry.hint && _jsx(Hint, { children: entry.hint })] }), _jsx(BarTrack, { "$accent": accent, style: { '--progress': progress } }), showValue && (_jsx(Value, { children: valueFormat ? valueFormat(entry.value) : `${entry.value}` }))] }, entry.label));
        }) }));
};
