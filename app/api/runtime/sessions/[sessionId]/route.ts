import { NextRequest, NextResponse } from 'next/server';
import { runtimeEngine } from '@/lib/runtime-engine-instance';
import { getSurveyConfig } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    console.log('[API /sessions/[sessionId]] GET request for sessionId:', params.sessionId);
    const config = getSurveyConfig();
    const state = await runtimeEngine.getSessionState(params.sessionId, config);

    console.log('[API /sessions/[sessionId]] Returning state:', {
      currentQuestionId: state.currentQuestion?.id,
      progress: state.progress,
      isComplete: state.isComplete,
      conversationHistoryLength: state.conversationHistory?.length,
    });

    return NextResponse.json({
      currentQuestion: state.currentQuestion,
      progress: state.progress,
      isComplete: state.isComplete,
      responseId: state.responseId,
      conversationHistory: state.conversationHistory,
    });
  } catch (error) {
    console.error('[API /sessions/[sessionId]] Error getting session state:', error);
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  }
}
