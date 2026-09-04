import type { TopicStrategy } from '../types';
import { buildBrief } from './pipelinePayload';
import * as XLSX from 'xlsx';

export interface ExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  topicsCount: number;
}

const WRITE_VERDICTS = ['بنویس', 'بنویس ولی زاویه را عوض کن'];

export const GOOGLE_CLOUD_PROJECT_ID = 'gen-lang-client-0942521389';
export const ENABLE_SHEETS_API_URL = `https://console.cloud.google.com/apis/library/sheets.googleapis.com?project=${GOOGLE_CLOUD_PROJECT_ID}`;
export const ENABLE_DRIVE_API_URL = `https://console.cloud.google.com/apis/library/drive.googleapis.com?project=${GOOGLE_CLOUD_PROJECT_ID}`;

function buildSheetData(topics: TopicStrategy[]) {
  // Sheet 1: Master Strategy
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

  // Sheet 2: Write Briefs
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

  // Sheet 3: Seasonal Roadmap
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

  return {
    sheet1: { headers: sheet1Headers, rows: sheet1Rows },
    sheet2: { headers: sheet2Headers, rows: sheet2Rows },
    sheet3: { headers: sheet3Headers, rows: sheet3Rows },
  };
}

/**
 * Downloads a high-quality Excel (.xlsx) file directly with 3 RTL sheets.
 * Works 100% offline with zero Google API dependency.
 */
export function exportStrategyToExcel(topics: TopicStrategy[]): string {
  const { sheet1, sheet2, sheet3 } = buildSheetData(topics);

  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet([sheet1.headers, ...sheet1.rows]);
  (ws1 as any)['!dir'] = 'rtl';
  XLSX.utils.book_append_sheet(wb, ws1, 'ماتریس استراتژی');

  const ws2 = XLSX.utils.aoa_to_sheet([sheet2.headers, ...sheet2.rows]);
  (ws2 as any)['!dir'] = 'rtl';
  XLSX.utils.book_append_sheet(wb, ws2, 'بریف‌های تولید محتوا');

  const ws3 = XLSX.utils.aoa_to_sheet([sheet3.headers, ...sheet3.rows]);
  (ws3 as any)['!dir'] = 'rtl';
  XLSX.utils.book_append_sheet(wb, ws3, 'تقویم فصلی و تقاضا');

  const timestamp = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'short',
  }).format(new Date()).replace(/\//g, '-');

  const fileName = `ماتریس_استراتژی_سئو_راه_کنکور_${timestamp}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
}

/**
 * Creates a Google Spreadsheet using standard Google Sheets API v4.
 * Uses minimal payload for creation to avoid 503 errors, then batches data and formatting.
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

  onProgress?.('در حال ساخت فایل گوگل شیت در درایو شما…');

  // Step 1: Create Spreadsheet using standard minimal payload (avoids 503 invalid locale bugs)
  let createRes: Response | null = null;
  let lastErrorMsg = '';

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: spreadsheetTitle,
          },
        }),
      });

      if (createRes.ok) break;

      const errText = await createRes.text();
      let parsed: any;
      try { parsed = JSON.parse(errText); } catch {}
      lastErrorMsg = parsed?.error?.message || errText;

      // If 503 or transient, wait 1.5 seconds and retry once
      if (createRes.status === 503 || lastErrorMsg.includes('unavailable')) {
        onProgress?.('پاسخ اولیه سرور با تأخیر مواجه شد، تلاش مجدد…');
        await new Promise((r) => setTimeout(r, 1500));
      } else {
        break;
      }
    } catch (e: any) {
      lastErrorMsg = e?.message || 'خطای شبکه';
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  if (!createRes || !createRes.ok) {
    if (
      lastErrorMsg.includes('unavailable') ||
      createRes?.status === 503 ||
      lastErrorMsg.includes('has not been used') ||
      lastErrorMsg.includes('disabled')
    ) {
      throw new Error(
        `GOOGLE_SHEETS_API_UNAVAILABLE: سرویس Google Sheets API در حال حاضر پاسخگو نیست یا در پروژه گوگل فعال نشده است. (کد: ${createRes?.status || 503})`
      );
    }
    throw new Error(`خطای گوگل شیت (${createRes?.status}): ${lastErrorMsg.slice(0, 200)}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  const defaultFirstSheetId = sheetData.sheets?.[0]?.properties?.sheetId ?? 0;

  onProgress?.('در حال پیکربندی زبان و تب‌های فارسی…');

  // Step 2: Configure 3 RTL sheets with Persian names
  const setupTabsRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          // Update default first sheet
          {
            updateSheetProperties: {
              properties: {
                sheetId: defaultFirstSheetId,
                title: 'ماتریس کامل استراتژی',
                rightToLeft: true,
                gridProperties: { frozenRowCount: 1 },
              },
              fields: 'title,rightToLeft,gridProperties.frozenRowCount',
            },
          },
          // Add Sheet 2
          {
            addSheet: {
              properties: {
                title: 'بریف‌های تولید مقاله (بنویس)',
                rightToLeft: true,
                gridProperties: { frozenRowCount: 1 },
              },
            },
          },
          // Add Sheet 3
          {
            addSheet: {
              properties: {
                title: 'تقویم فصلی و نقشه راه',
                rightToLeft: true,
                gridProperties: { frozenRowCount: 1 },
              },
            },
          },
        ],
      }),
    }
  );

  if (!setupTabsRes.ok) {
    console.warn('Tab rename warning:', await setupTabsRes.text());
  }

  onProgress?.('در حال درج اطلاعات استراتژی، کلمات کلیدی و بریف‌ها…');

  const { sheet1, sheet2, sheet3 } = buildSheetData(topics);

  // Step 3: Insert values with batchUpdate
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
            values: [sheet1.headers, ...sheet1.rows],
          },
          {
            range: "'بریف‌های تولید مقاله (بنویس)'!A1",
            values: [sheet2.headers, ...sheet2.rows],
          },
          {
            range: "'تقویم فصلی و نقشه راه'!A1",
            values: [sheet3.headers, ...sheet3.rows],
          },
        ],
      }),
    }
  );

  if (!updateValuesRes.ok) {
    console.warn('Values update warning:', await updateValuesRes.text());
  }

  onProgress?.('در حال اعمال رنگ‌بندی حرفه‌ای…');

  // Step 4: Apply styling to headers
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: { sheetId: defaultFirstSheetId, startRowIndex: 0, endRowIndex: 1 },
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
        ],
      }),
    });
  } catch (styleErr) {
    console.warn('Style update warning (non-fatal):', styleErr);
  }

  return {
    spreadsheetId,
    spreadsheetUrl,
    title: spreadsheetTitle,
    topicsCount: topics.length,
  };
}
