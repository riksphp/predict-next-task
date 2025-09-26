import { SmartTaskPlan } from '../schemas/taskPlanner';

export function taskPlannerPrompt(params: {
  goal: string;
  context?: Record<string, unknown>;
}): string {
  const toolsCatalog = `TOOLS_CATALOG = [
  {"name":"todos.add","args":{"text":"string","threadId":"string"}},
  {"name":"todos.complete","args":{"text":"string"}},
  {"name":"todos.list","args":{"status?":"pending|completed"}},
  {"name":"notes.create","args":{"title":"string","content":"string","threadId":"string"}},
  {"name":"notes.list","args":{"threadId":"string"}},
  {"name":"score.award","args":{"event":"string","points":"number","meta?":"object"}},
  {"name":"profile.saveInsights","args":{"preferences?":"object","skills?":"string[]","insights?":"string[]"}},
  {"name":"activityByCategory.compute","args":{"windowHours":"number"}},
  {"name":"saveTextAsPDF","args":{"text":"string","title?":"string"}},
  {"name":"exportPdf","args":{"title":"string","text":"string"}}
]`;

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
    tool: 'optional: { name: string, args: object }',
    nextAgent: 'optional: CONTENT_CREATOR | ANALYSIS | VALIDATION',
  })}

${toolsCatalog}

Instruction:
- If the user requests adding a todo, emit TOOL_CALL {"name":"todos.add","args":{"text": TODO_TEXT, "threadId": THREAD_ID}}.
- If the user says a task is done, emit TOOL_CALL {"name":"todos.complete","args":{"text": TASK_TEXT}}.
- When you produce a plan with actionable steps, you MAY emit TOOL_CALL todos.add for each step as discrete todos.
- If producing an actionable interactive step, you MAY emit TOOL_CALL {"name":"score.award","args":{"event":"interactive_task","points":5,"meta":{"source":"planner"}}}.
- Otherwise return PLAN_STEP (or FINAL_ANSWER when complete). Never include prose, ONLY JSON per control protocol.`;
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
