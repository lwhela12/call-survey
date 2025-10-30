// Data processing utilities for admin dashboard charts

type SurveyBlock = {
  id: string;
  type: string;
  content: string;
  options?: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  variable?: string;
  maxSelections?: number;
};

type SurveyConfig = {
  blocks: Record<string, SurveyBlock>;
  survey: {
    id: string;
    name: string;
  };
};

type SurveyAnswer = {
  id: string;
  responseId: string;
  blockId: string;
  answer: any;
  createdAt: Date;
};

type SurveyResponse = {
  id: string;
  sessionId: string;
  completedAt: Date | null;
  answers: SurveyAnswer[];
};

type ChartData = {
  label: string;
  value: number;
};

type QuestionChart = {
  blockId: string;
  question: string;
  type: string;
  data: ChartData[];
};

/**
 * Normalize answer to handle different formats
 */
function normalizeAnswer(answer: any): any {
  if (typeof answer === 'string') return answer;
  if (answer?.value !== undefined) return String(answer.value);
  if (answer?.text !== undefined) return answer.text;
  if (Array.isArray(answer)) return answer;
  return JSON.stringify(answer);
}

/**
 * Get all chartable questions from survey config
 */
export function getChartableQuestions(config: SurveyConfig): SurveyBlock[] {
  const chartableTypes = ['single-choice', 'multi-choice', 'ranking', 'scale'];

  return Object.values(config.blocks).filter(
    (block) => chartableTypes.includes(block.type) && block.options && block.options.length > 0
  );
}

/**
 * Calculate distribution for single-choice questions
 */
function calculateSingleChoiceDistribution(
  block: SurveyBlock,
  responses: SurveyResponse[]
): ChartData[] {
  const counts: Record<string, number> = {};

  // Initialize counts for all options
  block.options?.forEach((option) => {
    counts[option.value] = 0;
  });

  // Count answers
  responses.forEach((response) => {
    const answer = response.answers.find((a) => a.blockId === block.id);
    if (answer) {
      const normalized = normalizeAnswer(answer.answer);
      if (typeof normalized === 'string' && counts.hasOwnProperty(normalized)) {
        counts[normalized]++;
      }
    }
  });

  // Convert to chart data with labels
  return block.options?.map((option) => ({
    label: option.label,
    value: counts[option.value] || 0,
  })) || [];
}

/**
 * Calculate distribution for multi-choice questions
 */
function calculateMultiChoiceDistribution(
  block: SurveyBlock,
  responses: SurveyResponse[]
): ChartData[] {
  const counts: Record<string, number> = {};

  // Initialize counts for all options
  block.options?.forEach((option) => {
    counts[option.value] = 0;
  });

  // Count answers (each selection counted separately)
  responses.forEach((response) => {
    const answer = response.answers.find((a) => a.blockId === block.id);
    if (answer) {
      const normalized = normalizeAnswer(answer.answer);
      if (Array.isArray(normalized)) {
        normalized.forEach((value) => {
          if (typeof value === 'string' && counts.hasOwnProperty(value)) {
            counts[value]++;
          }
        });
      }
    }
  });

  // Convert to chart data with labels
  return block.options?.map((option) => ({
    label: option.label,
    value: counts[option.value] || 0,
  })) || [];
}

/**
 * Calculate weighted scores for ranking questions
 * 1st place = 3 points, 2nd place = 2 points, 3rd place = 1 point
 */
function calculateRankingScores(
  block: SurveyBlock,
  responses: SurveyResponse[]
): ChartData[] {
  const scores: Record<string, number> = {};

  // Initialize scores for all options
  block.options?.forEach((option) => {
    scores[option.value] = 0;
  });

  // Calculate weighted scores
  const maxSelections = block.maxSelections || 3;

  responses.forEach((response) => {
    const answer = response.answers.find((a) => a.blockId === block.id);
    if (answer) {
      const normalized = normalizeAnswer(answer.answer);
      if (Array.isArray(normalized)) {
        normalized.forEach((value, index) => {
          if (typeof value === 'string' && scores.hasOwnProperty(value)) {
            // Award points: 1st = maxSelections points, 2nd = maxSelections-1 points, etc.
            const points = Math.max(0, maxSelections - index);
            scores[value] += points;
          }
        });
      }
    }
  });

  // Convert to chart data with labels and sort by score descending
  return (block.options?.map((option) => ({
    label: option.label,
    value: scores[option.value] || 0,
  })) || []).sort((a, b) => b.value - a.value);
}

/**
 * Generate chart data for a specific question block
 */
export function generateChartData(
  block: SurveyBlock,
  responses: SurveyResponse[]
): QuestionChart {
  let data: ChartData[] = [];

  switch (block.type) {
    case 'single-choice':
    case 'scale':
      data = calculateSingleChoiceDistribution(block, responses);
      break;
    case 'multi-choice':
      data = calculateMultiChoiceDistribution(block, responses);
      break;
    case 'ranking':
      data = calculateRankingScores(block, responses);
      break;
    default:
      data = [];
  }

  return {
    blockId: block.id,
    question: block.content,
    type: block.type,
    data,
  };
}

/**
 * Generate all chart data for the dashboard
 */
export function generateAllChartData(
  config: SurveyConfig,
  responses: SurveyResponse[]
): QuestionChart[] {
  const chartableQuestions = getChartableQuestions(config);

  return chartableQuestions.map((block) => generateChartData(block, responses));
}
