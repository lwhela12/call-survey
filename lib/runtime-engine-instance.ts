import { RuntimeEngine, RuntimePersistence } from '@/server/runtime/runtime-engine';
import { prisma } from '@/lib/db';

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
        metadata: params.metadata || {},
      },
    });
    return { id: response.id };
  },

  async saveAnswer(params) {
    // Map questionId to blockId for Prisma schema
    await prisma.surveyAnswer.create({
      data: {
        responseId: params.responseId,
        blockId: params.questionId, // questionId from RuntimeEngine → blockId in Prisma
        answer: params.answer,
      },
    });
  },

  async completeResponse(responseId) {
    await prisma.surveyResponse.update({
      where: { id: responseId },
      data: { completedAt: new Date() },
    });
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
