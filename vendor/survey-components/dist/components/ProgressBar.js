// frontend/src/components/Survey/ProgressBar.tsx
import React from 'react';
import styled, { keyframes, useTheme } from 'styled-components';
const ProgressBar = ({ progress }) => {
    const theme = useTheme();
    const config = theme.progressBar;
    const getMessage = () => {
        if (!config?.messages) {
            // Fallback to default messages if not configured
            if (progress < 25)
                return "Just getting started! 🎨";
            if (progress < 50)
                return "You're doing great! 🌟";
            if (progress < 75)
                return "Almost there! 💫";
            if (progress < 100)
                return "Final stretch! 🎯";
            return "Complete! 🎉";
        }
        if (progress < 25)
            return config.messages.start;
        if (progress < 50)
            return config.messages.quarter;
        if (progress < 75)
            return config.messages.half;
        if (progress < 100)
            return config.messages.threeQuarters;
        return config.messages.complete;
    };
    return (React.createElement(Container, null,
        React.createElement(ProgressInfo, null,
            React.createElement(Label, null, getMessage()),
            React.createElement(Percentage, null,
                Math.round(progress),
                "%")),
        React.createElement(BarContainer, { "$height": config?.styling?.height },
            React.createElement(BarBackground, null),
            React.createElement(BarFill, { "$progress": progress },
                React.createElement(BarGlow, null),
                React.createElement(BarShimmer, null)),
            config?.showMilestones !== false && (React.createElement(Milestones, null,
                React.createElement(Milestone, { "$active": progress >= 25, "$position": 25, title: "25%" }),
                React.createElement(Milestone, { "$active": progress >= 50, "$position": 50, title: "50%" }),
                React.createElement(Milestone, { "$active": progress >= 75, "$position": 75, title: "75%" }))))));
};
const shimmer = keyframes `
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
`;
const pulse = keyframes `
  0% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
`;
const Container = styled.div `
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.sm};
`;
const ProgressInfo = styled.div `
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;
const Label = styled.span `
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.progressBar?.colors?.text || '#4A90E2'};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-family: 'Nunito', sans-serif;
`;
const Percentage = styled.span `
  font-size: ${({ theme }) => theme.fontSizes.base};
  color: ${({ theme }) => theme.progressBar?.colors?.text || '#4A90E2'};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-family: 'Nunito', sans-serif;
`;
const BarContainer = styled.div `
  position: relative;
  width: 100%;
  height: ${({ $height }) => $height || 12}px;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;
const BarBackground = styled.div `
  position: absolute;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.progressBar?.colors?.background || 'rgba(74, 144, 226, 0.1)'};
  border-radius: ${({ theme }) => theme.progressBar?.styling?.borderRadius || theme.borderRadius.full};
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
`;
const BarFill = styled.div `
  position: absolute;
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: ${({ theme }) => theme.progressBar?.colors?.fill || '#4A90E2'};
  border-radius: ${({ theme }) => theme.progressBar?.styling?.borderRadius || theme.borderRadius.full};
  transition: width ${({ theme }) => theme.transitions.slow} ease-out;
  overflow: hidden;
  box-shadow:
    0 2px 8px ${({ theme }) => theme.progressBar?.colors?.fill ? `${theme.progressBar.colors.fill}66` : 'rgba(74, 144, 226, 0.4)'},
    inset 0 1px 2px rgba(255, 255, 255, 0.4);
`;
const BarGlow = styled.div `
  position: absolute;
  top: 0;
  right: -10px;
  width: 20px;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
  filter: blur(4px);
  animation: ${pulse} 2s ease-in-out infinite;
`;
const BarShimmer = styled.div `
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: ${shimmer} 3s linear infinite;
`;
const Milestones = styled.div `
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
`;
const Milestone = styled.div `
  position: absolute;
  left: ${({ $position }) => $position}%;
  width: 16px;
  height: 16px;
  background: ${({ $active, theme }) => $active ? (theme.progressBar?.colors?.milestone || '#4A90E2') : theme.colors.background};
  border: 3px solid ${({ $active, theme }) => $active ? (theme.progressBar?.colors?.milestone || '#4A90E2') : `${theme.progressBar?.colors?.milestone || '#4A90E2'}4D`};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transform: translateX(-50%) scale(${({ $active }) => $active ? 1 : 0.8});
  transition: all ${({ theme }) => theme.transitions.normal};
  cursor: pointer;

  ${({ $active, theme }) => $active && `
    box-shadow:
      0 0 0 6px ${theme.progressBar?.colors?.milestone ? `${theme.progressBar.colors.milestone}26` : 'rgba(74, 144, 226, 0.15)'},
      0 2px 8px ${theme.progressBar?.colors?.milestone ? `${theme.progressBar.colors.milestone}4D` : 'rgba(74, 144, 226, 0.3)'};
  `}

  &::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: ${({ theme }) => theme.borderRadius.full};
  }
`;
export default ProgressBar;
//# sourceMappingURL=ProgressBar.js.map
