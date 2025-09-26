// Core agent and orchestration types for MVP2

export type AgentType =
  | 'ORCHESTRATOR'
  | 'ROUTER'
  | 'TASK_PLANNER'
  | 'CONTENT_CREATOR'
  | 'ANALYSIS'
  | 'LEARNING'
  | 'VALIDATION'
  | 'MONITORING'
  | 'INTERACTION'
  | 'FEEDBACK';

export interface AgentInput {
  userId: string;
  sessionId: string;
  goal: string;
  context?: Record<string, unknown>;
  history?: AgentTrace[];
}

export interface AgentOutput {
  type: 'PLAN_STEP' | 'TOOL_CALL' | 'AGENT_CALL' | 'FINAL_ANSWER' | 'CRITIQUE' | 'NO_OP';
  content: unknown;
  summary?: string;
  nextAgent?: AgentType;
}

export interface InterAgentMessage {
  from: AgentType;
  to: AgentType | 'BROADCAST';
  topic: string;
  payload: unknown;
  timestampMs: number;
}

export interface ExecutionPlanStep {
  id: string;
  agent: AgentType;
  description: string;
  dependsOnStepIds?: string[];
}

export interface ExecutionPlan {
  steps: ExecutionPlanStep[];
}

export interface AgentTrace {
  agent: AgentType;
  input: AgentInput;
  output: AgentOutput;
  startedAtMs: number;
  endedAtMs: number;
  toolCalls?: ToolCallTrace[];
  errors?: string[];
}

export interface ToolCallTrace {
  toolName: string;
  args: unknown;
  result?: unknown;
  error?: string;
  startedAtMs: number;
  endedAtMs: number;
}

export interface Agent {
  readonly type: AgentType;
  execute(input: AgentInput): Promise<AgentOutput>;
}
