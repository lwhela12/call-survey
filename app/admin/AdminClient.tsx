'use client';

import { useMemo } from 'react';
import { DefaultTheme } from 'styled-components';
import { PasswordGate } from './PasswordGate';
import { generateAllChartData } from './lib/chart-data';
import { KpiStatCard, BarChart } from '@nesolagus/dashboard-widgets';

type SurveyAnswer = {
  id: string;
  responseId: string;
  blockId: string;
  answer: any;
  createdAt: Date;
};

type SurveyResponse = {
  id: string;
  sessionId: string;
  completedAt: Date | null;
  answers: SurveyAnswer[];
};

type AdminClientProps = {
  responses: SurveyResponse[];
  surveyConfig: any;
  theme: DefaultTheme;
};

export function AdminClient({ responses, surveyConfig, theme }: AdminClientProps) {
  // Generate chart data for all questions
  const chartData = useMemo(() => {
    return generateAllChartData(surveyConfig, responses);
  }, [surveyConfig, responses]);

  return (
    <PasswordGate theme={theme}>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: theme.colors?.background || '#f6f6f4',
          padding: '2rem'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: theme.colors?.text?.primary || '#1F2937',
                fontFamily: theme.fonts?.heading || 'inherit',
                marginBottom: '0.5rem'
              }}
            >
              Admin Dashboard
            </h1>
            <p
              style={{
                color: theme.colors?.text?.secondary || '#4A5568',
                fontSize: '1rem'
              }}
            >
              {surveyConfig.survey.name}
            </p>
          </div>

          {/* Total Responses KPI */}
          <div style={{ marginBottom: '2.5rem' }}>
            <KpiStatCard
              title="Total Responses"
              value={responses.length}
              subtitle="Completed surveys"
              accent="emerald"
            />
          </div>

          {/* Question Charts Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
              gap: '2rem'
            }}
          >
            {chartData.map((chart) => (
              <div
                key={chart.blockId}
                style={{
                  backgroundColor: theme.colors?.surface || '#FFFFFF',
                  borderRadius: theme.borderRadius?.lg || '1rem',
                  padding: '1.75rem',
                  boxShadow: theme.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Question Title */}
                <div style={{ marginBottom: '1.25rem', flexShrink: 0 }}>
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: theme.colors?.text?.primary || '#1F2937',
                      lineHeight: '1.5',
                      fontFamily: theme.fonts?.heading || 'inherit'
                    }}
                  >
                    {chart.question}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: theme.colors?.text?.light || '#718096',
                      marginTop: '0.25rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    {chart.type === 'ranking'
                      ? 'Weighted Scores (1st=3pts, 2nd=2pts, 3rd=1pt)'
                      : chart.type === 'multi-choice'
                      ? 'Multiple Selections Allowed'
                      : chart.type === 'scale'
                      ? 'Rating Scale'
                      : 'Single Selection'}
                  </p>
                </div>

                {/* Chart */}
                {chart.data.length > 0 ? (
                  <div style={{ height: '350px' }}>
                    <BarChart
                      data={chart.data}
                      accent="emerald"
                    />
                  </div>
                ) : (
                  <p
                    style={{
                      color: theme.colors?.text?.secondary || '#4A5568',
                      fontSize: '0.875rem',
                      fontStyle: 'italic',
                      textAlign: 'center',
                      padding: '2rem'
                    }}
                  >
                    No responses yet
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {chartData.length === 0 && (
            <div
              style={{
                backgroundColor: theme.colors?.surface || '#FFFFFF',
                borderRadius: theme.borderRadius?.lg || '1rem',
                padding: '3rem',
                textAlign: 'center',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <p
                style={{
                  color: theme.colors?.text?.secondary || '#4A5568',
                  fontSize: '1rem'
                }}
              >
                No chartable questions found in this survey.
              </p>
            </div>
          )}
        </div>
      </div>
    </PasswordGate>
  );
}
