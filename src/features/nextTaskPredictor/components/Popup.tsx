import { useState } from 'react';
import { getBaseTruths } from '../data-layer/baseTruths';
import { predictNextTask } from '../services/predictService';
import { useTheme } from '../data-store/themeStore';
import { useUserContextStore } from '../data-store/userContextStore';

export default function Popup(): JSX.Element {
  const baseTruths = getBaseTruths();
  const { context, setContext, storedPretty } = useUserContextStore();
  const { theme, setTheme } = useTheme();
  const [result, setResult] = useState<string>('');

  function onPredict(): void {
    setResult(predictNextTask(context));
  }

  return (
    <div data-theme={theme} className="min-w-[360px] bg-base-200 p-2 font-sans">
      <div className="card bg-base-100 shadow border border-base-300">
        <div className="card-body p-4 text-base-content">
          <div className="mb-1 flex items-center gap-2">
            <h2 className="card-title text-base flex-1 text-base-content">Base Truths</h2>
            <span className="label-text text-xs">Theme</span>
            <select
              className="select select-bordered select-sm"
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
            >
              <option value="light">Light</option>
              <option value="cupcake">Cupcake</option>
              <option value="corporate">Corporate</option>
              <option value="bumblebee">Bumblebee</option>
              <option value="business">Business (dark)</option>
              <option value="emerald">Emerald</option>
              <option value="winter">Winter</option>
            </select>
          </div>

          <ul className="list-disc list-inside space-y-1 mb-3">
            {baseTruths.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <h2 className="card-title text-base mb-1 text-base-content">Context</h2>
          <textarea
            className="textarea textarea-bordered w-full min-h-[96px]"
            placeholder="Add name, profession, current todo, constraints..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <button type="button" onClick={onPredict} className="btn btn-primary btn-sm">
              Predict Next Task
            </button>
          </div>

          {result && <div className="mt-3 alert alert-info text-sm">{result}</div>}

          <h2 className="card-title text-base mt-3 text-base-content">Stored Context</h2>
          <pre className="mt-2 whitespace-pre-wrap break-words rounded-md bg-base-200 p-2 text-xs text-base-content">
            {storedPretty || '—'}
          </pre>
        </div>
      </div>
    </div>
  );
}
