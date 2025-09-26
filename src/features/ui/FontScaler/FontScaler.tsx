import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ui_font_scale';

export default function FontScaler({
  className,
  storageKey = 'ui_font_scale',
  onScale,
  initial = 1,
}: {
  className?: string;
  storageKey?: string;
  onScale?: (scale: number) => void;
  initial?: number;
}) {
  const [scale, setScale] = useState<number>(initial);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey || STORAGE_KEY);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!Number.isNaN(parsed) && parsed > 0) {
          setScale(parsed);
          if (onScale) {
            onScale(parsed);
          } else {
            document.documentElement.style.fontSize = `${parsed * 16}px`;
          }
        }
      }
    } catch {}
  }, []);

  function updateScale(next: number) {
    const clamped = Math.max(0.8, Math.min(1.5, next));
    setScale(clamped);
    if (onScale) {
      onScale(clamped);
    } else {
      document.documentElement.style.fontSize = `${clamped * 16}px`;
    }
    try {
      localStorage.setItem(storageKey || STORAGE_KEY, String(clamped));
    } catch {}
  }

  return (
    <div className={className} style={{ display: 'flex', gap: 8 }}>
      <button
        onClick={() => updateScale(scale - 0.05)}
        title="Decrease font size"
        style={{
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid rgba(79,172,254,.3)',
          background: 'rgba(79,172,254,.1)',
          color: '#4facfe',
          cursor: 'pointer',
        }}
      >
        A−
      </button>
      <button
        onClick={() => updateScale(scale + 0.05)}
        title="Increase font size"
        style={{
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid rgba(79,172,254,.3)',
          background: 'rgba(79,172,254,.1)',
          color: '#4facfe',
          cursor: 'pointer',
        }}
      >
        A+
      </button>
    </div>
  );
}
