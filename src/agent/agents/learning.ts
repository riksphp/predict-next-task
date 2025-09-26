import { Agent, AgentInput, AgentOutput, AgentType } from '../core/types';
import { LlmClient } from '../core/llmClient';
import { learningPrompt, LearningResponse } from '../prompts/learning';
import { isLearningUpdate } from '../schemas/learning';
import { appendAgentTrace } from '../../features/nextTaskPredictor/data-layer/agentTraceStorage';

export class LearningAgent implements Agent {
  readonly type: AgentType = 'LEARNING';
  private llm = new LlmClient();

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startedAtMs = Date.now();
    const json = (await this.llm.generateJson(
      this.type,
      learningPrompt({ deltas: input.context }),
    )) as LearningResponse;
    if (!json || !isLearningUpdate(json)) {
      const output: AgentOutput = {
        type: 'CRITIQUE',
        content: { error: 'Invalid learning update' },
      };
      const endedAtMs = Date.now();
      await appendAgentTrace({ agent: this.type, input, output, startedAtMs, endedAtMs });
      return output;
    }
    const output: AgentOutput = {
      type: json.control === 'FINAL_ANSWER' ? 'FINAL_ANSWER' : 'PLAN_STEP',
      content: json,
    };
    const endedAtMs = Date.now();
    await appendAgentTrace({ agent: this.type, input, output, startedAtMs, endedAtMs });
    return output;
  }
}
