import { callGeminiApi } from '../data-layer/geminiApi';
import { addScoreEntry } from '../data-layer/scoreStorage';

export interface TaskScoring {
  task: string;
  interactionType: 'conversation' | 'challenge' | 'quiz' | 'reflection';
  maxPoints: number;
  scoringCriteria: string[];
  userResponse: string;
}

export interface ScoringResult {
  score: number;
  maxScore: number;
  percentage: number;
  feedback: string;
  criteriaScores: { criterion: string; score: number; feedback: string }[];
}

export async function scoreUserInteraction(
  taskScoring: TaskScoring,
  category: string,
): Promise<ScoringResult> {
  const scoringPrompt = `You are an AI evaluator scoring user performance on an interactive task.

TASK: ${taskScoring.task}
INTERACTION TYPE: ${taskScoring.interactionType}
MAX POINTS: ${taskScoring.maxPoints}

SCORING CRITERIA:
${taskScoring.scoringCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

USER RESPONSE:
${taskScoring.userResponse}

Evaluate the user's response against each criterion and provide:
1. Individual scores for each criterion (0-${Math.ceil(
    taskScoring.maxPoints / taskScoring.scoringCriteria.length,
  )} points each)
2. Overall feedback highlighting strengths and areas for improvement
3. Total score

Return ONLY valid JSON with fields:
{
  "criteriaScores": [
    {"criterion": string, "score": number, "feedback": string},
    ...
  ],
  "totalScore": number,
  "overallFeedback": string
}

Be encouraging but honest. Recognize effort and provide constructive guidance.`;

  try {
    const response = await callGeminiApi(scoringPrompt);
    let trimmed = response
      .trim()
      .replace(/```json|```/g, '')
      .trim();

    const evaluation = JSON.parse(trimmed) as {
      criteriaScores: { criterion: string; score: number; feedback: string }[];
      totalScore: number;
      overallFeedback: string;
    };

    const result: ScoringResult = {
      score: Math.min(evaluation.totalScore, taskScoring.maxPoints),
      maxScore: taskScoring.maxPoints,
      percentage: Math.round((evaluation.totalScore / taskScoring.maxPoints) * 100),
      feedback: evaluation.overallFeedback,
      criteriaScores: evaluation.criteriaScores,
    };

    // Store the score
    await addScoreEntry({
      task: taskScoring.task,
      category,
      interactionType: taskScoring.interactionType,
      score: result.score,
      maxScore: result.maxScore,
      percentage: result.percentage,
      feedback: result.feedback,
    });

    return result;
  } catch (error) {
    console.error('Failed to score interaction:', error);

    // Fallback scoring
    const baseScore = Math.min(
      Math.floor(taskScoring.userResponse.length / 20), // Basic effort scoring
      taskScoring.maxPoints,
    );

    const fallbackResult: ScoringResult = {
      score: baseScore,
      maxScore: taskScoring.maxPoints,
      percentage: Math.round((baseScore / taskScoring.maxPoints) * 100),
      feedback: 'Thank you for completing the task! Your effort is appreciated.',
      criteriaScores: taskScoring.scoringCriteria.map((criterion) => ({
        criterion,
        score: Math.ceil(baseScore / taskScoring.scoringCriteria.length),
        feedback: 'Good effort!',
      })),
    };

    await addScoreEntry({
      task: taskScoring.task,
      category,
      interactionType: taskScoring.interactionType,
      score: fallbackResult.score,
      maxScore: fallbackResult.maxScore,
      percentage: fallbackResult.percentage,
      feedback: fallbackResult.feedback,
    });

    return fallbackResult;
  }
}

export function formatScoringResult(result: ScoringResult): string {
  const scoreBar =
    '★'.repeat(Math.floor(result.percentage / 20)) +
    '☆'.repeat(5 - Math.floor(result.percentage / 20));

  return `🎯 **SCORE: ${result.score}/${result.maxScore} points (${result.percentage}%)**
${scoreBar}

**Overall Feedback:**
${result.feedback}

**Detailed Scores:**
${result.criteriaScores
  .map((cs) => `• ${cs.criterion}: ${cs.score} points - ${cs.feedback}`)
  .join('\n')}

Great job completing this interactive task! Keep engaging to earn more points and level up! 🚀`;
}
