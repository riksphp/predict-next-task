import { Agent, AgentInput, AgentOutput, AgentType } from '../core/types';
import { LlmClient } from '../core/llmClient';
import { contentCreatorPrompt, ContentCreatorResponse } from '../prompts/contentCreator';
import { isContentOutput } from '../schemas/contentCreator';
import { appendAgentTrace } from '../../features/nextTaskPredictor/data-layer/agentTraceStorage';

export class ContentCreatorAgent implements Agent {
  readonly type: AgentType = 'CONTENT_CREATOR';
  private llm = new LlmClient();

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startedAtMs = Date.now();
    const spec = { spec: { topic: input.goal, audience: 'developer', format: 'notes' as const } };
    const json = (await this.llm.generateJson(
      this.type,
      contentCreatorPrompt(spec),
    )) as ContentCreatorResponse;
    if (!json || !isContentOutput(json)) {
      const output: AgentOutput = { type: 'CRITIQUE', content: { error: 'Invalid content' } };
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
