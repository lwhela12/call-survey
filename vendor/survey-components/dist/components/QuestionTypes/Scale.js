import React, { useState } from 'react';
import styled from 'styled-components';
const Scale = ({ question, onAnswer, disabled }) => {
    const [selected, setSelected] = useState(null);
    const [hoveredValue, setHoveredValue] = useState(null);
    const handleSelect = (value) => {
        setSelected(value);
        // Auto-submit after a short delay
        setTimeout(() => onAnswer(value), 300);
    };
    return (React.createElement(Container, null,
        React.createElement(ScaleWrapper, null,
            React.createElement(BubblesContainer, null, question.options?.map((option) => {
                const value = Number(option.value);
                const isSelected = selected === value;
                const isHovered = hoveredValue === value;
                return (React.createElement(BubbleWrapper, { key: option.value },
                    React.createElement(NumberLabel, null, value),
                    React.createElement(Bubble, { onClick: () => handleSelect(value), onMouseEnter: () => setHoveredValue(value), onMouseLeave: () => setHoveredValue(null), "$isSelected": isSelected, "$isHovered": isHovered, disabled: disabled, "aria-label": `${option.label}: ${option.description}` }, isSelected && React.createElement(CheckMark, null, "\u2713")),
                    React.createElement(Emoji, null, option.emoji),
                    React.createElement(Label, { "$isVisible": option.showText || isHovered }, option.label.split(' ').map((word, i) => (React.createElement("span", { key: i }, word))))));
            })))));
};
const Container = styled.div `
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;
const ScaleWrapper = styled.div `
  position: relative;
  padding: ${({ theme }) => theme.spacing.xl} 0;
`;
const BubblesContainer = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  z-index: 1;

  /* Connecting line rendered as pseudo-element */
  &::before {
    content: '';
    position: absolute;
    top: 43px;           /* Aligned to bubble center: NumberLabel (~19px) + margin (4px) + half bubble (20px) */
    left: 20px;          /* Half of bubble width (40px / 2) to align with bubble centers */
    right: 20px;         /* Half of bubble width (40px / 2) to align with bubble centers */
    height: 2px;
    background: ${({ theme }) => theme.colors.border};
    border-radius: 1px;
    z-index: -1;         /* Keep line behind bubbles */

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
      top: 41px;         /* NumberLabel (~19px) + margin (4px) + half mobile bubble (18px) */
      left: 18px;        /* Half of mobile bubble width (36px / 2) */
      right: 18px;       /* Half of mobile bubble width (36px / 2) */
    }
  }
`;
const BubbleWrapper = styled.div `
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  cursor: pointer;
  min-width: 0;
`;
const NumberLabel = styled.div `
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;
const Bubble = styled.button `
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${({ theme, $isSelected, $isHovered }) => $isSelected ? theme.colors.primary :
    $isHovered ? theme.colors.primary :
        theme.colors.border};
  background: ${({ theme, $isSelected }) => $isSelected ? theme.colors.primary : theme.colors.surface};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover:not(:disabled) {
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 36px;
    height: 36px;
  }
`;
const CheckMark = styled.span `
  color: ${({ theme }) => theme.colors.text.inverse};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: 1;
`;
const Emoji = styled.div `
  font-size: ${({ theme }) => theme.fontSizes.xl};
  line-height: 1;
  margin-top: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fontSizes.lg};
  }
`;
const Label = styled.div `
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: center;
  line-height: 1.2;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 2.4em;  /* Reserve space to prevent layout shift (2 lines at 1.2 line-height) */
  visibility: ${({ $isVisible }) => $isVisible ? 'visible' : 'hidden'};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }
`;
// (unused) Description styled component removed to satisfy TypeScript checker
export default Scale;
//# sourceMappingURL=Scale.js.map
