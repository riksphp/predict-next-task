import { SmartTaskPlan } from '../schemas/taskPlanner';

export function taskPlannerPrompt(params: {
  goal: string;
  context?: Record<string, unknown>;
}): string {
  const system = `You are TaskPlannerAgent. Return ONLY JSON. Schema: ${JSON.stringify({
    task: 'string',
    why: 'string',
    category: 'string',
    durationMinutes: 0,
    deadlineIST: 'string? optional',
    steps: ['string'],
    risks: ['string? optional'],
    resources: ['string? optional'],
    control: 'PLAN_STEP | TOOL_CALL | AGENT_CALL | FINAL_ANSWER',
    tool: { name: 'string', args: {} },
    nextAgent: 'CONTENT_CREATOR' | 'ANALYSIS' | 'VALIDATION',
  })}`;
  const user = {
    goal: params.goal,
    context: params.context ?? {},
    constraints: {
      smart: true,
      maxDurationMinutes: 45,
      avoidRepetition: true,
    },
  } satisfies Record<string, unknown>;
  return `${system}\n\n${JSON.stringify(user)}`;
}

export interface TaskPlannerResponse extends SmartTaskPlan {
  control: 'PLAN_STEP' | 'TOOL_CALL' | 'AGENT_CALL' | 'FINAL_ANSWER';
  tool?: { name: string; args: Record<string, unknown> };
  nextAgent?: 'CONTENT_CREATOR' | 'ANALYSIS' | 'VALIDATION';
}
