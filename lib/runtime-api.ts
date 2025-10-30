// Runtime API client for survey delivery

export const runtimeApi = {
  startSurvey: async () => {
    const response = await fetch('/api/runtime/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to start survey');
    }

    return response.json();
  },

  getSessionState: async (sessionId: string) => {
    const response = await fetch(`/api/runtime/sessions/${sessionId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to get session state');
    }

    return response.json();
  },

  submitAnswer: async ({
    sessionId,
    questionId,
    answer,
  }: {
    sessionId: string;
    questionId: string;
    answer: any;
  }) => {
    const response = await fetch(`/api/runtime/sessions/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, answer }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit answer');
    }

    return response.json();
  },

  endSession: async (sessionId: string) => {
    const response = await fetch(`/api/runtime/sessions/${sessionId}/end`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to end session');
    }

    return response.json();
  },
};
