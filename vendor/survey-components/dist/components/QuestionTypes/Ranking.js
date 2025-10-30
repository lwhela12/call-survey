import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { DndContext, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
const Ranking = ({ question, onAnswer, disabled }) => {
    const initialItems = useMemo(() => question.options ?? [], [question.options]);
    const [items, setItems] = useState(initialItems);
    const maxSelections = question.maxSelections || Math.min(3, items.length || 3);
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 10 }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5
            }
        }),
        useSensor(KeyboardSensor)
    );
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id)
            return;
        setItems(prev => {
            const oldIndex = prev.findIndex(item => item.id === active.id);
            const newIndex = prev.findIndex(item => item.id === over.id);
            if (oldIndex === -1 || newIndex === -1)
                return prev;
            return arrayMove(prev, oldIndex, newIndex);
        });
    };
    const handleDragStart = (event) => {
        // Haptic feedback for mobile devices
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    };
    const handleSubmit = () => {
        const selected = items.slice(0, maxSelections).map(option => option.value);
        onAnswer(selected);
    };
    return (React.createElement(Container, null,
        React.createElement(Instructions, null, "Drag and drop to rank your choices"),
        React.createElement(DndContext, { sensors: sensors, collisionDetection: closestCenter, onDragStart: handleDragStart, onDragEnd: handleDragEnd },
            React.createElement(SortableContext, { items: items.map(item => item.id), strategy: verticalListSortingStrategy },
                React.createElement(Options, null, items.map((option, index) => (React.createElement(SortableOption, { key: option.id, id: option.id, label: option.label, index: index, isTopChoice: index < maxSelections })))))),
        React.createElement(SubmitSection, null,
            React.createElement(Hint, null,
                "Your top ",
                maxSelections,
                " choices will be submitted"),
            React.createElement(SubmitButton, { onClick: handleSubmit, disabled: disabled },
                "Continue with Top ",
                maxSelections))));
};
const SortableOption = ({ id, label, index, isTopChoice }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };
    return (React.createElement(Option, { ref: setNodeRef, style: style, "$isTopChoice": isTopChoice, "$isDragging": isDragging, ...attributes, ...listeners },
        React.createElement(Handle, { "aria-hidden": true }, "\u2261"),
        React.createElement(Rank, { "$isTopChoice": isTopChoice }, index + 1),
        React.createElement(Label, null, label)));
};
const Container = styled.div `
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;
const Instructions = styled.p `
  margin: 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;
const Options = styled.div `
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;
const Option = styled.div `
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, $isTopChoice }) => $isTopChoice ? theme.colors.primary + '10' : theme.colors.surface};
  border: 2px solid ${({ theme, $isTopChoice }) => $isTopChoice ? theme.colors.primary + '40' : theme.colors.border};
  box-shadow: ${({ $isDragging }) => $isDragging ? '0 16px 24px rgba(0,0,0,0.12)' : 'none'};
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: none;
  transition: box-shadow 0.2s ease, background 0.2s ease, transform 0.2s ease;
`;
const Handle = styled.span `
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;
const Rank = styled.span `
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme, $isTopChoice }) => $isTopChoice ? theme.colors.primary : theme.colors.text.primary};
  background: ${({ theme, $isTopChoice }) => $isTopChoice ? theme.colors.primary + '20' : theme.colors.surface};
`;
const Label = styled.span `
  flex: 1;
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.colors.text.primary};
`;
const SubmitSection = styled.div `
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
`;
const Hint = styled.span `
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
`;
const SubmitButton = styled.button `
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: none;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.accent}
  );
  color: ${({ theme }) => theme.colors.text.inverse};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: translateY(-2px);
  }
`;
export default Ranking;
//# sourceMappingURL=Ranking.js.map
