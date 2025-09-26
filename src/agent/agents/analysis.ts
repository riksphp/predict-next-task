import { Agent, AgentInput, AgentOutput, AgentType } from '../core/types';
import { LlmClient } from '../core/llmClient';
import { analysisPrompt, AnalysisResponse } from '../prompts/analysis';
import { isAnalysisOutput } from '../schemas/analysis';
import { appendAgentTrace } from '../../features/nextTaskPredictor/data-layer/agentTraceStorage';

export class AnalysisAgent implements Agent {
  readonly type: AgentType = 'ANALYSIS';
  private llm = new LlmClient();

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startedAtMs = Date.now();
    const json = (await this.llm.generateJson(
      this.type,
      analysisPrompt({ context: input.context }),
    )) as AnalysisResponse;
    if (!json || !isAnalysisOutput(json)) {
      const output: AgentOutput = { type: 'CRITIQUE', content: { error: 'Invalid analysis' } };
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
