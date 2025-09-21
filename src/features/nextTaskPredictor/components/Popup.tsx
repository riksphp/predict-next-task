import { useState } from 'react';
import { getBaseTruths } from '../data-layer/baseTruths';
import { predictNextTask } from '../services/predictService';
import { useUserContextStore } from '../data-store/userContextStore';

const Popup = () => {
  const baseTruths = getBaseTruths();
  const { context, setContext, storedPretty } = useUserContextStore();
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  async function onPredict(): Promise<void> {
    setLoading(true);
    const prediction = await predictNextTask(context);
    setResult(prediction);
    setLoading(false);
  }

  return (
    <div className="min-w-[360px] bg-slate-100 p-3 font-sans">
      <div className="bg-white shadow border border-slate-200 rounded-lg">
        <div className="p-4 text-slate-800">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-base font-semibold flex-1">Base Truths</h2>
          </div>

          <ul className="list-disc list-inside space-y-1 mb-3">
            {baseTruths.base_truths.map((t) => (
              <li key={t.principle}>{t.statement}</li>
            ))}
          </ul>

          <h2 className="text-base font-semibold mb-1">Context</h2>
          <textarea
            className="w-full min-h-[96px] rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add name, profession, current todo, constraints..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={onPredict}
              disabled={loading}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Predicting...' : 'Predict Next Task'}
            </button>
          </div>

          {result && (
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-2 text-sm text-slate-800">
              {result}
            </div>
          )}

          <h2 className="text-base font-semibold mt-3">Stored Context</h2>
          <pre className="mt-2 whitespace-pre-wrap break-words rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800">
            {storedPretty || '—'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Popup;
