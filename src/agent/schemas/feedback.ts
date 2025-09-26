export interface FeedbackSummary {
  sentiment: 'positive' | 'neutral' | 'negative';
  satisfaction?: number; // 0..1
  comments?: string[];
}

export function isFeedbackSummary(obj: any): obj is FeedbackSummary {
  return obj && typeof obj.sentiment === 'string';
}
