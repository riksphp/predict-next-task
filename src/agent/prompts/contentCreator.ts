import { ContentSpec } from '../schemas/contentCreator';

export interface ContentCreatorResponse {
  control: 'FINAL_ANSWER' | 'CRITIQUE' | 'PLAN_STEP';
  title: string;
  sections: { heading: string; bullets: string[] }[];
  codeExamples?: { language: string; code: string; explanation?: string }[];
}

export function contentCreatorPrompt(input: { spec: ContentSpec }): string {
  const toolsCatalog = `TOOLS_CATALOG = [
  {"name":"notes.create","args":{"title":"string","content":"string","threadId":"string"}},
  {"name":"notes.list","args":{"threadId":"string"}},
  {"name":"saveTextAsPDF","args":{"text":"string","title?":"string"}},
  {"name":"exportPdf","args":{"title":"string","text":"string"}},
  {"name":"todos.add","args":{"text":"string","threadId":"string"}},
  {"name":"score.award","args":{"event":"string","points":"number","meta?":"object"}}
]`;
  const system = `You are ContentCreatorAgent. Return ONLY JSON with fields: control, title, sections[], codeExamples?[].

${toolsCatalog}

Instruction:
- If you produce a summary or guide, you MAY persist it via TOOL_CALL notes.create.
- If the user asks to export/save/share, emit TOOL_CALL saveTextAsPDF.
- If you propose actionable steps, you MAY add todos via TOOL_CALL todos.add.
- No prose, ONLY JSON per control protocol.`;
  return `${system}\n\n${JSON.stringify(input)}`;
}
