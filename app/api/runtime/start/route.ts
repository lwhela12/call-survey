import { NextResponse } from 'next/server';
import { runtimeEngine } from '@/lib/runtime-engine-instance';
import { getSurveyConfig, getDeploymentId } from '@/lib/config';

export async function POST() {
  try {
    const config = getSurveyConfig();
    const deploymentId = getDeploymentId();

    // Start the survey session using RuntimeEngine.startRuntime()
    const session = await runtimeEngine.startRuntime({
      config,
      deploymentId,
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      firstQuestion: session.firstQuestion,
      responseId: session.responseId,
    });
  } catch (error) {
    console.error('Error starting survey:', error);
    return NextResponse.json(
      { error: 'Failed to start survey' },
      { status: 500 }
    );
  }
}
