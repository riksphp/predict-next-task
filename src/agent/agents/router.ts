import { Agent, AgentInput, AgentOutput, AgentType } from '../core/types';
import { LlmClient } from '../core/llmClient';
import { routerPrompt, RouterResponse } from '../prompts/router';
import { isRouterDecision } from '../schemas/router';
import { appendAgentTrace } from '../../features/nextTaskPredictor/data-layer/agentTraceStorage';

export class RouterAgent implements Agent {
  readonly type: AgentType = 'ROUTER';
  private llm = new LlmClient();

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startedAtMs = Date.now();
    const prompt = routerPrompt({ goal: input.goal, context: input.context });
    const json = (await this.llm.generateJson(this.type, prompt)) as RouterResponse;

    if (!isRouterDecision(json)) {
      return { type: 'CRITIQUE', content: { error: 'Invalid router decision' } };
    }

    const output: AgentOutput = {
      type: 'AGENT_CALL',
      content: json,
      nextAgent: json.routeTo,
      summary: `Route to ${json.routeTo} (intent: ${json.intent}, conf: ${json.confidence})`,
    };
    const endedAtMs = Date.now();
    await appendAgentTrace({
      agent: this.type,
      input,
      output,
      startedAtMs,
      endedAtMs,
    });
    return output;
  }
}
