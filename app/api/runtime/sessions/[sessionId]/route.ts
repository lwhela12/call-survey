import { NextRequest, NextResponse } from 'next/server';
import { runtimeEngine } from '@/lib/runtime-engine-instance';
import { getSurveyConfig } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const config = getSurveyConfig();
    const state = await runtimeEngine.getSessionState(params.sessionId, config);

    return NextResponse.json({
      currentQuestion: state.currentQuestion,
      progress: state.progress,
      isComplete: state.isComplete,
      responseId: state.responseId,
      conversationHistory: state.conversationHistory,
    });
  } catch (error) {
    console.error('Error getting session state:', error);
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  }
}
