import { AgentType } from '../core/types';

export interface RouterDecision {
  intent: 'TASK_PLANNING' | 'CONTENT_REQUEST' | 'ANALYSIS_REQUEST' | 'LEARNING_UPDATE' | 'UNKNOWN';
  routeTo: AgentType;
  confidence: number; // 0..1
  rationale: string;
}

export function isRouterDecision(obj: any): obj is RouterDecision {
  return (
    obj &&
    typeof obj.intent === 'string' &&
    typeof obj.routeTo === 'string' &&
    typeof obj.confidence === 'number' &&
    typeof obj.rationale === 'string'
  );
}
