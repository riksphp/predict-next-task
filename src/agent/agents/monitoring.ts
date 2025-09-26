import { Agent, AgentInput, AgentOutput, AgentType } from '../core/types';
import { appendAgentTrace } from '../../features/nextTaskPredictor/data-layer/agentTraceStorage';

export class MonitoringAgent implements Agent {
  readonly type: AgentType = 'MONITORING';

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startedAtMs = Date.now();
    // In MVP2, MonitoringAgent would compute performance metrics from traces.
    const output: AgentOutput = { type: 'FINAL_ANSWER', content: { status: 'ok' } };
    const endedAtMs = Date.now();
    await appendAgentTrace({ agent: this.type, input, output, startedAtMs, endedAtMs });
    return output;
  }
}
