export interface AnalysisOutput {
  insights: string[];
  trends?: string[];
  anomalies?: string[];
  recommendations?: string[];
}

export function isAnalysisOutput(obj: any): obj is AnalysisOutput {
  return obj && Array.isArray(obj.insights);
}
