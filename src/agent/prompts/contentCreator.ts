import { ContentSpec } from '../schemas/contentCreator';

export interface ContentCreatorResponse {
  control: 'FINAL_ANSWER' | 'CRITIQUE' | 'PLAN_STEP';
  title: string;
  sections: { heading: string; bullets: string[] }[];
  codeExamples?: { language: string; code: string; explanation?: string }[];
}

export function contentCreatorPrompt(input: { spec: ContentSpec }): string {
  const system = `You are ContentCreatorAgent. Return ONLY JSON with fields: control, title, sections[], codeExamples?[].`;
  return `${system}\n\n${JSON.stringify(input)}`;
}
