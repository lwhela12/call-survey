// frontend/src/components/Survey/QuestionTypes/SingleChoice.tsx
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
// Define animations
const fadeInUp = keyframes `
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;
const SingleChoice = ({ question, onAnswer, disabled }) => {
    const [selected, setSelected] = useState(null);
    const handleSelect = (option) => {
        if (disabled)
            return;
        setSelected(option.value);
        // Actions that should still execute immediately
        if (option.action === 'link' && option.url) {
            window.open(option.url, '_blank');
            return;
        }
        if (option.action === 'close') {
            onAnswer('close');
            return;
        }
        // For normal options, wait for user to confirm
    };
    const handleConfirm = () => {
        if (selected && !disabled) {
            onAnswer(selected);
        }
    };
    return (React.createElement(Container, null,
        React.createElement(OptionsGrid, { "$count": question.options?.length || 0 }, question.options?.map((option, index) => (React.createElement(OptionCard, { key: option.id, onClick: () => handleSelect(option), "$isSelected": selected === option.value, "$isAnimating": false, disabled: disabled, "$delay": index * 0.05 },
            React.createElement(OptionContent, null,
                React.createElement(RadioIndicator, { "$isSelected": selected === option.value }),
                React.createElement(OptionText, null,
                    React.createElement(OptionLabel, null, option.label),
                    option.description && (React.createElement(OptionDescription, null, option.description)))))))),
        React.createElement(ConfirmRow, null,
            React.createElement(ConfirmHint, null, selected ? 'Click confirm to continue' : 'Select one option'),
            React.createElement(ConfirmButton, { onClick: handleConfirm, disabled: !selected || !!disabled }, "Confirm \u2192"))));
};
const Container = styled.div `
  width: 100%;
  padding: 0;
`;
const OptionsGrid = styled.div `
  display: grid;
  grid-template-columns: ${({ $count }) => $count <= 2 ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr'};
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;
const OptionCard = styled.button `
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme, $isSelected }) => $isSelected ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  text-align: left;
  transition: transform ${({ theme }) => theme.transitions.normal}, background-color ${({ theme }) => theme.transitions.normal}, border-color ${({ theme }) => theme.transitions.normal};
  animation: ${fadeInUp} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${({ $delay }) => $delay}s both;
  will-change: transform;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: ${({ theme }) => theme.colors.primary}20;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
  }

  ${({ $isAnimating }) => $isAnimating && `
    &::before {
      width: 300%;
      height: 300%;
    }
  `}

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary}08;
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ theme }) => theme.colors.primary}30;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  ${({ theme, $isSelected }) => $isSelected && `
    background: ${theme.colors.primary}10;
    border-color: ${theme.colors.primary};
    box-shadow: 0 2px 8px ${theme.colors.primary}30;
  `}
`;
const OptionContent = styled.div `
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  position: relative;
  z-index: 1;
`;
const RadioIndicator = styled.div `
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${({ theme, $isSelected }) => $isSelected ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $isSelected }) => $isSelected ? theme.colors.primary : 'transparent'};
  position: relative;
  flex-shrink: 0;
  transition: all ${({ theme }) => theme.transitions.fast};

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: white;
    transition: transform ${({ theme }) => theme.transitions.fast};
  }

  ${({ $isSelected }) => $isSelected && `
    &::after {
      transform: translate(-50%, -50%) scale(1);
    }
  `}
`;
const OptionText = styled.div `
  flex: 1;
`;
const OptionLabel = styled.span `
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  line-height: 1.4;
  font-family: 'Nunito', sans-serif;
`;
const OptionDescription = styled.span `
  display: block;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
  line-height: 1.4;
  font-family: 'Nunito', sans-serif;
`;
const ConfirmRow = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md};
`;
const ConfirmHint = styled.span `
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
const ConfirmButton = styled.button `
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.inverse};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    filter: brightness(0.95);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
export default SingleChoice;
//# sourceMappingURL=SingleChoice.js.map
