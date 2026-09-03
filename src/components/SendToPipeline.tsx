import React, { useState } from 'react';
import type { TopicStrategy } from '../types';
import { buildPayload } from '../lib/pipelinePayload';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'ok'; added: number; skipped: number; duplicates: string[] }
  | { kind: 'error'; message: string };

interface Props {
  topics: TopicStrategy[];
  endpoint?: string;
}

export const SendToPipeline: React.FC<Props> = ({
  topics,
  endpoint = '/.netlify/functions/push-to-n8n',
}) => {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [applyPriority, setApplyPriority] = useState(true);

  const payload = buildPayload(topics, { applyPriority });
  const count = payload.rows.length;

  async function send() {
    if (count === 0) {
      setStatus({ kind: 'error', message: 'هیچ موضوعی با حکم «بنویس» وجود ندارد.' });
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data: any = {};
      try { data = JSON.parse(text); } catch { /* non-JSON body */ }

      if (!res.ok || data?.ok === false) {
        setStatus({ kind: 'error', message: data?.error || `خطای ${res.status}: ${text.slice(0, 200)}` });
        return;
      }
      setStatus({
        kind: 'ok',
        added: Number(data.added ?? 0),
        skipped: Number(data.skipped ?? 0),
        duplicates: Array.isArray(data.duplicates) ? data.duplicates : [],
      });
    } catch (e: any) {
      setStatus({ kind: 'error', message: e?.message || 'ارتباط با سرور برقرار نشد.' });
    }
  }

  return (
    <div dir="rtl" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">ارسال به خط تولید مقاله</h3>
          <p className="mt-1 text-xs text-slate-500">
            {count} موضوع با حکم «بنویس» به صف مقالات اضافه می‌شود. موضوعات تکراری خودکار رد می‌شوند.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={applyPriority}
              onChange={e => setApplyPriority(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            اعمال اولویت فصلی
          </label>

          <button
            type="button"
            onClick={send}
            disabled={status.kind === 'sending' || count === 0}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {status.kind === 'sending' ? 'در حال ارسال…' : 'ارسال به صف'}
          </button>
        </div>
      </div>

      {status.kind === 'ok' && (
        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          {status.added} موضوع به صف اضافه شد
          {status.skipped > 0 && ` — ${status.skipped} موضوع تکراری بود و رد شد`}
          {status.duplicates.length > 0 && (
            <span className="block pt-1 text-emerald-700">تکراری‌ها: {status.duplicates.join('، ')}</span>
          )}
        </div>
      )}

      {status.kind === 'error' && (
        <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-900">
          ارسال نشد — {status.message}
        </div>
      )}
    </div>
  );
};

export default SendToPipeline;
