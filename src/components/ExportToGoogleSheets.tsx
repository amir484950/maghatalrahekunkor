import React, { useState, useEffect } from 'react';
import type { TopicStrategy } from '../types';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setAccessToken,
} from '../lib/googleAuth';
import { exportStrategyToGoogleSheets, ExportResult } from '../lib/googleSheetsExport';
import type { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Copy,
  Check,
} from 'lucide-react';

interface Props {
  topics: TopicStrategy[];
}

export const ExportToGoogleSheets: React.FC<Props> = ({ topics }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<ExportResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(Boolean(token));
        setErrorMsg(null);
      },
      () => {
        // Not authenticated or token absent
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMsg(null);
    try {
      const res = await googleSignIn();
      if (res?.user && res?.accessToken) {
        setCurrentUser(res.user);
        setHasToken(true);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMsg('پنجره ورود به حساب گوگل بسته شد.');
      } else if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('unauthorized-domain')) {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'دامنه شما';
        setErrorMsg(`دامنه «${currentHost}» در فایربیس مجاز نشده است. برای حل مشکل، این دامنه را در کنسول Firebase در بخش Authentication > Settings > Authorized domains اضافه کنید.`);
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
          setErrorMsg(`دامنه «${currentHost}» در فایربیس مجاز نشده است. برای حل مشکل، این دامنه را در کنسول Firebase در بخش Authentication > Settings > Authorized domains اضافه کنید.`);
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
    setProgressMsg('در حال آماده‌سازی داده‌ها…');

    try {
      const result = await exportStrategyToGoogleSheets(topics, token, (step) => {
        setProgressMsg(step);
      });
      setLastExport(result);
    } catch (err: any) {
      console.error('Google Sheets export failed:', err);
      if (err?.message?.includes('401') || err?.message?.includes('token')) {
        setAccessToken(null);
        setHasToken(false);
        setErrorMsg('اعتبار نشست گوگل منقضی شده است. لطفاً مجدداً وارد حساب شوید.');
      } else {
        setErrorMsg(err?.message || 'خطا در ایجاد گوگل شیت.');
      }
    } finally {
      setIsExporting(false);
      setProgressMsg('');
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
      className="rounded-xl border border-emerald-200 bg-linear-to-r from-emerald-50/70 to-teal-50/50 p-4.5 sm:p-5 shadow-xs mb-6"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left/Main Column: Title & Description */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900">
                خروجی اختصاصی Google Sheets
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ۳ شیت کامل با قالب‌بندی فارسی
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-2xl">
              تولید مستقیم شیت رسمی در Google Drive شما با ۳ تب مستقل: 
              <strong className="text-slate-800 font-medium mr-1">۱. ماتریس کامل ۳۰ موضوع</strong>، 
              <strong className="text-slate-800 font-medium mr-1">۲. بریف تفصیلی خط تولید محتوا</strong>، و 
              <strong className="text-slate-800 font-medium mr-1">۳. تقویم فصلی و تقاضای گوگل</strong>.
            </p>
          </div>
        </div>

        {/* Right Column: Actions & Auth */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
          {currentUser && hasToken ? (
            <div className="flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs text-slate-700">
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
              <span className="max-w-[130px] truncate font-medium">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                title="خروج از حساب گوگل"
                className="text-slate-400 hover:text-rose-600 transition p-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : null}

          {/* Primary Action Button */}
          {!hasToken ? (
            <button
              type="button"
              id="google-signin-btn"
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition shadow-2xs hover:shadow-xs disabled:opacity-50"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>در حال اتصال به گوگل…</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>ورود با گوگل برای صدور شیت</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              id="generate-google-sheet-btn"
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-700 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-800 transition shadow-xs disabled:opacity-50"
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

      {/* Success Notification with Direct Link */}
      {lastExport && (
        <div className="mt-3.5 pt-3.5 border-t border-emerald-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/80 p-3 rounded-lg">
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 text-xs hover:bg-slate-50 transition"
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
              <span>مشاهده و باز کردن در گوگل شیت</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="mt-3 pt-2.5 border-t border-rose-200 flex items-center gap-2 text-xs text-rose-800 bg-rose-50/80 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default ExportToGoogleSheets;
