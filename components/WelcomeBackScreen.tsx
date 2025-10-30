'use client';

import React from 'react';
import styled from 'styled-components';
import { DefaultTheme } from 'styled-components';

interface WelcomeBackScreenProps {
  onContinue: () => void;
  onStartFresh: () => void;
  progress: number;
  estimatedTimeRemaining: number;
  theme: DefaultTheme;
}

const WelcomeBackScreen: React.FC<WelcomeBackScreenProps> = ({
  onContinue,
  onStartFresh,
  progress,
  estimatedTimeRemaining,
}) => {
  return (
    <Container>
      <ContentWrapper>
        <Logo src="/assets/004-nesolagus-horizontal.png" alt="Nesolagus" />

        <MainTitle>Welcome Back! 👋</MainTitle>

        <ProgressInfo>
          <ProgressText>You're {Math.round(progress)}% complete!</ProgressText>
          <TimeText>About {estimatedTimeRemaining} {estimatedTimeRemaining === 1 ? 'minute' : 'minutes'} remaining</TimeText>
        </ProgressInfo>

        <ButtonGroup>
          <ContinueButton onClick={onContinue}>
            <ButtonText>Continue Where You Left Off</ButtonText>
          </ContinueButton>

          <StartFreshButton onClick={onStartFresh}>
            <SecondaryButtonText>Start Fresh</SecondaryButtonText>
          </StartFreshButton>
        </ButtonGroup>
      </ContentWrapper>
    </Container>
  );
};

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing?.xl || '2rem'} 0;
  background: ${({ theme }) => theme.colors?.background || '#f6f6f4'};
  z-index: 9999;

  @media (max-width: ${({ theme }) => theme.breakpoints?.tablet || '768px'}) {
    padding: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    padding: ${({ theme }) => theme.spacing?.md || '1rem'};
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing?.xl || '2rem'};
  max-width: 800px;
  width: 100%;
  text-align: center;

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    gap: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
  }
`;

const Logo = styled.img`
  height: 60px;
  width: auto;
  margin-bottom: ${({ theme }) => theme.spacing?.md || '1rem'};

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    height: 40px;
  }
`;

const MainTitle = styled.h1`
  color: ${({ theme }) => theme.colors?.primary || '#307355'};
  font-size: 72px;
  font-family: ${({ theme }) => theme.fonts?.heading || 'Poppins, Inter, sans-serif'};
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -2px;
  font-style: normal;

  @media (max-width: ${({ theme }) => theme.breakpoints?.tablet || '768px'}) {
    font-size: 56px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    font-size: 36px;
    letter-spacing: -1px;
  }
`;

const ProgressInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing?.sm || '0.5rem'};
  margin-top: ${({ theme }) => theme.spacing?.md || '1rem'};
`;

const ProgressText = styled.div`
  font-size: 28px;
  font-family: ${({ theme }) => theme.fonts?.body || 'Inter, sans-serif'};
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#1F2937'};

  @media (max-width: ${({ theme }) => theme.breakpoints?.tablet || '768px'}) {
    font-size: 24px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    font-size: 20px;
  }
`;

const TimeText = styled.div`
  font-size: 18px;
  font-family: ${({ theme }) => theme.fonts?.body || 'Inter, sans-serif'};
  font-weight: 300;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#4A5568'};
  opacity: 0.8;

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    font-size: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing?.md || '1rem'};
  margin-top: ${({ theme }) => theme.spacing?.lg || '1.5rem'};
  width: 100%;
  max-width: 500px;

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    max-width: 100%;
  }
`;

const ContinueButton = styled.button`
  background: ${({ theme }) => theme.colors?.primary || '#307355'};
  box-shadow: ${({ theme }) => theme.shadows?.md || '0px 4px 6px rgba(0, 0, 0, 0.1)'};
  border-radius: 42px;
  border: none;
  padding: 20px 48px;
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transitions?.normal || '300ms'},
              box-shadow ${({ theme }) => theme.transitions?.normal || '300ms'},
              background ${({ theme }) => theme.transitions?.normal || '300ms'};

  &:hover {
    background: ${({ theme }) => theme.colors?.secondary || '#B2BB1C'};
    transform: translateY(-2px);
    box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    padding: 18px 36px;
    width: 100%;
  }
`;

const StartFreshButton = styled.button`
  background: transparent;
  border: 2px solid ${({ theme }) => theme.colors?.border || '#E2E8F0'};
  border-radius: 42px;
  padding: 18px 48px;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions?.normal || '300ms'};

  &:hover {
    border-color: ${({ theme }) => theme.colors?.text?.secondary || '#4A5568'};
    background: ${({ theme }) => theme.colors?.surface || '#FFFFFF'};
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    padding: 16px 36px;
    width: 100%;
  }
`;

const ButtonText = styled.span`
  color: ${({ theme }) => theme.colors?.text?.inverse || '#FFFFFF'};
  font-size: 24px;
  font-family: ${({ theme }) => theme.fonts?.body || 'Inter, sans-serif'};
  font-weight: 500;

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    font-size: 18px;
  }
`;

const SecondaryButtonText = styled.span`
  color: ${({ theme }) => theme.colors?.text?.secondary || '#4A5568'};
  font-size: 20px;
  font-family: ${({ theme }) => theme.fonts?.body || 'Inter, sans-serif'};
  font-weight: 400;

  @media (max-width: ${({ theme }) => theme.breakpoints?.mobile || '480px'}) {
    font-size: 16px;
  }
`;

export default WelcomeBackScreen;
