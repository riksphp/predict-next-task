import { useState } from 'react';
import { predictNextTask } from '../services/predictService';
import { useUserContextStore } from '../data-store/userContextStore';

function formatResponse(text: string): { mainTask: string; reasoning: string } {
  const cleaned = text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\* /g, '• ')
    .replace(/Reasoning:|Task Suggestion:|Therefore, I suggest:/gi, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  const lines = cleaned.split('\n').filter(line => line.trim());
  const mainTask = lines.find(line => line.match(/^1\./))?.replace(/^1\.\s*/, '') || lines[0] || '';
  const reasoning = lines.find(line => line.match(/^2\./))?.replace(/^2\.\s*/, '') || lines[1] || '';
  
  return { mainTask, reasoning };
}

export function usePrediction() {
  const { context } = useUserContextStore();
  const [loading, setLoading] = useState<boolean>(false);

  async function predict(): Promise<{ mainTask: string; reasoning: string }> {
    setLoading(true);
    const prediction = await predictNextTask(context);
    const formatted = formatResponse(prediction);
    setLoading(false);
    return formatted;
  }

  return { loading, predict };
}