import React from 'react';
import { ShieldCheck, AlertCircle, Check, Search, BookOpen } from 'lucide-react';

export const BrandRulesBanner: React.FC = () => {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-5 mb-8 border border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-3.5">
        <span className="w-1.5 h-4 bg-blue-500 rounded-full inline-block"></span>
        <ShieldCheck className="w-5 h-5 text-blue-400" />
        <h2 className="text-sm sm:text-base font-bold text-white">
          تعهد به قواعد سخت پژوهش و سئو برای سایت «راه کنکور»
        </h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/70">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1 text-xs">
            <Check className="w-3.5 h-3.5" />
            <span>عدم گزارش حجم ساختگی</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            هیچ عدد یا شاخص عددی جعلی برای Search Volume ذکر نشده و فقط تقاضای واقعی ارزیابی شده است.
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/70">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1 text-xs">
            <Search className="w-3.5 h-3.5" />
            <span>منبع‌دهی بر پایه وب واقعی</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            تمام صفحات رتبه‌دار رقبا با آدرس دامنه و خلاصه محتوا ثبت شده و ادعای بی‌منبع وجود ندارد.
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/70">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>تفکیک «دیده» و «حدس»</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            نتایج مستند با برچسب <code className="text-slate-200 bg-slate-900 border border-slate-700 px-1 py-0.5 rounded text-[10px] font-bold">[دیده]</code> و استنباط با <code className="text-pink-300 bg-pink-950/50 border border-pink-800/50 px-1 py-0.5 rounded text-[10px] font-bold">[حدس]</code> تفکیک شده‌اند.
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/70">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1 text-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>قاعده ۲ ماه جلوتر</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            محتواهای اوج پاییز (مهر تا آذر) بر اساس تقویم تولید مرداد و شهریور زمان‌بندی شده‌اند.
          </p>
        </div>
      </div>
    </div>
  );
};
