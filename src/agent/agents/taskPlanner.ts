import { Agent, AgentInput, AgentOutput, AgentType } from '../core/types';
import { LlmClient } from '../core/llmClient';
import { taskPlannerPrompt, TaskPlannerResponse } from '../prompts/taskPlanner';
import { isSmartTaskPlan } from '../schemas/taskPlanner';
import { appendAgentTrace } from '../../features/nextTaskPredictor/data-layer/agentTraceStorage';

export class TaskPlannerAgent implements Agent {
  readonly type: AgentType = 'TASK_PLANNER';
  private llm = new LlmClient();

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startedAtMs = Date.now();
    const prompt = taskPlannerPrompt({ goal: input.goal, context: input.context });
    const json = (await this.llm.generateJson(this.type, prompt)) as TaskPlannerResponse;

    if (!json || !json.control) {
      return { type: 'CRITIQUE', content: { error: 'Missing control field' } };
    }

    if (!isSmartTaskPlan(json)) {
      return { type: 'CRITIQUE', content: { error: 'Plan schema invalid' } };
    }

    if (json.control === 'TOOL_CALL' && json.tool) {
      const output: AgentOutput = {
        type: 'TOOL_CALL',
        content: json.tool,
        summary: 'TaskPlanner requested a tool call',
      };
      const endedAtMs = Date.now();
      await appendAgentTrace({ agent: this.type, input, output, startedAtMs, endedAtMs });
      return output;
    }

    if (json.control === 'AGENT_CALL' && json.nextAgent) {
      const output: AgentOutput = {
        type: 'AGENT_CALL',
        content: json,
        nextAgent: json.nextAgent as any,
        summary: 'Pass plan to next agent',
      };
      const endedAtMs = Date.now();
      await appendAgentTrace({ agent: this.type, input, output, startedAtMs, endedAtMs });
      return output;
    }

    if (json.control === 'FINAL_ANSWER') {
      const output: AgentOutput = { type: 'FINAL_ANSWER', content: json };
      const endedAtMs = Date.now();
      await appendAgentTrace({ agent: this.type, input, output, startedAtMs, endedAtMs });
      return output;
    }

    const output: AgentOutput = { type: 'PLAN_STEP', content: json };
    const endedAtMs = Date.now();
    await appendAgentTrace({ agent: this.type, input, output, startedAtMs, endedAtMs });
    return output;
  }
}
