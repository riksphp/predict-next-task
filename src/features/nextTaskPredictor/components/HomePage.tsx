import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrediction } from '../hooks/usePrediction';
import { PROMPTS } from '../data-layer/prompts';
import ScoreWidget from './ScoreWidget';
import styles from './HomePage.module.css';
import { router, orchestrator } from '../../../agent';

const HomePage = () => {
  const navigate = useNavigate();
  const { loading, predict } = usePrediction();
  const [input, setInput] = useState('');
  const [routerLoading, setRouterLoading] = useState(false);
  const [routerDecision, setRouterDecision] = useState<{
    intent: string;
    routeTo: string;
    confidence: number;
    rationale: string;
  } | null>(null);
  const [routerError, setRouterError] = useState<string | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [workflowDone, setWorkflowDone] = useState(false);

  async function onPredict(): Promise<void> {
    const result = await predict();
    navigate('/response', { state: { result } });
  }

  async function handleSubmit(): Promise<void> {
    if (input.trim()) {
      const message = input.trim();
      setInput('');
      navigate('/chat', { state: { initialMessage: message } });
    }
  }

  return (
    <div className={styles.container}>
      <ScoreWidget />
      <div className={styles.header}>
        <div className={styles.star}>✨</div>
        <div className={styles.headline}>Your AI copilot for focused progress</div>
        <div className={styles.subheadline}>
          Plan smarter, ship faster, and stay in flow—one task at a time.
        </div>
      </div>

      <div className={styles.middle}>
        <button className={styles.primaryButton} onClick={onPredict} disabled={loading}>
          {loading ? 'Predicting...' : 'Predict Next Task'}
        </button>

        <div className={styles.secondaryActions}>
          <button className={styles.settingsButton} onClick={() => navigate('/ai-settings')}>
            🤖 AI Settings
          </button>
          <button className={styles.dashboardButton} onClick={() => navigate('/dashboard')}>
            📊 Dashboard
          </button>
          <button
            className={styles.settingsButton}
            onClick={async () => {
              setRouterError(null);
              setRouterDecision(null);
              if (!input.trim()) {
                setRouterError('Enter a goal in the input box below, then try again.');
                return;
              }
              setRouterLoading(true);
              try {
                const result = await router.execute({
                  userId: 'default-user',
                  sessionId: String(Date.now()),
                  goal: input.trim(),
                  context: {},
                });
                if (result.type === 'AGENT_CALL' && (result.content as any)) {
                  const c = result.content as any;
                  setRouterDecision({
                    intent: c.intent,
                    routeTo: (result.nextAgent as string) || c.routeTo,
                    confidence: c.confidence,
                    rationale: c.rationale,
                  });
                } else {
                  setRouterError('Router returned a non-routing response.');
                }
              } catch (e) {
                setRouterError(e instanceof Error ? e.message : 'Router error');
              } finally {
                setRouterLoading(false);
              }
            }}
            disabled={routerLoading}
            title="Test RouterAgent with your current goal"
          >
            {routerLoading ? 'Routing…' : '🔀 Test Router'}
          </button>
          <button
            className={styles.settingsButton}
            onClick={async () => {
              setWorkflowError(null);
              setWorkflowDone(false);
              if (!input.trim()) {
                setWorkflowError('Enter a goal in the input box below, then try again.');
                return;
              }
              setWorkflowLoading(true);
              try {
                await orchestrator.execute({
                  userId: 'default-user',
                  sessionId: String(Date.now()),
                  goal: input.trim(),
                  context: {},
                });
                setWorkflowDone(true);
                navigate('/dashboard');
              } catch (e) {
                setWorkflowError(e instanceof Error ? e.message : 'Workflow error');
              } finally {
                setWorkflowLoading(false);
              }
            }}
            disabled={workflowLoading}
            title="Run full agentic workflow and see traces in Dashboard"
          >
            {workflowLoading ? 'Running…' : '⚙️ Run Workflow'}
          </button>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            className={styles.inputBox}
            placeholder={PROMPTS.INPUT_PLACEHOLDER}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button className={styles.submitButton} onClick={handleSubmit}>
            ↑
          </button>
        </div>
        <div className={styles.inputLabel}>{PROMPTS.INPUT_LABEL}</div>
        {routerError && (
          <div style={{ marginTop: 8, color: '#cc0000', fontSize: 12 }}>{routerError}</div>
        )}
        {routerDecision && (
          <div style={{ marginTop: 8, fontSize: 12 }}>
            <div>
              <strong>Intent:</strong> {routerDecision.intent}
            </div>
            <div>
              <strong>Route to:</strong> {routerDecision.routeTo} (
              {Math.round(routerDecision.confidence * 100)}
              %)
            </div>
            <div>
              <strong>Why:</strong> {routerDecision.rationale}
            </div>
          </div>
        )}
        {workflowError && (
          <div style={{ marginTop: 8, color: '#cc0000', fontSize: 12 }}>{workflowError}</div>
        )}
        {workflowDone && (
          <div style={{ marginTop: 8, color: '#0a7d00', fontSize: 12 }}>
            Workflow complete. Open Dashboard to view agent traces.
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
