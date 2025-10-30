import { NextRequest, NextResponse } from 'next/server';
import { runtimeEngine } from '@/lib/runtime-engine-instance';
import { getSurveyConfig } from '@/lib/config';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    console.log('[API /sessions/[sessionId]/answer] POST request for sessionId:', params.sessionId);
    const body = await request.json();
    const { questionId, answer } = body;

    // Get survey config for session reconstruction in serverless environment
    const config = getSurveyConfig();

    // Submit answer using RuntimeEngine.submitAnswer()
    // This handles both state updates and persistence via the persistence layer
    const result = await runtimeEngine.submitAnswer(params.sessionId, questionId, answer, config);

    console.log('[API /sessions/[sessionId]/answer] Answer submitted, progress:', result.progress);

    // If survey is complete, trigger session completion
    if (result.nextQuestion?.type === 'final-message' || result.nextQuestion?.type === 'end') {
      await runtimeEngine.completeSession(params.sessionId);
    }

    return NextResponse.json({
      nextQuestion: result.nextQuestion,
      progress: result.progress,
    });
  } catch (error) {
    console.error('[API /sessions/[sessionId]/answer] Error submitting answer:', error);

    if (error instanceof Error && error.message === 'Invalid session ID') {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
