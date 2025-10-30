import { prisma } from '@/lib/db';
import { getDeploymentId, getDashboardConfig } from '@/lib/config';
import { DashboardClient } from './DashboardClient';

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

export default async function DashboardPage() {
  const responses = await getResponses();
  const dashboardConfig = getDashboardConfig();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Survey Dashboard</h1>
          <p className="text-gray-600 mt-2">
            {responses.length} {responses.length === 1 ? 'response' : 'responses'} collected
          </p>
        </div>

        <DashboardClient
          dashboardConfig={dashboardConfig}
          responses={responses}
        />
      </div>
    </div>
  );
}
