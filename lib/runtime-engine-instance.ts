import { RuntimeEngine, RuntimePersistence } from '@/server/runtime/runtime-engine';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

const buildStateSnapshot = (state: {
  currentBlockId: string;
  completedBlocks: string[];
  answers: Record<string, any>;
  variables: Record<string, any>;
}) =>
  JSON.parse(
    JSON.stringify({
      currentBlockId: state.currentBlockId,
      completedBlocks: state.completedBlocks,
      answers: state.answers,
      variables: state.variables,
      updatedAt: new Date().toISOString(),
    })
  );

const persistRuntimeState = async (tx: Prisma.TransactionClient, responseId: string, stateSnapshot: any) => {
  const existing = await tx.surveyResponse.findUnique({
    where: { id: responseId },
    select: { metadata: true },
  });

  const existingMetadata =
    existing?.metadata && typeof existing.metadata === 'object' ? { ...(existing.metadata as any) } : {};

  existingMetadata.runtimeSessionState = stateSnapshot;

  await tx.surveyResponse.update({
    where: { id: responseId },
    data: {
      metadata: existingMetadata as any,
    },
  });
};

/**
 * Persistence implementation for RuntimeEngine using Prisma
 * Maps RuntimeEngine's persistence interface to Prisma database operations
 */
const persistence: RuntimePersistence = {
  async createResponse(params) {
    const response = await prisma.surveyResponse.create({
      data: {
        sessionId: params.sessionId,
        deploymentId: params.deploymentId,
        draftId: params.draftId,
        respondentName: params.respondentName,
        metadata: (params.metadata || {}) as any,
      },
    });
    return { id: response.id };
  },

  async saveAnswer(params) {
    const stateSnapshot = buildStateSnapshot(params.state);
    await prisma.$transaction(async (tx) => {
      // Persist individual answer
      await tx.surveyAnswer.create({
        data: {
          responseId: params.responseId,
          blockId: params.questionId, // questionId from RuntimeEngine → blockId in Prisma
          answer: params.answer as any,
        },
      });

      // Merge runtime session state into metadata for fast reconstruction
      await persistRuntimeState(tx, params.responseId, stateSnapshot);
    });
  },

  async completeResponse(responseId) {
    await prisma.surveyResponse.update({
      where: { id: responseId },
      data: { completedAt: new Date() },
    });
  },

  async persistSessionState(params) {
    const stateSnapshot = buildStateSnapshot(params.state);
    await prisma.$transaction(async (tx) => {
      await persistRuntimeState(tx, params.responseId, stateSnapshot);
    });
  },

  async getResponseBySessionId(sessionId) {
    const response = await prisma.surveyResponse.findUnique({
      where: { sessionId },
      include: {
        answers: {
          orderBy: [
            { createdAt: 'asc' },
            { id: 'asc' },
          ],
        },
      },
    });

    if (!response) {
      return null;
    }

    return {
      id: response.id,
      sessionId: response.sessionId,
      deploymentId: response.deploymentId,
      draftId: response.draftId,
      respondentName: response.respondentName,
      metadata: response.metadata as Record<string, unknown> | null,
      completedAt: response.completedAt,
      answers: response.answers.map((a) => ({
        blockId: a.blockId,
        answer: a.answer,
        createdAt: a.createdAt,
      })),
    };
  },
};

/**
 * Create singleton RuntimeEngine instance
 * Uses globalThis to persist across Next.js hot module reloads in development
 */
function createRuntimeEngine(): RuntimeEngine {
  return new RuntimeEngine(persistence);
}

// Use globalThis to maintain singleton across hot reloads
const globalForEngine = globalThis as unknown as {
  runtimeEngine: RuntimeEngine | undefined;
};

export const runtimeEngine = globalForEngine.runtimeEngine ?? createRuntimeEngine();

if (process.env.NODE_ENV !== 'production') {
  globalForEngine.runtimeEngine = runtimeEngine;
}
