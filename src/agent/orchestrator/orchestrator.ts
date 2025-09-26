import {
  Agent,
  AgentInput,
  AgentOutput,
  AgentTrace,
  AgentType,
  ExecutionPlan,
} from '../core/types';
import { appendAgentTrace } from '../../features/nextTaskPredictor/data-layer/agentTraceStorage';
import {
  router as routerAgent,
  taskPlanner,
  contentCreator,
  analysis,
  validation,
  feedback,
} from '../index';
import { toolRegistry } from '../index';

export class OrchestratorAgent implements Agent {
  readonly type: AgentType = 'ORCHESTRATOR';

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startedAtMs = Date.now();
    // Router-driven, iterative orchestration (no parallel LLM calls)
    let output: AgentOutput = { type: 'CRITIQUE', content: { error: 'No result' } };
    try {
      const routed = await routerAgent.execute(input);
      if (routed.type !== 'AGENT_CALL' || !routed.nextAgent) {
        output = routed; // Router may directly answer
      } else {
        let nextType: AgentType | null = routed.nextAgent as AgentType;
        let guard = 0;
        let currentInput: AgentInput = input;
        while (nextType && guard < 8) {
          guard++;
          const agent = this.getAgentInstance(nextType);
          if (!agent) {
            output = { type: 'CRITIQUE', content: { error: `Unknown agent: ${nextType}` } };
            break;
          }
          const res = await this.runWithTools(agent, currentInput);
          // Stash key outputs into context for downstream agents
          const nextContext = { ...(currentInput.context ?? {}) } as any;
          if (agent.type === 'TASK_PLANNER') nextContext.plan = res.content;
          if (agent.type === 'CONTENT_CREATOR') nextContext.content = res.content;
          if (agent.type === 'ANALYSIS') nextContext.analysis = res.content;
          if (agent.type === 'VALIDATION') nextContext.validation = res.content;
          if (agent.type === 'FEEDBACK') nextContext.feedback = res.content;
          currentInput = { ...currentInput, context: nextContext };

          // If agent explicitly routes to another agent, follow it even for PLAN_STEP
          if ((res.type === 'AGENT_CALL' || res.type === 'PLAN_STEP') && res.nextAgent) {
            nextType = res.nextAgent as AgentType;
            continue;
          }
          // If PLAN_STEP has no explicit routing, ask Router again using enriched context
          if (res.type === 'PLAN_STEP' && !res.nextAgent) {
            const reroute = await routerAgent.execute(currentInput);
            if (reroute.type === 'AGENT_CALL' && reroute.nextAgent) {
              nextType = reroute.nextAgent as AgentType;
              continue;
            }
            output = reroute;
            break;
          }
          output = res; // FINAL_ANSWER or CRITIQUE ends the loop (or PLAN_STEP without routing)
          break;
        }
      }
    } catch (e) {
      output = { type: 'CRITIQUE', content: { error: `Orchestration failed: ${String(e)}` } };
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

  async createExecutionPlan(input: AgentInput): Promise<ExecutionPlan> {
    const steps = [
      { id: 'plan', agent: 'TASK_PLANNER' as const, description: 'Plan SMART task' },
      {
        id: 'content',
        agent: 'CONTENT_CREATOR' as const,
        description: 'Create notes',
        dependsOnStepIds: ['plan'],
      },
      {
        id: 'analysis',
        agent: 'ANALYSIS' as const,
        description: 'Analyze trends',
        dependsOnStepIds: ['plan'],
      },
      {
        id: 'validate',
        agent: 'VALIDATION' as const,
        description: 'Validate outputs',
        dependsOnStepIds: ['plan', 'content', 'analysis'],
      },
    ];
    void input; // not used yet
    return { steps };
  }

  async executePlan(plan: ExecutionPlan, _input: AgentInput): Promise<AgentOutput[]> {
    void plan;
    // Basic pipeline wiring: Router → TaskPlanner → Content & Analysis (parallel) → Validation → Feedback
    const input = _input;
    const outputs: AgentOutput[] = [];

    // 1) Router
    try {
      const routed = await routerAgent.execute(input);
      outputs.push(routed);
    } catch (e) {
      outputs.push({ type: 'CRITIQUE', content: { error: `Router failed: ${String(e)}` } });
    }

    // 2) Task Planner
    let plannerOutput: AgentOutput | null = null;
    try {
      plannerOutput = await this.runWithTools(taskPlanner, input);
      outputs.push(plannerOutput);
    } catch (e) {
      outputs.push({ type: 'CRITIQUE', content: { error: `TaskPlanner failed: ${String(e)}` } });
    }

    // 3) Content + Analysis in parallel
    let contentOutput: AgentOutput | null = null;
    let analysisOutput: AgentOutput | null = null;
    try {
      const enrichedForDownstream: AgentInput = {
        ...input,
        context: { ...(input.context ?? {}), plan: plannerOutput?.content },
        history: input.history,
      };
      const [c, a] = await Promise.allSettled([
        this.runWithTools(contentCreator, enrichedForDownstream),
        this.runWithTools(analysis, enrichedForDownstream),
      ]);
      if (c.status === 'fulfilled') {
        contentOutput = c.value;
        outputs.push(contentOutput);
      } else {
        outputs.push({ type: 'CRITIQUE', content: { error: `ContentCreator failed` } });
      }
      if (a.status === 'fulfilled') {
        analysisOutput = a.value;
        outputs.push(analysisOutput);
      } else {
        outputs.push({ type: 'CRITIQUE', content: { error: `Analysis failed` } });
      }
    } catch (e) {
      outputs.push({ type: 'CRITIQUE', content: { error: `Parallel stage failed: ${String(e)}` } });
    }

    // 4) Validation
    let validationOutput: AgentOutput | null = null;
    try {
      validationOutput = await this.runWithTools(validation, {
        ...input,
        context: {
          ...(input.context ?? {}),
          plan: plannerOutput?.content,
          content: contentOutput?.content,
          analysis: analysisOutput?.content,
        },
        history: input.history,
      });
      outputs.push(validationOutput);
    } catch (e) {
      outputs.push({ type: 'CRITIQUE', content: { error: `Validation failed: ${String(e)}` } });
    }

    // 5) Feedback (synthesis)
    try {
      const feedbackOutput = await this.runWithTools(feedback, {
        ...input,
        context: {
          ...(input.context ?? {}),
          plan: plannerOutput?.content,
          content: contentOutput?.content,
          analysis: analysisOutput?.content,
          validation: validationOutput?.content,
        },
        history: input.history,
      });
      outputs.push(feedbackOutput);
    } catch (e) {
      outputs.push({ type: 'CRITIQUE', content: { error: `Feedback failed: ${String(e)}` } });
    }

    return outputs;
  }

  async synthesizeResults(_results: AgentOutput[]): Promise<AgentOutput> {
    // For now just return final stage result if present; else a simple summary
    const final = _results.find((r) => r.type === 'FINAL_ANSWER') || _results[_results.length - 1];
    return final ?? { type: 'FINAL_ANSWER', content: { message: 'Agent pipeline complete.' } };
  }

  private async runWithTools(agent: Agent, input: AgentInput): Promise<AgentOutput> {
    // Execute agent; if TOOL_CALL, run tool and re-execute with augmented context until non TOOL_CALL
    let lastOutput: AgentOutput = await agent.execute(input);
    let guard = 0;
    const toolCalls: {
      toolName: string;
      args: unknown;
      result?: unknown;
      error?: string;
      startedAtMs: number;
      endedAtMs: number;
    }[] = [];
    let aggregateStart: number | undefined;
    let aggregateEnd: number | undefined;
    while (lastOutput.type === 'TOOL_CALL' && guard < 8) {
      guard++;
      const toolReq = lastOutput.content as { name: string; args: any };
      const tool = toolRegistry.get(toolReq.name);
      if (!tool) {
        const error = `Unknown tool: ${toolReq.name}`;
        toolCalls.push({
          toolName: toolReq.name,
          args: toolReq.args,
          error,
          startedAtMs: Date.now(),
          endedAtMs: Date.now(),
        });
        await appendAgentTrace({
          agent: agent.type,
          input,
          output: { type: 'CRITIQUE', content: { error } },
          startedAtMs: aggregateStart || Date.now(),
          endedAtMs: Date.now(),
          toolCalls,
        });
        return { type: 'CRITIQUE', content: { error } };
      }
      let result: any;
      const startedAtMs = Date.now();
      try {
        result = await tool.execute(toolReq.args, {
          userId: input.userId,
          sessionId: input.sessionId,
        });
        const endedAtMs = Date.now();
        toolCalls.push({
          toolName: toolReq.name,
          args: toolReq.args,
          result,
          startedAtMs,
          endedAtMs,
        });
        aggregateStart = aggregateStart ?? startedAtMs;
        aggregateEnd = endedAtMs;
      } catch (e) {
        const endedAtMs = Date.now();
        const error = `Tool failed: ${String(e)}`;
        toolCalls.push({
          toolName: toolReq.name,
          args: toolReq.args,
          error,
          startedAtMs,
          endedAtMs,
        });
        await appendAgentTrace({
          agent: agent.type,
          input,
          output: { type: 'CRITIQUE', content: { error } },
          startedAtMs: aggregateStart || startedAtMs,
          endedAtMs,
          toolCalls,
        });
        return { type: 'CRITIQUE', content: { error } };
      }
      const nextInput: AgentInput = {
        ...input,
        context: { ...(input.context || {}), toolResult: { name: toolReq.name, result } },
        history: (input.history || []).concat([
          { agent: agent.type, input, output: lastOutput, startedAtMs: 0, endedAtMs: 0 } as any,
        ]),
      };
      lastOutput = await agent.execute(nextInput);
    }
    // Emit a compact tool trace entry if tools were used
    if (toolCalls.length > 0) {
      await appendAgentTrace({
        agent: agent.type,
        input,
        output: { type: 'NO_OP', content: { toolCalls: toolCalls.length } },
        startedAtMs: aggregateStart || Date.now(),
        endedAtMs: aggregateEnd || Date.now(),
        toolCalls,
      });
    }
    return lastOutput;
  }

  private getAgentInstance(type: AgentType): Agent | null {
    switch (type) {
      case 'TASK_PLANNER':
        return taskPlanner;
      case 'CONTENT_CREATOR':
        return contentCreator;
      case 'ANALYSIS':
        return analysis;
      case 'VALIDATION':
        return validation;
      case 'FEEDBACK':
        return feedback;
      case 'ROUTER':
        return routerAgent;
      case 'ORCHESTRATOR':
        return this;
      default:
        return null;
    }
  }
}
