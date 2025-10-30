import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled, { css } from 'styled-components';
import { dashboardPalette, fontStack, cardShadow } from '../theme';
const Card = styled.div `
  background: #ffffff;
  border-radius: 20px;
  padding: ${({ $compact }) => ($compact ? '18px 20px' : '24px 28px')};
  box-shadow: ${cardShadow};
  display: flex;
  flex-direction: column;
  gap: ${({ $compact }) => ($compact ? '12px' : '16px')};
  text-align: ${({ $align }) => $align};
`;
const TitleRow = styled.div `
  display: flex;
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'center' ? 'center' : 'space-between')};
  gap: 12px;
`;
const IconWrap = styled.div `
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $accent }) => dashboardPalette[$accent].surface};
  color: ${({ $accent }) => dashboardPalette[$accent].text};
`;
const Title = styled.h3 `
  font-family: ${fontStack.title};
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
  margin: 0;
`;
const ValueRow = styled.div `
  display: flex;
  align-items: baseline;
  justify-content: ${({ $align }) => ($align === 'center' ? 'center' : 'space-between')};
  gap: 16px;
`;
const Value = styled.span `
  font-family: ${fontStack.number};
  font-size: 2.25rem;
  font-weight: 700;
  color: ${({ $accent }) => dashboardPalette[$accent].text};
`;
const Subtitle = styled.p `
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
`;
const Footnote = styled.p `
  margin: 0;
  font-size: 0.75rem;
  color: #94a3b8;
`;
const DeltaPill = styled.span `
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;

  ${({ $tone }) => {
    switch ($tone) {
        case 'positive':
            return css `
          background: rgba(34, 197, 94, 0.12);
          color: #15803d;
        `;
        case 'negative':
            return css `
          background: rgba(239, 68, 68, 0.12);
          color: #b91c1c;
        `;
        default:
            return css `
          background: rgba(148, 163, 184, 0.16);
          color: #475569;
        `;
    }
}}
`;
const DirectionGlyph = ({ direction }) => {
    if (direction === 'up') {
        return _jsx("span", { style: { fontSize: '0.85rem' }, children: "\u25B2" });
    }
    if (direction === 'down') {
        return _jsx("span", { style: { fontSize: '0.85rem' }, children: "\u25BC" });
    }
    return _jsx("span", { style: { fontSize: '0.85rem' }, children: "\u2022" });
};
export const KpiStatCard = ({ title, value, subtitle, icon, delta, footnote, accent = 'emerald', compact = false, align = 'left', }) => {
    return (_jsxs(Card, { "$compact": compact, "$align": align, children: [_jsxs(TitleRow, { "$align": align, children: [_jsx(Title, { children: title }), icon && _jsx(IconWrap, { "$accent": accent, children: icon })] }), _jsxs(ValueRow, { "$align": align, children: [_jsxs("div", { children: [_jsx(Value, { "$accent": accent, children: value }), subtitle && _jsx(Subtitle, { children: subtitle })] }), delta && (_jsxs(DeltaPill, { "$tone": delta.tone ?? 'neutral', "$direction": delta.direction ?? 'neutral', children: [_jsx(DirectionGlyph, { direction: delta.direction ?? 'neutral' }), _jsx("span", { children: delta.value }), delta.label && _jsx("span", { children: delta.label })] }))] }), footnote && _jsx(Footnote, { children: footnote })] }));
};
