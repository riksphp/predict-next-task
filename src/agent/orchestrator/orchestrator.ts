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

export class OrchestratorAgent implements Agent {
  readonly type: AgentType = 'ORCHESTRATOR';

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startedAtMs = Date.now();
    const plan = await this.createExecutionPlan(input);
    const results = await this.executePlan(plan, input);
    const output = await this.synthesizeResults(results);
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
      plannerOutput = await taskPlanner.execute(input);
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
        contentCreator.execute(enrichedForDownstream),
        analysis.execute(enrichedForDownstream),
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
      validationOutput = await validation.execute({
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
      const feedbackOutput = await feedback.execute({
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
}
