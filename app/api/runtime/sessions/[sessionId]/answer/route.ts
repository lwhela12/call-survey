import { NextRequest, NextResponse } from 'next/server';
import { runtimeEngine } from '@/lib/runtime-engine-instance';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const body = await request.json();
    const { questionId, answer } = body;

    // Submit answer using RuntimeEngine.submitAnswer()
    // This handles both state updates and persistence via the persistence layer
    const result = await runtimeEngine.submitAnswer(params.sessionId, questionId, answer);

    // If survey is complete, trigger session completion
    if (result.nextQuestion?.type === 'final-message' || result.nextQuestion?.type === 'end') {
      await runtimeEngine.completeSession(params.sessionId);
    }

    return NextResponse.json({
      nextQuestion: result.nextQuestion,
      progress: result.progress,
    });
  } catch (error) {
    console.error('Error submitting answer:', error);

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
