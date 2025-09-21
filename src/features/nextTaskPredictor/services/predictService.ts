import { getBaseTruths } from '../data-layer/baseTruths';
import { PROMPTS } from '../data-layer/prompts';
import { callGeminiApi } from '../data-layer/geminiApi';
import { getUserContext } from '../data-layer/userContextStorage';
import { analyzeUserInputs, getUserAnalysis } from './analysisService';
import { addPredictedTask } from '../data-layer/taskStorage';

export async function predictNextTask(context: string): Promise<string> {
  const baseTruths = getBaseTruths();
  const userContext = await getUserContext();

  // Get or create user analysis
  let userAnalysis = await getUserAnalysis();
  //   if (!userAnalysis) {
  userAnalysis = await analyzeUserInputs();
  //   }

  const enrichedContext = {
    userContext,
    userAnalysis,
  };

  const prompt = PROMPTS.TASK_PREDICTION.replace(
    '{baseTruths}',
    JSON.stringify(baseTruths, null, 2),
  ).replace('{context}', JSON.stringify(enrichedContext, null, 2));

  const response = await callGeminiApi(prompt);

  // Extract main task from response and add to predicted tasks
  const lines = response.split('\n').filter((line) => line.trim());
  const mainTask =
    lines.find((line) => line.match(/^1\./))?.replace(/^1\.\s*/, '') || lines[0] || '';

  if (mainTask.trim()) {
    await addPredictedTask(mainTask.trim());
  }

  return response;
}
