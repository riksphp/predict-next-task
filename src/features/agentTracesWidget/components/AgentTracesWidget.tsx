import { useEffect, useState } from 'react';
import {
  getAgentTraces,
  clearAgentTraces,
} from '../../nextTaskPredictor/data-layer/agentTraceStorage';
import styles from '../../nextTaskPredictor/components/DashboardPage.module.css';

const AgentTracesWidget = () => {
  const [traces, setTraces] = useState<any[]>([]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const t = await getAgentTraces();
      setTraces(t.slice(-10).reverse());
    })();
  }, []);

  return (
    <div className={`${styles.widget} ${styles.tracesWidget}`}>
      <div className={styles.widgetHeader}>
        <h3>🧭 Agent Traces</h3>
        <div className={styles.headerActions}>
          <span className={styles.badge}>{traces.length}</span>
          <button
            className={styles.configureButton}
            onClick={async () => {
              await clearAgentTraces();
              setTraces([]);
              setOpenIdx(null);
            }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>
      <div className={styles.tracesList}>
        {traces.length > 0 ? (
          traces.map((t, idx) => (
            <div key={idx} className={styles.traceAccordionItem}>
              <div
                className={styles.traceAccordionHeader}
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              >
                <div className={styles.traceAccordionTitle}>
                  <span className={styles.noteIcon}>🧩</span>
                  <span className={styles.traceAgent}>
                    {t.agent} → {t.output?.type}
                  </span>
                </div>
                <div className={styles.traceMeta}>
                  {new Date(t.startedAtMs).toLocaleTimeString()} -{' '}
                  {new Date(t.endedAtMs).toLocaleTimeString()}
                </div>
                <div className={styles.traceToggle}>{openIdx === idx ? '−' : '+'}</div>
              </div>
              {openIdx === idx && (
                <div className={styles.traceAccordionContent}>
                  <pre className={styles.tracePre}>{JSON.stringify(t, null, 2)}</pre>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No agent traces yet. Run a workflow to see activity.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentTracesWidget;
