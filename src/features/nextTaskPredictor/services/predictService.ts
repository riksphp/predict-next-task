import { getBaseTruths } from '../data-layer/baseTruths';
import { PROMPTS } from '../data-layer/prompts';
import { callGeminiApi } from '../data-layer/geminiApi';
import { getUserContext } from '../data-layer/userContextStorage';
// import { analyzeUserInputs, getUserAnalysis } from './analysisService';
import { addPredictedTask, getPredictedTasks, getCompletedTasks } from '../data-layer/taskStorage';
import { getUserProfile } from '../data-layer/userProfileStorage';
import { getOrCreateDefaultThread, getMessages } from '../data-layer/conversationStorage';

export async function predictNextTask(context: string): Promise<string> {
  const baseTruths = getBaseTruths();
  const userContext = await getUserContext();
  const predictedTasks = await getPredictedTasks();
  const completedTasks = await getCompletedTasks();
  const profile = await getUserProfile();
  const thread = await getOrCreateDefaultThread();
  const recentMessages = (await getMessages(thread.id))
    .slice(-8)
    .map((m) => ({ role: m.role, text: m.text }));

  // Get or create user analysis
  //   let userAnalysis = await getUserAnalysis();
  //   if (!userAnalysis) {
  //   userAnalysis = await analyzeUserInputs();
  //   }

  const enrichedContext = {
    userContext,
    // userAnalysis,
    predictedTasks,
    completedTasks,
    profile,
    recentMessages,
  };

  const prompt = PROMPTS.TEMPLATES.TASK_PREDICTION({ baseTruths, context: enrichedContext });

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
