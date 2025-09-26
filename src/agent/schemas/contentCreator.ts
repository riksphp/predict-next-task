export interface ContentSpec {
  topic: string;
  audience?: string;
  format?: 'notes' | 'tutorial' | 'examples';
}

export interface ContentOutput {
  title: string;
  sections: { heading: string; bullets: string[] }[];
  codeExamples?: { language: string; code: string; explanation?: string }[];
}

export function isContentOutput(obj: any): obj is ContentOutput {
  return obj && typeof obj.title === 'string' && Array.isArray(obj.sections);
}
