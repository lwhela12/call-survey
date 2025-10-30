import { prisma } from '@/lib/db';
import { getSurveyConfig, getDeploymentId } from '@/lib/config';
import { AdminClient } from './AdminClient';
import surveyTheme from '@/config/theme.json';
import { DefaultTheme } from 'styled-components';

export const dynamic = 'force-dynamic';

async function getResponses() {
  const deploymentId = getDeploymentId();

  const responses = await prisma.surveyResponse.findMany({
    where: {
      deploymentId: deploymentId,
      completedAt: { not: null },
    },
    include: {
      answers: true,
    },
    orderBy: {
      completedAt: 'desc',
    },
  });

  return responses;
}

export default async function AdminPage() {
  const responses = await getResponses();
  const surveyConfig = getSurveyConfig();
  const theme = surveyTheme as DefaultTheme;

  return (
    <AdminClient
      responses={responses}
      surveyConfig={surveyConfig}
      theme={theme}
    />
  );
}
