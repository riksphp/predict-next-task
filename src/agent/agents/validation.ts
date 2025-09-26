import { Agent, AgentInput, AgentOutput, AgentType } from '../core/types';
import { LlmClient } from '../core/llmClient';
import { validationPrompt, ValidationResponse } from '../prompts/validation';
import { isValidationResult } from '../schemas/validation';
import { appendAgentTrace } from '../../features/nextTaskPredictor/data-layer/agentTraceStorage';

export class ValidationAgent implements Agent {
  readonly type: AgentType = 'VALIDATION';
  private llm = new LlmClient();

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startedAtMs = Date.now();
    const json = (await this.llm.generateJson(
      this.type,
      validationPrompt({ data: input.context }),
    )) as ValidationResponse;
    if (!json || !isValidationResult(json)) {
      const output: AgentOutput = {
        type: 'CRITIQUE',
        content: { error: 'Invalid validation result' },
      };
      const endedAtMs = Date.now();
      await appendAgentTrace({ agent: this.type, input, output, startedAtMs, endedAtMs });
      return output;
    }
    const output: AgentOutput = { type: 'FINAL_ANSWER', content: json };
    const endedAtMs = Date.now();
    await appendAgentTrace({ agent: this.type, input, output, startedAtMs, endedAtMs });
    return output;
  }
}
