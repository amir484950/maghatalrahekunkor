import React from 'react';
import { Calendar, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { strategyTopics } from '../data/strategyData';

export const CalendarRoadmap: React.FC = () => {
  const mordadTopics = strategyTopics.filter(t => t.productionMonth === 'مرداد');
  const shahrivarTopics = strategyTopics.filter(t => t.productionMonth === 'شهریور');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 mb-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full inline-block"></span>
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>نقشه راه تقویم محتوایی پاییز (اصل ۲ ماه جلوتر)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 mr-3">
            سایت نوپای rahekonkur.ir برای کسب رتبه در آغاز تقاضای پاییزی (مهر/آبان)، باید مقالات را در تابستان منتشر کند.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-medium self-start sm:self-auto">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>زمان طلایی نمایه شدن (Indexing): ۴ تا ۶ هفته</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* بلوک مرداد */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">تولید در مردادماه</h3>
            </div>
            <span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
              هدف: اوج در مهرماه
            </span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm">
            {mordadTopics.map(t => (
              <li key={t.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
                <span className="font-semibold text-slate-800">{t.title}</span>
                <code className="text-xs font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">{t.targetKeyword}</code>
              </li>
            ))}
          </ul>
        </div>

        {/* بلوک شهریور */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">تولید در شهریورماه</h3>
            </div>
            <span className="text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
              هدف: اوج در آبان و آذر
            </span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm">
            {shahrivarTopics.map(t => (
              <li key={t.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
                <span className="font-semibold text-slate-800">{t.title}</span>
                <code className="text-xs font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">{t.targetKeyword}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
