import React from 'react';
import styled from 'styled-components';
const FinalMessage = ({ question, onAnswer }) => {
    return (React.createElement(Container, null,
        React.createElement(Message, null, question.content),
        React.createElement(ButtonGroup, null, question.options?.map((option) => (React.createElement(ActionButton, { key: option.id, onClick: () => {
                if (option.action === 'link' && option.url) {
                    window.open(option.url, '_blank');
                }
                else if (option.action === 'complete') {
                    onAnswer({ action: 'complete' });
                }
            }, "$variant": option.id === 'explore' ? 'primary' : 'secondary' }, option.label))))));
};
const Container = styled.div `
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;
const Message = styled.p `
  font-size: ${({ theme }) => theme.fontSizes.lg};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  white-space: pre-wrap;
`;
const ButtonGroup = styled.div `
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  flex-wrap: wrap;
`;
const ActionButton = styled.button `
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme, $variant }) => $variant === 'primary' ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, $variant }) => $variant === 'primary' ? theme.colors.text.inverse : theme.colors.text.primary};
  border: 2px solid ${({ theme, $variant }) => $variant === 'primary' ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: ${({ theme }) => theme.fontSizes.base};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;
export default FinalMessage;
//# sourceMappingURL=FinalMessage.js.map
