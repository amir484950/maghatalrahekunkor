import React from 'react';
import { Target, Compass, ShieldCheck, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

interface HeaderProps {
  totalTopics: number;
  writeCount: number;
  pivotCount: number;
}

export const Header: React.FC<HeaderProps> = ({ totalTopics, writeCount, pivotCount }) => {
  return (
    <header id="app-header" className="bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-xs shrink-0 tracking-wider">
              RK
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Compass className="w-3 h-3 ml-1 text-blue-400" />
                  سایت rahekonkur.ir
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  برنامه‌ریزی پاییز (مهر، آبان، آذر)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                راه کنکور | RaheKonkur.ir
                <span className="text-sm sm:text-base font-normal text-slate-300 mr-2 border-r border-slate-700 pr-2">
                  پنل استراتژی محتوای سئو و نقشه راه فصلی
                </span>
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                مشاوره برنامه‌محور — 
                <strong className="text-slate-200 font-medium mx-1">بدون تضمین رتبه و بدون آمار ساختگی</strong>.
                استخراج تقاضای واقعی، تحلیل صفحات رتبه‌دار رقبا و شکاف‌های عمیق آموزشی در بازار کنکور.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 bg-slate-800/80 p-2 sm:p-2.5 rounded-xl border border-slate-700/80 text-xs sm:text-sm shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 rounded-lg border border-slate-700/60 shadow-xs">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 text-xs">کل موضوعات:</span>
              <span className="font-bold text-white">{totalTopics}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/60 rounded-lg border border-blue-800/50 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-blue-300 text-xs">حکم «بنویس»:</span>
              <span className="font-bold text-blue-300">{writeCount}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/50 rounded-lg border border-amber-800/50 shadow-xs">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 text-xs">«تغییر زاویه»:</span>
              <span className="font-bold text-amber-300">{pivotCount}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
