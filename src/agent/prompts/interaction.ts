export interface InteractionResponse {
  control: 'PLAN_STEP' | 'FINAL_ANSWER' | 'CRITIQUE';
  prompt: string;
  persona?: string;
  followUps?: string[];
}

export function interactionPrompt(input: {
  topic: string;
  context?: Record<string, unknown>;
}): string {
  const toolsCatalog = `TOOLS_CATALOG = [
  {"name":"todos.add","args":{"text":"string","threadId":"string"}},
  {"name":"todos.complete","args":{"text":"string"}},
  {"name":"notes.create","args":{"title":"string","content":"string","threadId":"string"}},
  {"name":"profile.saveInsights","args":{"preferences?":"object","skills?":"string[]","insights?":"string[]"}},
  {"name":"score.award","args":{"event":"string","points":"number","meta?":"object"}}
]`;
  const system = `You are InteractionAgent. Prepare dialogue with context. Return ONLY JSON with: control, prompt, persona?, followUps?

${toolsCatalog}

Instruction:
- When user proposes tasks, emit TOOL_CALL todos.add to persist.
- When user reports completion, emit TOOL_CALL todos.complete and score.award.
- When user shares personal preferences or patterns, emit TOOL_CALL profile.saveInsights.
- If user asks to save notes, emit TOOL_CALL notes.create.
- No prose, ONLY JSON per control protocol.`;
  return `${system}\n\n${JSON.stringify(input)}`;
}
