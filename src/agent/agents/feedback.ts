import { Agent, AgentInput, AgentOutput, AgentType } from '../core/types';
import { LlmClient } from '../core/llmClient';
import { feedbackPrompt, FeedbackResponse } from '../prompts/feedback';
import { isFeedbackSummary } from '../schemas/feedback';
import { appendAgentTrace } from '../../features/nextTaskPredictor/data-layer/agentTraceStorage';

export class FeedbackAgent implements Agent {
  readonly type: AgentType = 'FEEDBACK';
  private llm = new LlmClient();

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startedAtMs = Date.now();
    const transcript = Array.isArray(input.history)
      ? input.history.map((h) => `${h.agent}: ${JSON.stringify(h.output.content)}`)
      : [];
    const json = (await this.llm.generateJson(
      this.type,
      feedbackPrompt({ transcript }),
    )) as FeedbackResponse;
    if (!json || !isFeedbackSummary(json)) {
      const output: AgentOutput = { type: 'CRITIQUE', content: { error: 'Invalid feedback' } };
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
