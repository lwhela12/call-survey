import React, { useState } from 'react';
import styled from 'styled-components';
const SemanticDifferential = ({ question, onAnswer, disabled }) => {
    const [values, setValues] = useState({});
    const handleScaleChange = (scaleId, value) => {
        setValues(prev => ({
            ...prev,
            [scaleId]: value
        }));
    };
    const handleSubmit = () => {
        if (Object.keys(values).length === question.scales?.length) {
            onAnswer(values);
        }
    };
    const allScalesCompleted = Object.keys(values).length === question.scales?.length;
    return (React.createElement(Container, null,
        React.createElement(ScalesContainer, null, question.scales?.map((scale) => (React.createElement(ScaleRow, { key: scale.id },
            React.createElement(LeftLabel, null, scale.leftLabel),
            React.createElement(ScalePoints, null, [1, 2, 3, 4, 5].map((value) => (React.createElement(ScalePoint, { key: value, "$isSelected": values[scale.variable] === value, onClick: () => handleScaleChange(scale.variable, value), disabled: disabled })))),
            React.createElement(RightLabel, null, scale.rightLabel))))),
        React.createElement(SubmitButton, { onClick: handleSubmit, disabled: !allScalesCompleted || disabled }, "Continue")));
};
const Container = styled.div `
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;
const ScalesContainer = styled.div `
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;
const ScaleRow = styled.div `
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;
const LeftLabel = styled.span `
  text-align: right;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    text-align: left;
  }
`;
const RightLabel = styled.span `
  text-align: left;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    text-align: right;
  }
`;
const ScalePoints = styled.div `
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    justify-content: space-between;
    width: 100%;
  }
`;
const ScalePoint = styled.button `
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid ${({ theme, $isSelected }) => $isSelected ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $isSelected }) => $isSelected ? theme.colors.primary : theme.colors.background};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
const SubmitButton = styled.button `
  align-self: flex-start;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primary}dd;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
export default SemanticDifferential;
//# sourceMappingURL=SemanticDifferential.js.map
