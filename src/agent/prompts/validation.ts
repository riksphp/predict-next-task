export interface ValidationResponse {
  ok: boolean;
  issues?: string[];
  severity?: 'info' | 'warn' | 'error';
}

export function validationPrompt(input: { data: unknown }): string {
  const system = `You are ValidationAgent. Validate the data for quality/safety. Return ONLY JSON with fields: ok, issues?, severity?`;
  return `${system}\n\n${JSON.stringify(input)}`;
}
