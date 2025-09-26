export interface ValidationResult {
  ok: boolean;
  issues?: string[];
  severity?: 'info' | 'warn' | 'error';
}

export function isValidationResult(obj: any): obj is ValidationResult {
  return obj && typeof obj.ok === 'boolean';
}
