import React from 'react';
import styled from 'styled-components';
const YesNo = ({ question, onAnswer, disabled }) => {
    // Provide default yes/no options if none are specified in the config
    const options = question.options && question.options.length > 0
        ? question.options
        : [
            { id: 'yes', label: 'Yes', value: 'yes' },
            { id: 'no', label: 'No', value: 'no' }
        ];
    return (React.createElement(Container, null, options.map((option) => (React.createElement(Button, { key: option.id, onClick: () => onAnswer(option.value), disabled: disabled, "$variant": option.value === 'true' || option.value === 'yes' || option.value === 'Yes' ? 'primary' : 'secondary' }, option.label)))));
};
const Container = styled.div `
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;
const Button = styled.button `
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme, $variant }) => $variant === 'primary' ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, $variant }) => $variant === 'primary' ? theme.colors.text.inverse : theme.colors.text.primary};
  border: 2px solid ${({ theme, $variant }) => $variant === 'primary' ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
export default YesNo;
//# sourceMappingURL=YesNo.js.map
