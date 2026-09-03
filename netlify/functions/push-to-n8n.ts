import type { Handler } from '@netlify/functions';

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

const fail = (statusCode: number, error: string) => ({
  statusCode,
  headers: JSON_HEADERS,
  body: JSON.stringify({ ok: false, error }),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return fail(405, 'فقط POST');

  const url = process.env.N8N_INTAKE_URL;
  const token = process.env.RK_INTAKE_TOKEN;
  if (!url || !token) return fail(500, 'N8N_INTAKE_URL یا RK_INTAKE_TOKEN در Netlify تنظیم نشده است.');

  let payload: any;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return fail(400, 'بدنه‌ی درخواست JSON معتبر نبود.');
  }

  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  if (rows.length === 0) return fail(400, 'هیچ سطری برای ارسال وجود نداشت.');
  if (rows.length > 50) return fail(400, 'حداکثر ۵۰ سطر در هر ارسال.');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-rk-token': token },
      body: JSON.stringify({ source: payload.source, generatedAt: payload.generatedAt, rows }),
      signal: controller.signal,
    });

    const text = await res.text();
    if (!res.ok) return fail(502, `n8n پاسخ ${res.status} داد: ${text.slice(0, 300)}`);

    try {
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify(JSON.parse(text)) };
    } catch {
      return { statusCode: 200, headers: JSON_HEADERS, body: JSON.stringify({ ok: true, raw: text.slice(0, 300) }) };
    }
  } catch (e: any) {
    if (e?.name === 'AbortError') return fail(504, 'n8n در ۲۰ ثانیه پاسخ نداد.');
    return fail(502, e?.message || 'ارتباط با n8n برقرار نشد.');
  } finally {
    clearTimeout(timer);
  }
};
