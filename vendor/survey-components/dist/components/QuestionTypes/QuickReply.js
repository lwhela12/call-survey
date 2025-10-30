// frontend/src/components/Survey/QuestionTypes/QuickReply.tsx
import React from 'react';
import styled, { css } from 'styled-components';
const QuickReply = ({ question, onAnswer, disabled }) => {
    const getButtonVariant = (index) => {
        const variants = ['primary', 'secondary', 'accent'];
        return variants[index % variants.length];
    };
    return (React.createElement(Container, null,
        question.options?.map((option, index) => (React.createElement(Button, { key: option.id, onClick: () => onAnswer(option.value), disabled: disabled, "$variant": getButtonVariant(index) },
            React.createElement(ButtonContent, null,
                React.createElement(ButtonText, null, option.label),
                React.createElement(ButtonIcon, null, "\u2192"))))),
        question.buttonText && (React.createElement(Button, { onClick: () => onAnswer('continue'), disabled: disabled, "$variant": "primary" },
            React.createElement(ButtonContent, null,
                React.createElement(ButtonText, null, question.buttonText),
                React.createElement(ButtonIcon, null, "\u2192"))))));
};
const Container = styled.div `
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  max-width: 600px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;
const ButtonContent = styled.span `
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  transition: gap ${({ theme }) => theme.transitions.fast};
`;
const ButtonText = styled.span `
  font-weight: ${({ theme }) => theme.fontWeights.medium};
`;
const ButtonIcon = styled.span `
  opacity: 0;
  transform: translateX(-10px);
  transition: all ${({ theme }) => theme.transitions.fast};
`;
const Button = styled.button `
  position: relative;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 2px solid;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.base};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  white-space: nowrap;
  overflow: hidden;
  
  ${({ theme, $variant }) => {
    switch ($variant) {
        case 'primary':
            return css `
          border-color: ${theme.colors.primary};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.primary};
            color: ${theme.colors.text.inverse};
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 85, 165, 0.3);
          }
        `;
        case 'secondary':
            return css `
          border-color: ${theme.colors.secondary};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.secondary};
            color: ${theme.colors.text.primary};
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(178, 187, 28, 0.3);
          }
        `;
        case 'accent':
            return css `
          border-color: ${theme.colors.accent};

          &:hover:not(:disabled) {
            background: ${theme.colors.accent};
            color: ${theme.colors.text.inverse};
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(132, 94, 194, 0.3);
          }
        `;
    }
}}
  
  &:hover:not(:disabled) {
    ${ButtonContent} {
      gap: ${({ theme }) => theme.spacing.md};
    }
    
    ${ButtonIcon} {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100%;
    justify-content: center;
  }
`;
export default QuickReply;
//# sourceMappingURL=QuickReply.js.map
