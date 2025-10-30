import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('[API /admin/clear-responses] Clear responses request received');

    // Count responses before deleting
    const responseCount = await prisma.surveyResponse.count();
    console.log('[API /admin/clear-responses] Found', responseCount, 'responses to delete');

    // Delete all survey responses (cascade will delete answers automatically)
    const result = await prisma.surveyResponse.deleteMany({});

    console.log('[API /admin/clear-responses] Successfully deleted', result.count, 'responses');

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} response${result.count === 1 ? '' : 's'}`,
    });
  } catch (error) {
    console.error('[API /admin/clear-responses] Error clearing responses:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to clear responses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
