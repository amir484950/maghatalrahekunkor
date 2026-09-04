import React, { useState, useEffect } from 'react';
import { TopicStrategy } from '../types';
import {
  exportStrategyToGoogleSheets,
  exportStrategyToExcel,
  ENABLE_SHEETS_API_URL,
  ENABLE_DRIVE_API_URL,
  ExportResult,
} from '../lib/googleSheetsExport';
import {
  getAccessToken,
  setAccessToken,
  googleSignIn,
  logout,
  initAuth,
} from '../lib/googleAuth';
import {
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  LogOut,
  Download,
  Sparkles,
  Info,
} from 'lucide-react';

interface ExportToGoogleSheetsProps {
  topics: TopicStrategy[];
}

export const ExportToGoogleSheets: React.FC<ExportToGoogleSheetsProps> = ({ topics }) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState<boolean>(false);
  const [excelSuccessMsg, setExcelSuccessMsg] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isServiceUnavailableError, setIsServiceUnavailableError] = useState<boolean>(false);
  const [lastExport, setLastExport] = useState<ExportResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Monitor auth changes
    const unsub = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(Boolean(token));
      },
      () => {
        setCurrentUser(null);
        setHasToken(false);
      }
    );

    // Check existing stored token
    const token = getAccessToken();
    if (token) {
      setHasToken(true);
    }

    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    setIsServiceUnavailableError(false);

    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setHasToken(true);
        setCurrentUser(res.user);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('پنجره ورود به حساب گوگل بسته شد.');
      } else if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'دامنه شما';
        setErrorMsg(
          `دامنه «${currentHost}» در فایربیس مجاز نشده است. برای حل مشکل، این دامنه را در کنسول Firebase در بخش Authentication > Settings > Authorized domains اضافه کنید.`
        );
      } else {
        setErrorMsg(err?.message || 'خطا در برقراری ارتباط با حساب گوگل.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setCurrentUser(null);
      setHasToken(false);
      setLastExport(null);
      setErrorMsg(null);
      setIsServiceUnavailableError(false);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  const handleExport = async () => {
    let token = getAccessToken();
    if (!token) {
      // Need fresh token via sign-in
      try {
        setIsSigningIn(true);
        const res = await googleSignIn();
        if (res?.accessToken) {
          token = res.accessToken;
          setCurrentUser(res.user);
          setHasToken(true);
        } else {
          setErrorMsg('برای ایجاد شیت، نیاز به اتصال به حساب گوگل است.');
          return;
        }
      } catch (authErr: any) {
        if (authErr?.code === 'auth/unauthorized-domain' || authErr?.message?.includes('unauthorized-domain')) {
          const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'دامنه شما';
          setErrorMsg(
            `دامنه «${currentHost}» در فایربیس مجاز نشده است. برای حل مشکل، این دامنه را در کنسول Firebase در بخش Authentication > Settings > Authorized domains اضافه کنید.`
          );
        } else {
          setErrorMsg('خطا در احراز هویت با حساب گوگل.');
        }
        return;
      } finally {
        setIsSigningIn(false);
      }
    }

    if (!token) return;

    setIsExporting(true);
    setErrorMsg(null);
    setIsServiceUnavailableError(false);
    setProgressMsg('در حال آماده‌سازی داده‌ها…');

    try {
      const result = await exportStrategyToGoogleSheets(topics, token, (step) => {
        setProgressMsg(step);
      });
      setLastExport(result);
    } catch (err: any) {
      console.error('Google Sheets export failed:', err);
      const msg = err?.message || '';

      if (
        msg.includes('unavailable') ||
        msg.includes('503') ||
        msg.includes('GOOGLE_SHEETS_API_UNAVAILABLE') ||
        msg.includes('has not been used') ||
        msg.includes('disabled')
      ) {
        setIsServiceUnavailableError(true);
        setErrorMsg(
          'سرویس Google Sheets API در حال حاضر پاسخگو نیست یا هنوز در پروژه گوگل کلود شما فعال نشده است.'
        );
      } else if (msg.includes('401') || msg.includes('token')) {
        setAccessToken(null);
        setHasToken(false);
        setErrorMsg('اعتبار نشست گوگل منقضی شده است. لطفاً مجدداً وارد حساب شوید.');
      } else {
        setErrorMsg(msg || 'خطا در ایجاد گوگل شیت.');
      }
    } finally {
      setIsExporting(false);
      setProgressMsg('');
    }
  };

  const handleDownloadExcel = () => {
    try {
      setIsDownloadingExcel(true);
      setErrorMsg(null);
      const filename = exportStrategyToExcel(topics);
      setExcelSuccessMsg(`فایل «${filename}» با ۳ برگه کامل با موفقیت دانلود شد.`);
      setTimeout(() => setExcelSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Excel download failed:', err);
      setErrorMsg('خطا در دانلود فایل اکسل: ' + err?.message);
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const handleCopyLink = () => {
    if (!lastExport?.spreadsheetUrl) return;
    navigator.clipboard.writeText(lastExport.spreadsheetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      dir="rtl"
      id="export-google-sheets-card"
      className="rounded-xl border border-emerald-200 bg-linear-to-r from-emerald-50/70 via-teal-50/40 to-slate-50/70 p-4.5 sm:p-5 shadow-xs mb-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Main Column: Title & Description */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">
                خروجی اکسل و Google Sheets
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ۳ شیت کامل با قالب‌بندی فارسی
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-2xl">
              صدور مستقیم استراتژی در گوگل شیت و درایو شما یا دانلود فوری فایل استاندارد Excel (.xlsx) با ۳ تب تفصیلی:
              <strong className="text-slate-800 font-medium mr-1">۱. ماتریس کامل ۳۰ موضوع</strong>،
              <strong className="text-slate-800 font-medium mr-1">۲. بریف تفصیلی خط تولید</strong>، و
              <strong className="text-slate-800 font-medium mr-1">۳. تقویم فصلی و اوج تقاضا</strong>.
            </p>
          </div>
        </div>

        {/* Actions & Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-auto">
          {/* Direct Offline Excel Download (Always Available & Instant) */}
          <button
            type="button"
            id="download-excel-btn"
            onClick={handleDownloadExcel}
            disabled={isDownloadingExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold hover:bg-emerald-50 transition shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-50"
            title="دانلود مستقیم فایل اکسل (.xlsx) بدون نیاز به اینترنت و سرویس گوگل"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>دانلود فایل اکسل (.xlsx)</span>
          </button>

          {/* User Profile Pill if Logged In */}
          {currentUser && hasToken ? (
            <div className="flex items-center gap-2 bg-white/90 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-xs text-slate-700">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-5 h-5 rounded-full border border-slate-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">
                  {currentUser.displayName?.[0] || 'U'}
                </div>
              )}
              <span className="max-w-[110px] truncate font-medium">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                title="خروج از حساب گوگل"
                className="text-slate-400 hover:text-rose-600 transition p-0.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}

          {/* Primary Action Button: Google Sheets */}
          {!hasToken ? (
            <button
              type="button"
              id="google-signin-btn"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-800 transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>در حال اتصال به گوگل…</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#ffffff"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#ffffff"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#ffffff"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#ffffff"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>ورود و ایجاد گوگل شیت</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              id="generate-google-sheet-btn"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-700 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-800 transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progressMsg || 'در حال ایجاد شیت…'}</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>تولید گوگل شیت جدید</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Excel Download Success Toast */}
      {excelSuccessMsg && (
        <div className="mt-3 pt-2.5 border-t border-emerald-200 flex items-center gap-2 text-xs text-emerald-900 bg-emerald-100/90 px-3 py-2 rounded-lg animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{excelSuccessMsg}</span>
        </div>
      )}

      {/* Google Sheets Creation Success */}
      {lastExport && (
        <div className="mt-3.5 pt-3.5 border-t border-emerald-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/90 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-950">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">فایل گوگل شیت با موفقیت ایجاد شد:</span>
              <span className="text-slate-600 mr-1.5">{lastExport.title}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 text-xs hover:bg-slate-50 transition cursor-pointer"
              title="کپی لینک فایل شیت"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>کپی لینک</span>
                </>
              )}
            </button>

            <a
              href={lastExport.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-2xs"
            >
              <span>مشاهده در گوگل شیت</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Specific Service Unavailable Guide & Fallback */}
      {isServiceUnavailableError && (
        <div className="mt-3.5 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-950">
                علت خطای «The service is currently unavailable» در گوگل شیت:
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                این پیام به این معنی است که سرویس <strong>Google Sheets API</strong> در پروژه ابری Google Cloud شما هنوز فعال (Enable) نشده است، یا سرورهای گوگل با اختلال موقت مواجه شده‌اند.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <a
              href={ENABLE_SHEETS_API_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition shadow-2xs"
            >
              <span>۱. فعال‌سازی یک‌کلیکه Google Sheets API در کنسول گوگل</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={ENABLE_DRIVE_API_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/60 text-amber-900 font-medium text-xs transition"
            >
              <span>فعال‌سازی Google Drive API (اختیاری)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs cursor-pointer mr-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>۲. دانلود مستقیم فایل اکسل (.xlsx) بدون معطلی</span>
            </button>
          </div>
        </div>
      )}

      {/* General Error Message */}
      {errorMsg && !isServiceUnavailableError && (
        <div className="mt-3 pt-2.5 border-t border-rose-200 flex items-center justify-between gap-2 text-xs text-rose-800 bg-rose-50/80 px-3 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 underline hover:text-emerald-950 shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>دانلود اکسل</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportToGoogleSheets;
