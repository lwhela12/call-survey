import { NextRequest, NextResponse } from 'next/server';
import { runtimeEngine } from '@/lib/runtime-engine-instance';

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Use completeSession instead of endSession
    await runtimeEngine.completeSession(params.sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
