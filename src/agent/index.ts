import { AgentMessageBus } from './core/messageBus';
import { SharedContextStore } from './core/sharedContext';
import { ToolRegistry } from './tools/types';
import { httpGetTool, httpPostTool } from './tools/http';
import { expSumTool } from './tools/math';
import { OrchestratorAgent } from './orchestrator/orchestrator';
import { TaskPlannerAgent } from './agents/taskPlanner';
import { RouterAgent } from './agents/router';
import { ContentCreatorAgent } from './agents/contentCreator';
import { AnalysisAgent } from './agents/analysis';
import { LearningAgent } from './agents/learning';
import { ValidationAgent } from './agents/validation';
import { MonitoringAgent } from './agents/monitoring';
import { InteractionAgent } from './agents/interaction';
import { FeedbackAgent } from './agents/feedback';

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
export const contentCreator = new ContentCreatorAgent();
export const analysis = new AnalysisAgent();
export const learning = new LearningAgent();
export const validation = new ValidationAgent();
export const monitoring = new MonitoringAgent();
export const interaction = new InteractionAgent();
export const feedback = new FeedbackAgent();
