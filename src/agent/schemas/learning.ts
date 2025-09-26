export interface LearningUpdate {
  preferences?: Record<string, unknown>;
  skills?: string[];
  notes?: string[];
}

export function isLearningUpdate(obj: any): obj is LearningUpdate {
  return obj && typeof obj === 'object';
}
