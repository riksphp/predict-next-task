import { AgentMessageBus } from './core/messageBus';
import { SharedContextStore } from './core/sharedContext';
import { ToolRegistry } from './tools/types';
import { httpGetTool, httpPostTool } from './tools/http';
import { expSumTool } from './tools/math';
import { OrchestratorAgent } from './orchestrator/orchestrator';
import { TaskPlannerAgent } from './agents/taskPlanner';
import { RouterAgent } from './agents/router';

export const messageBus = new AgentMessageBus();
export const sharedContext = new SharedContextStore();
export const toolRegistry = new ToolRegistry();

// Register core tools
toolRegistry.register(httpGetTool);
toolRegistry.register(httpPostTool);
toolRegistry.register(expSumTool);

// Agents
export const orchestrator = new OrchestratorAgent();
export const taskPlanner = new TaskPlannerAgent();
export const router = new RouterAgent();
