import type { TopicStrategy } from '../types';

export interface QueueRow {
  topic: string;
  brief: string;
  priority: number | '';
  notes: string;
}

export interface IntakePayload {
  source: 'rahekonkur-strategy-app';
  generatedAt: string;
  rows: QueueRow[];
}

const WRITE_VERDICTS = ['بنویس', 'بنویس ولی زاویه را عوض کن'];

function line(label: string, value?: string | null): string {
  const v = (value ?? '').toString().trim();
  return v ? `${label}: ${v}` : '';
}

export function buildBrief(t: TopicStrategy): string {
  const parts: string[] = [];

  parts.push(line('کلیدواژه هدف', t.keywordDetails?.keyword || t.targetKeyword));
  parts.push(line('حکم', t.verdictDetails?.type || t.verdict));

  const angle = t.verdictDetails?.angleRecommendation || t.suggestedAngle;
  parts.push(line('زاویه‌ی الزامی', angle));

  const gaps = t.contentGap?.missingElements ?? [];
  if (gaps.length) {
    parts.push('شکاف محتوایی که باید پر شود:');
    for (const g of gaps) parts.push(`- ${g}`);
  }
  parts.push(line('پیشنهاد عملی', t.contentGap?.actionableProposal));
  parts.push(line('مزیت راه کنکور', t.contentGap?.rahekonkurAdvantage));

  parts.push(line('سختی رقابت', [t.difficulty, t.difficultyRationale].filter(Boolean).join(' — ')));
  parts.push(line('اوج تقاضا', t.seasonalTiming?.peakPeriod || t.peakSeason));
  parts.push(line('مهلت انتشار', t.seasonalTiming?.productionMonth || t.productionMonth));

  const phrases = (t.searchPhrases ?? []).filter(p => !p.isBranded).map(p => p.phrase);
  if (phrases.length) parts.push(line('عبارت‌های جست‌وجوی واقعی', phrases.join(' / ')));

  const rivals = (t.rankingPages ?? []).filter(p => p.url);
  if (rivals.length) {
    parts.push('صفحات رقیب (برای تمایز، نه کپی):');
    for (const r of rivals) parts.push(`- ${r.domain} — ${r.title} — ${r.url}`);
  }

  parts.push(line('عنوان پیشنهادی', t.keywordDetails?.sampleMetaTitle));
  parts.push(line('متای پیشنهادی', t.keywordDetails?.sampleMetaDescription));

  parts.push('قواعد قفل‌شده: بدون آمار بی‌منبع، بدون وعده‌ی تضمین رتبه، بدون لحن انگیزشی، بدون ایموجی.');

  return parts.filter(Boolean).join('\n');
}

export function buildPayload(
  topics: TopicStrategy[],
  opts: { applyPriority?: boolean; priorityOffset?: number } = {}
): IntakePayload {
  const { applyPriority = true, priorityOffset = 0 } = opts;

  const rows = topics
    .filter(t => WRITE_VERDICTS.includes(t.verdictDetails?.type || t.verdict))
    .map((t, i) => ({
      topic: (t.title || t.targetKeyword || '').trim(),
      brief: buildBrief(t),
      priority: applyPriority ? priorityOffset + i + 1 : ('' as const),
      notes: `از استراتژی سئو | مهلت: ${t.seasonalTiming?.productionMonth || t.productionMonth || '—'} | کلیدواژه: ${t.keywordDetails?.keyword || t.targetKeyword}`,
    }))
    .filter(r => r.topic.length > 0);

  return {
    source: 'rahekonkur-strategy-app',
    generatedAt: new Date().toISOString(),
    rows,
  };
}
