import type { TopicStrategy } from '../types';
import { buildBrief } from './pipelinePayload';

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  topicsCount: number;
}

const WRITE_VERDICTS = ['بنویس', 'بنویس ولی زاویه را عوض کن'];

/**
 * Creates a comprehensive Google Spreadsheet with 3 tabs:
 * 1. Master Strategy Matrix (All topics with verdicts, gap, rationale, keywords)
 * 2. Article Production Briefs (Write-verdict topics with full actionable briefs & competitor links)
 * 3. Seasonal Roadmap (Chronological breakdown by peak season & production rules)
 */
export async function exportStrategyToGoogleSheets(
  topics: TopicStrategy[],
  accessToken: string,
  onProgress?: (stepText: string) => void
): Promise<ExportResult> {
  const timestamp = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  const spreadsheetTitle = `ماتریس استراتژی سئو و محتوای راه کنکور (${timestamp})`;

  onProgress?.('در حال ایجاد فایل گوگل شیت…');

  // Step 1: Create Spreadsheet with 3 RTL sheets
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: spreadsheetTitle,
        locale: 'fa_IR',
      },
      sheets: [
        {
          properties: {
            sheetId: 0,
            title: 'ماتریس کامل استراتژی',
            rightToLeft: true,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            sheetId: 1,
            title: 'بریف‌های تولید مقاله (بنویس)',
            rightToLeft: true,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            sheetId: 2,
            title: 'تقویم فصلی و نقشه راه',
            rightToLeft: true,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    let parsed: any;
    try {
      parsed = JSON.parse(errText);
    } catch {
      /* ignore */
    }
    throw new Error(parsed?.error?.message || `خطای گوگل شیت (${createRes.status}): ${errText.slice(0, 200)}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  onProgress?.('در حال پر کردن داده‌های ماتریس و بریف‌ها…');

  // Prepare Sheet 1: Master Strategy
  const sheet1Headers = [
    'ردیف',
    'عنوان موضوع',
    'کلیدواژه هدف',
    'حکم تحریریه',
    'دلیل یک‌خطی حکم',
    'زاویه پیشنهادی / تمایز',
    'شکاف‌های محتوایی رقبا',
    'پیشنهاد عملیاتی تمایز',
    'مزیت ویژه راه کنکور',
    'سختی رقابت',
    'استدلال سختی',
    'ماه اوج تقاضا (پیک)',
    'ماه تولید و انتشار',
    'ترند ۵ ساله گوگل',
    'متاتایتل پیشنهادی',
    'متادیسکریپشن پیشنهادی',
  ];

  const sheet1Rows = topics.map((t, idx) => [
    idx + 1,
    t.title || '',
    t.keywordDetails?.keyword || t.targetKeyword || '',
    t.verdictDetails?.type || t.verdict || '',
    t.oneLineReason || t.verdictDetails?.justification || '',
    t.verdictDetails?.angleRecommendation || t.suggestedAngle || '—',
    (t.contentGap?.missingElements ?? []).join(' | '),
    t.contentGap?.actionableProposal || '—',
    t.contentGap?.rahekonkurAdvantage || '—',
    t.difficulty || '',
    t.difficultyRationale || '',
    t.seasonalTiming?.peakPeriod || t.peakSeason || '',
    t.seasonalTiming?.productionMonth || t.productionMonth || '',
    `${t.googleTrends?.fiveYearTrend || '—'} (پیک: ${t.googleTrends?.peakMonth || '—'})`,
    t.keywordDetails?.sampleMetaTitle || '',
    t.keywordDetails?.sampleMetaDescription || '',
  ]);

  // Prepare Sheet 2: Write Briefs
  const sheet2Headers = [
    'اولویت',
    'عنوان مقاله',
    'کلیدواژه هدف',
    'حکم تحریریه',
    'مهلت انتشار',
    'اوج تقاضا',
    'خلاصه بریف عملیاتی',
    'عبارت‌های جستجوی واقعی',
    'صفحات رقیب شناسایی‌شده',
    'قوانین سئو راه کنکور',
  ];

  const writeTopics = topics.filter(t =>
    WRITE_VERDICTS.includes(t.verdictDetails?.type || t.verdict)
  );

  const sheet2Rows = writeTopics.map((t, idx) => [
    idx + 1,
    t.title || '',
    t.keywordDetails?.keyword || t.targetKeyword || '',
    t.verdictDetails?.type || t.verdict || '',
    t.seasonalTiming?.productionMonth || t.productionMonth || '',
    t.seasonalTiming?.peakPeriod || t.peakSeason || '',
    buildBrief(t),
    (t.searchPhrases ?? []).map(p => p.phrase).join(' / '),
    (t.rankingPages ?? []).map(r => `${r.domain}: ${r.title} (${r.url})`).join('\n'),
    'بدون آمار بی‌منبع | بدون وعده تضمین رتبه | لحن شفاف و تحلیلی | بدون سبک زرد انگیزشی',
  ]);

  // Prepare Sheet 3: Seasonal Roadmap
  const sheet3Headers = [
    'ردیف',
    'عنوان موضوع',
    'کلیدواژه هدف',
    'ماه تولید و تحریریه',
    'بازه اوج تقاضا (پیک جستجو)',
    'حکم تحریریه',
    'قاعده زمان‌بندی',
    'نکات گوگل ترندز',
  ];

  const sheet3Rows = [...topics]
    .sort((a, b) => {
      const monthA = a.seasonalTiming?.productionMonth || a.productionMonth || '';
      const monthB = b.seasonalTiming?.productionMonth || b.productionMonth || '';
      return monthA.localeCompare(monthB, 'fa');
    })
    .map((t, idx) => [
      idx + 1,
      t.title || '',
      t.keywordDetails?.keyword || t.targetKeyword || '',
      t.seasonalTiming?.productionMonth || t.productionMonth || '',
      t.seasonalTiming?.peakPeriod || t.peakSeason || '',
      t.verdictDetails?.type || t.verdict || '',
      t.seasonalTiming?.productionRule || '',
      t.googleTrends?.notes || t.googleTrends?.wordingComparison || '',
    ]);

  // Step 2: Insert values with batchUpdate
  const updateValuesRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: "'ماتریس کامل استراتژی'!A1",
            values: [sheet1Headers, ...sheet1Rows],
          },
          {
            range: "'بریف‌های تولید مقاله (بنویس)'!A1",
            values: [sheet2Headers, ...sheet2Rows],
          },
          {
            range: "'تقویم فصلی و نقشه راه'!A1",
            values: [sheet3Headers, ...sheet3Rows],
          },
        ],
      }),
    }
  );

  if (!updateValuesRes.ok) {
    const errText = await updateValuesRes.text();
    console.warn('Values update error:', errText);
  }

  onProgress?.('در حال اعمال رنگ‌بندی و قالب‌بندی شیت‌ها…');

  // Step 3: Apply professional header formatting
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Header format for Sheet 0 (Navy/Slate)
          {
            repeatCell: {
              range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.09, green: 0.14, blue: 0.24 }, // Slate-900
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          // Header format for Sheet 1 (Emerald/Dark green)
          {
            repeatCell: {
              range: { sheetId: 1, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.04, green: 0.31, blue: 0.22 }, // Emerald-900
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          // Header format for Sheet 2 (Blue-900)
          {
            repeatCell: {
              range: { sheetId: 2, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.12, green: 0.23, blue: 0.44 }, // Blue-900
                  textFormat: {
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    bold: true,
                    fontSize: 10,
                  },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('Styling batch update error (non-fatal):', styleErr);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title: spreadsheetTitle,
    topicsCount: topics.length,
  };
}
