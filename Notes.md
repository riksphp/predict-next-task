Why MVP1 isn’t aligned
Single-shot LLM call for prediction; no iterative loop.
No LLM-directed tool/function calling.
No enforced “carry full history into every turn” interaction chain.
Chat exists, but it isn’t an agentic loop that plans → calls tools → reasons → repeats.

Why MVP2 is aligned
Adds an Orchestrator and specialized agents, enabling multi-step, tool-using workflows.
Supports repeated LLM calls with inter-agent/message-bus context retention.
Can execute external tools (APIs, notifications), continuous monitoring loops, multi-step research, and synthesis with validation.
Naturally fits the pattern: Query → LLM plan → Tool call → Result → Next Query … → Final answer, keeping full history each step.
Minimum you need to pass the assignment (without full MVP2)
Implement a small agent loop in a service:
Define a strict output contract (e.g., “FUNCTION_CALL: tool|args” or “FINAL_ANSWER: …”).
Provide a safe tool registry (HTTP fetch, parsing, math, Telegram/Email send, stock polling, etc.).
Loop: LLM → parse → run tool → append tool result to history → LLM … until final answer or max steps.
Persist the entire turn-by-turn transcript in conversationStorage.
This “mini-orchestrator” gives you MVP2-like behavior for the assignment, even before full multi-agent MVP2.

I'll create a structured implementation plan as actionable TODOs for MVP2, then provide detailed step-by-step instructions you can follow.

[1 tool called]

Let me outline small, executable steps you can follow to align with MVP2.

- Step 1: Create agent foundations

  - Add `src/agent/` with subfolders: `core`, `agents`, `tools`, `orchestrator`, `schemas`.
  - Define base types in `core`: `Agent`, `AgentType`, `AgentInput`, `AgentOutput`, `InterAgentMessage`, `ExecutionPlan`, `AgentTrace`.
  - Add a `zod`-style schema plan (you can implement with TS types first if you prefer).

- Step 2: Implement the AgentMessageBus + shared context

  - Add `AgentMessageBus` with `broadcast`, `request`, and `subscribe`.
  - Add `SharedContextStore` to keep global state per session/run: user context snapshot, working memory, artifacts, tool results.
  - Persist traces/decisions to storage (new `agentDecisionStorage.ts`, `agentTraceStorage.ts`).

- Step 3: Define a Tool interface and a minimal tool registry

  - Define `Tool` with `name`, `schema`, `execute`.
  - Implement initial tools:
    - `httpGet`, `httpPost` (with JSON schema validation).
    - `math` (sum, average, exp, etc.).
    - `notify` (stub to console now; later Telegram/email via webhook).
    - `schedule/poll` (setInterval-like with stop token; store in chrome alarms later).
  - Create a `ToolRegistry` that agents can query by name.

- Step 4: Standardize prompts and responses per agent

  - In `schemas/`, define strict JSON response contracts for each agent (Planner, Content, Analysis, Learning, Validation).
  - Add prompt templates that instruct the LLM to RETURN JSON ONLY, with one of:
    - `PLAN_STEP`, `TOOL_CALL`, `AGENT_CALL`, `FINAL_ANSWER`, `CRITIQUE`.

- Step 5: Orchestrator skeleton

  - Implement `OrchestratorAgent` with methods:
    - `createExecutionPlan(input)`: decompose into steps and agent assignments.
    - `executeParallel(plan)`: run independent steps concurrently; collect results.
    - `synthesizeResults(results)`: merge, validate via Validation agent, and format.
  - Add retry and timeout options. Store the full `AgentTrace`.

- Step 6: Implement TaskPlannerAgent (first real agent)

  - Inputs: user goal/context; Outputs: SMART plan, category, timebox, needed tools.
  - Supports emitting `TOOL_CALL` (e.g., calendar/time) and `AGENT_CALL` to Content/Analysis.

- Step 7: Implement ContentCreatorAgent

  - Generates notes/tutorials/examples; accepts constraints, returns structured content.
  - Adds a `Validation` request before finalizing.

- Step 8: Implement AnalysisAgent

  - Consumes history and metrics; returns insights/trends and suggested adjustments to plan.

- Step 9: Implement LearningAgent

  - Updates user model/preferences; writes deltas to `userProfileStorage` and `agentDecisionStorage`.

- Step 10: Implement ValidationAgent + MonitoringAgent

  - Validation: schema conformance, safety filters, fact-check stubs.
  - Monitoring: collect latency, token usage, success/failure, and store to `metrics`.

- Step 11: Build the synthesis and quality pipeline

  - Define a `SynthesisService` to combine outputs; run Validation; attach provenance and confidence.
  - Return a final response + trace path.

- Step 12: Enable parallelism with robust error handling

  - Use `Promise.allSettled` pattern for agent calls; per-step deadlines; fallbacks.
  - Add circuit breakers per provider/tool and progressive degradation.

- Step 13: Enhance data layer

  - New modules:
    - `agentDecisionStorage.ts` (plans/decisions).
    - `agentTraceStorage.ts` (complete traces).
    - `agentMetricsStorage.ts` (timings, retries, failures).
    - Optional `knowledgeGraphStorage.ts` (nodes/edges; start as JSON).

- Step 14: Provider pool per agent

  - Extend `AISettings` to allow model-per-agent, temperature/top_p per agent.
  - Support multiple providers and round-robin or heuristic routing.

- Step 15: UI integration and traces

  - Add an “Agent Run” trigger on `HomePage` (toggle “Agentic Mode”).
  - New “Agent Trace” view in `DashboardPage` to display plan, tool calls, inter-agent messages, and timings.
  - Add a simple “try again with more depth” control.

- Step 16: Add tests/mocks

  - Mock tool responses; unit-test agent reducers and schema parsing.
  - Integration test orchestrator plans and synthesis with fake providers.

- Step 17: Reliability hardening

  - Add exponential backoff, jitter, per-agent rate limits.
  - Guardrails: token limits per step, redaction of secrets from traces, safe JSON parsing.

- Step 18: Documentation updates
  - Update `ARCHITECTURE.md` with actual types and flows.
  - Add diagrams for the concrete orchestrator and data stores.
  - Write a short “How to add a new agent” guide.

If you want, I can scaffold the directories/files and stub the TS interfaces for Steps 1–3 so you can start committing.
