import { LlmClient } from '../../../agent/core/llmClient';
import { getBaseTruths } from '../data-layer/baseTruths';

const llm = new LlmClient();

function buildPrompt(
  userText: string,
  truthsText: string,
  conversationText?: string,
  priorSummary?: string,
): string {
  return [
    'You are a helpful assistant for a Chrome Extension app. Answer concisely.',
    'Base Truths (must not be contradicted):',
    truthsText,
    '',
    priorSummary ? `Prior conversation summary:\n${priorSummary}` : '',
    conversationText ? `Conversation so far:\n${conversationText}` : '',
    '',
    'Rules:',
    '- Respond ONLY in JSON with shape: { "message": string, "valid": boolean, "violations": string[] }',
    '- If your answer would contradict a base truth, set valid=false and include violations explaining which truth would be broken.',
    '- Do not include code fences.',
    '',
    `User: ${userText}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export async function chatOnce(
  userText: string,
  conversation?: { role: string; text: string; timestamp?: string }[],
  priorSummary?: string,
): Promise<{ message: string; valid: boolean; violations: string[] }> {
  const bt = getBaseTruths();
  const truthsText = Array.isArray((bt as any)?.base_truths)
    ? (bt as any).base_truths
        .map((t: any) => `- ${String(t.principle)}: ${String(t.statement)}`)
        .join('\n')
    : '';
  const conversationText = Array.isArray(conversation)
    ? conversation
        .map((m) => `${m.timestamp ? `[${m.timestamp}] ` : ''}${m.role}: ${m.text}`)
        .join('\n')
    : '';
  const prompt = buildPrompt(userText, truthsText, conversationText, priorSummary);
  const json = await llm.generateJson('INTERACTION', prompt);
  return {
    message: String(json.message || ''),
    valid: Boolean(json.valid ?? true),
    violations: Array.isArray(json.violations) ? json.violations.map(String) : [],
  };
}

// Decision-making variant that can request tool use before final reply
export async function chatDecide(
  userText: string,
  conversation?: { role: string; text: string; timestamp?: string }[],
  priorSummary?: string,
  opts?: { executedTools?: string[]; threadId?: string },
): Promise<
  | { control: 'FINAL_ANSWER'; message: string; valid?: boolean; violations?: string[] }
  | {
      control: 'TOOL_CALL';
      tool: {
        name: 'profile.saveInsights' | 'todos.add';
        args: Record<string, unknown>;
      };
    }
  | { control: 'CRITIQUE'; error?: string; message?: string; violations?: string[] }
> {
  const bt = getBaseTruths();
  const truthsText = Array.isArray((bt as any)?.base_truths)
    ? (bt as any).base_truths
        .map((t: any) => `- ${String(t.principle)}: ${String(t.statement)}`)
        .join('\n')
    : '';
  const conversationText = Array.isArray(conversation)
    ? conversation
        .map((m) => `${m.timestamp ? `[${m.timestamp}] ` : ''}${m.role}: ${m.text}`)
        .join('\n')
    : '';

  const toolsCatalog = `TOOLS_CATALOG = [
  {"name":"profile.saveInsights","args":{"name?":"string","profession?":"string","mood?":"string","workStyle?":"string","preferences?":"object","skills?":"string[]","insights?":"string[]"}},
  {"name":"todos.add","args":{"text":"string","threadId":"string"}}
]`;

  const systemPrompt = [
    'You are a helpful assistant for a Chrome Extension app. Decide whether to call a tool before replying.',
    'Base Truths (must not be contradicted):',
    truthsText,
    '',
    priorSummary ? `Prior conversation summary:\n${priorSummary}` : '',
    conversationText ? `Conversation so far:\n${conversationText}` : '',
    '',
    toolsCatalog,
    'Rules:',
    '- NEVER contradict Base Truths. If a candidate reply would conflict, either: (a) return CRITIQUE with a violations array describing which truths would be broken and why, or (b) adjust the answer to comply.',
    '- PRIORITY: If BOTH personal info (name, profession, mood, work style, preferences, skills, patterns) AND an actionable goal are present, FIRST emit TOOL_CALL profile.saveInsights, THEN on the next turn emit TOOL_CALL todos.add (use threadId from State).',
    '- If ONLY personal info is present, emit TOOL_CALL profile.saveInsights.',
    '- If ONLY actionable goal is present, emit TOOL_CALL todos.add.',
    '- You may call multiple tools in separate turns. Emit ONE TOOL_CALL at a time. After the tool result is available, you will be invoked again with TOOL_RESULT in conversation to decide next step.',
    '- Do not emit a FINAL_ANSWER until all applicable tools for this user message have been executed.',
    '- Never repeat a tool already executed in this turn (see executedTools below). If a tool has already been executed, do not emit it again; proceed to the next most appropriate action.',
    '- Otherwise, emit a FINAL_ANSWER with your concise reply.',
    '- Return ONLY JSON, no code fences. One of these shapes:\n  {"control":"TOOL_CALL","tool":{"name":"profile.saveInsights","args":{...}}}\n  {"control":"TOOL_CALL","tool":{"name":"todos.add","args":{"text":"...","threadId":"..."}}}\n  {"control":"FINAL_ANSWER","message":"...","valid":true,"violations":[]}\n  {"control":"CRITIQUE","error":"...","violations":["..."]}',
  ]
    .filter(Boolean)
    .join('\n');

  const state = [
    'State:',
    `- threadId: ${opts?.threadId || 'unknown'}`,
    `- executedTools: ${JSON.stringify(opts?.executedTools || [])}`,
  ].join('\n');

  const prompt = [systemPrompt, state, '', `Query: ${userText}`].filter(Boolean).join('\n');

  const json = await llm.generateJson('INTERACTION', prompt);
  if (json?.control === 'TOOL_CALL' && json?.tool?.name === 'profile.saveInsights') {
    return {
      control: 'TOOL_CALL',
      tool: { name: 'profile.saveInsights', args: json.tool.args || {} },
    };
  }
  if (json?.control === 'TOOL_CALL' && json?.tool?.name === 'todos.add') {
    return {
      control: 'TOOL_CALL',
      tool: { name: 'todos.add', args: json.tool.args || {} },
    };
  }
  if (json?.control === 'FINAL_ANSWER' && typeof json?.message === 'string') {
    return {
      control: 'FINAL_ANSWER',
      message: json.message,
      valid: typeof json.valid === 'boolean' ? Boolean(json.valid) : undefined,
      violations: Array.isArray(json.violations) ? json.violations.map(String) : undefined,
    };
  }
  if (json?.control === 'CRITIQUE') {
    return {
      control: 'CRITIQUE',
      error: typeof json.error === 'string' ? json.error : undefined,
      message: typeof json.message === 'string' ? json.message : undefined,
      violations: Array.isArray(json.violations) ? json.violations.map(String) : undefined,
    };
  }
  return { control: 'CRITIQUE', error: 'Invalid decision format' };
}
