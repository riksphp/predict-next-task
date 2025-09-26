export type BaseTruth = {
  id: string;
  text: string;
};

const TRUTHS: BaseTruth[] = [
  { id: 'platform', text: 'This project is a Chrome Extension (Manifest V3).' },
  { id: 'stack', text: 'Frontend uses React 18 with TypeScript, built with Vite.' },
  { id: 'styles', text: 'Styling uses Tailwind CSS and CSS Modules.' },
  { id: 'ai', text: 'Primary AI integration is Google Gemini; other providers may be supported.' },
  {
    id: 'arch',
    text: 'MVP2 targets an agentic architecture (Router → Planner → Content/Analysis → Validation → Feedback).',
  },
];

export async function getSystemTruths(): Promise<BaseTruth[]> {
  return TRUTHS;
}

export function summarizeTruths(truths: BaseTruth[]): string {
  return truths.map((t) => `- ${t.text}`).join('\n');
}

export const BASE_TRUTHS = {
  base_truths: [
    { principle: 'Compassion', statement: 'I am mother to the world' },
    { principle: 'Responsibility', statement: 'I am responsible for everything' },
    { principle: 'Detachment', statement: 'I am not my body, I am not my mind' },
    { principle: 'Presence', statement: 'This moment is the ultimate reality' },
    { principle: 'Acceptance', statement: 'Right now what it is, it can be only that way' },
  ],
};

export function getBaseTruths() {
  return BASE_TRUTHS;
}
