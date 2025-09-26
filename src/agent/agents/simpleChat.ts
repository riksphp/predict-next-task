import { Agent, AgentInput, AgentOutput, AgentType } from '../core/types';
import { chatDecide } from '../../features/nextTaskPredictor/services/simpleChatAssistant';
import { toolRegistry } from '..';
import { appendAgentTrace } from '../../features/nextTaskPredictor/data-layer/agentTraceStorage';

export class SimpleChatAgent implements Agent {
  readonly type: AgentType = 'INTERACTION';

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startedAtMs = Date.now();
    try {
      const convo = Array.isArray((input.context as any)?.conversation)
        ? ((input.context as any).conversation as any[])
        : [];
      const priorSummary = (input.context as any)?.priorSummary as string | undefined;
      // Surface profile/insights directly in the decision prompt context via conversation serialization
      if ((input.context as any)?.profile) {
        convo.unshift({
          role: 'system',
          text: `PROFILE: ${JSON.stringify((input.context as any).profile)}`,
        });
      }
      if ((input.context as any)?.insights) {
        convo.unshift({
          role: 'system',
          text: `INSIGHTS: ${JSON.stringify((input.context as any).insights)}`,
        });
      }
      const executedTools = Array.isArray((input.context as any)?.executedTools)
        ? ((input.context as any).executedTools as string[])
        : [];
      const threadId = (input.context as any)?.threadId as string | undefined;
      const decision = await chatDecide(String(input.goal || ''), convo, priorSummary, {
        executedTools,
        threadId,
      });
      if (decision.control === 'TOOL_CALL') {
        const output: AgentOutput = {
          type: 'TOOL_CALL',
          content: { name: decision.tool.name, args: decision.tool.args },
          summary: `Request tool: ${decision.tool.name}`,
        };
        const endedAtMs = Date.now();
        await appendAgentTrace({ agent: this.type, input, output, startedAtMs, endedAtMs });
        return output;
      }
      if (decision.control === 'FINAL_ANSWER') {
        const output: AgentOutput = {
          type: 'FINAL_ANSWER',
          content: { message: decision.message },
        };
        const endedAtMs = Date.now();
        await appendAgentTrace({ agent: this.type, input, output, startedAtMs, endedAtMs });
        return output;
      }
      const output: AgentOutput = { type: 'CRITIQUE', content: { error: decision.error } };
      const endedAtMs = Date.now();
      await appendAgentTrace({ agent: this.type, input, output, startedAtMs, endedAtMs });
      return output;
    } catch (e) {
      const output: AgentOutput = { type: 'CRITIQUE', content: { error: String(e) } };
      const endedAtMs = Date.now();
      await appendAgentTrace({ agent: this.type, input, output, startedAtMs, endedAtMs });
      return output;
    }
  }
}
