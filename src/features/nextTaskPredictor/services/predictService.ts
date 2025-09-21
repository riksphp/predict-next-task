import { getBaseTruths } from '../data-layer/baseTruths';
import { PROMPTS } from '../data-layer/prompts';
import { callGeminiApi } from '../data-layer/geminiApi';
import { getUserContext, saveUserContext } from '../data-layer/userContextStorage';

export async function predictNextTask(context: string): Promise<string> {
  const baseTruths = getBaseTruths();
  const userContext = await getUserContext();
  const contextString = JSON.stringify(userContext, null, 2);
  
  const prompt = PROMPTS.TASK_PREDICTION
    .replace('{baseTruths}', JSON.stringify(baseTruths, null, 2))
    .replace('{context}', contextString || 'No context provided');
  
  const response = await callGeminiApi(prompt);
  
  // Extract main task from response and add to predictedToDo array
  const lines = response.split('\n').filter(line => line.trim());
  const mainTask = lines.find(line => line.match(/^1\./))?.replace(/^1\.\s*/, '') || lines[0] || '';
  
  if (mainTask.trim()) {
    const updatedContext = {
      ...userContext,
      predictedToDo: [...(userContext.predictedToDo || []), mainTask.trim()]
    };
    await saveUserContext(updatedContext);
  }
  
  return response;
}
