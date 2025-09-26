export interface SmartTaskPlan {
  task: string;
  why: string;
  category: string;
  durationMinutes: number;
  deadlineIST?: string;
  steps: string[];
  risks?: string[];
  resources?: string[];
}

export function isSmartTaskPlan(obj: any): obj is SmartTaskPlan {
  return (
    obj &&
    typeof obj.task === 'string' &&
    typeof obj.why === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.durationMinutes === 'number' &&
    Array.isArray(obj.steps)
  );
}
