import { useEffect, useState } from 'react';
import {
  getAgentTraces,
  clearAgentTraces,
} from '../../nextTaskPredictor/data-layer/agentTraceStorage';
import styles from '../../nextTaskPredictor/components/DashboardPage.module.css';

const AgentTracesWidget = () => {
  const [traces, setTraces] = useState<any[]>([]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [wide, setWide] = useState<boolean>(false);
  const [tall, setTall] = useState<boolean>(false);
  // per-widget font scaling removed

  useEffect(() => {
    (async () => {
      const t = await getAgentTraces();
      setTraces(t.slice(-10).reverse());
    })();
  }, []);

  function fmtTime(ms: number): string {
    try {
      return new Date(ms).toLocaleTimeString();
    } catch {
      return String(ms);
    }
  }

  function fmtDuration(start?: number, end?: number): string {
    if (!start || !end) return '';
    const d = Math.max(0, end - start);
    if (d < 1000) return `${d}ms`;
    const s = (d / 1000).toFixed(2);
    return `${s}s`;
  }

  return (
    <div
      className={`${styles.widget} ${styles.tracesWidget}`}
      style={wide ? { gridColumn: '1 / -1' } : undefined}
    >
      <div className={styles.widgetHeader}>
        <h3>🧭 Agent Traces</h3>
        <div className={styles.headerActions}>
          <span className={styles.badge}>{traces.length}</span>
          <button
            className={styles.configureButton}
            onClick={() => setWide((w) => !w)}
            title={wide ? 'Collapse width' : 'Expand width'}
          >
            ↔️ {wide ? 'Collapse' : 'Expand'}
          </button>
          <button
            className={styles.configureButton}
            onClick={() => setTall((t) => !t)}
            title={tall ? 'Reduce height' : 'Increase height'}
          >
            ↕️ {tall ? 'Shorter' : 'Taller'}
          </button>
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
      <div className={styles.tracesList} style={tall ? { maxHeight: 640 } : undefined}>
        {traces.length > 0 ? (
          traces.map((t, idx) => {
            const step = idx + 1;
            const total = traces.length;
            const initiator = idx === 0 ? 'ORCHESTRATOR' : traces[idx - 1]?.agent;
            const start = fmtTime(t.startedAtMs);
            const end = fmtTime(t.endedAtMs);
            const dur = fmtDuration(t.startedAtMs, t.endedAtMs);
            return (
              <div key={idx} className={styles.traceAccordionItem}>
                <div
                  className={styles.traceAccordionHeader}
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                >
                  <div className={styles.traceAccordionTitle}>
                    <span className={styles.noteIcon}>🧩</span>
                    <span className={styles.traceAgent}>
                      #{step}/{total} {t.agent} → {t.output?.type}
                    </span>
                  </div>
                  <div className={styles.traceMeta}>
                    <span className={styles.noteCategory} title={`${start}–${end}`}>
                      {start} • {dur}
                    </span>
                    <span className={styles.noteCategory} title="Initiated by">
                      from {initiator}
                    </span>
                  </div>
                  <div className={styles.traceToggle}>{openIdx === idx ? '−' : '+'}</div>
                </div>
                {openIdx === idx && (
                  <div className={styles.traceAccordionContent}>
                    <div style={{ fontSize: 12, color: '#8b949e', margin: '8px 0 6px' }}>
                      Started: {start} • Ended: {end} • Duration: {dur} • Initiated by: {initiator}
                    </div>
                    <pre className={styles.tracePre} style={tall ? { maxHeight: 480 } : undefined}>
                      {JSON.stringify(t, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
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
