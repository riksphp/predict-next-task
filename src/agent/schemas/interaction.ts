export interface InteractionPlan {
  prompt: string;
  persona?: string;
  followUps?: string[];
}

export function isInteractionPlan(obj: any): obj is InteractionPlan {
  return obj && typeof obj.prompt === 'string';
}
