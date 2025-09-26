import { Agent, AgentInput, AgentOutput, AgentTrace, AgentType } from '../core/types';
import { appendAgentTrace } from '../../features/nextTaskPredictor/data-layer/agentTraceStorage';
import { SimpleChatAgent } from '../agents/simpleChat';
import { toolRegistry } from '..';

export class SimpleChatOrchestrator implements Agent {
  readonly type: AgentType = 'ORCHESTRATOR';
  private chat = new SimpleChatAgent();

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startedAtMs = Date.now();
    let output = await this.chat.execute(input);
    // Handle iterative tool calls to allow multiple tools (profile then todos)
    let guard = 0;
    const executedTools: string[] = [];
    while (output.type === 'TOOL_CALL' && guard < 5) {
      guard++;
      const req = output.content as { name: string; args: any };
      if (executedTools.includes(req.name)) {
        output = { type: 'CRITIQUE', content: { error: `Repeated tool: ${req.name}` } };
        break;
      }
      const tool = toolRegistry.get(req.name);
      if (!tool) {
        output = { type: 'CRITIQUE', content: { error: `Unknown tool: ${req.name}` } };
        break;
      }
      try {
        const result = await tool.execute(req.args, {
          userId: input.userId,
          sessionId: input.sessionId,
        });
        executedTools.push(req.name);
        // feed tool result back as a synthetic message and re-run agent
        const conversation = Array.isArray((input.context as any)?.conversation)
          ? [
              ...((input.context as any).conversation as any[]),
              { role: 'system', text: `TOOL_RESULT ${req.name}: ${JSON.stringify(result)}` },
            ]
          : [{ role: 'system', text: `TOOL_RESULT ${req.name}: ${JSON.stringify(result)}` }];
        const nextInput: AgentInput = {
          ...input,
          context: {
            ...(input.context || {}),
            conversation,
            executedTools,
            threadId: (input.context as any)?.threadId,
          },
        };
        output = await this.chat.execute(nextInput);
      } catch (e) {
        output = { type: 'CRITIQUE', content: { error: `Tool failed: ${String(e)}` } };
        break;
      }
    }
    const endedAtMs = Date.now();
    const trace: AgentTrace = {
      agent: this.type,
      input,
      output,
      startedAtMs,
      endedAtMs,
    };
    await appendAgentTrace(trace);
    return output;
  }
}
