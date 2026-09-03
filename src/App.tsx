import React, { useState } from 'react';
import { strategyTopics } from './data/strategyData';
import { Header } from './components/Header';
import { BrandRulesBanner } from './components/BrandRulesBanner';
import { StrategyTable } from './components/StrategyTable';
import { TopicDeepDive } from './components/TopicDeepDive';
import { CalendarRoadmap } from './components/CalendarRoadmap';
import SendToPipeline from './components/SendToPipeline';
import { CheckCircle, ShieldAlert, Sparkles, BookOpen, Compass } from 'lucide-react';

export default function App() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(strategyTopics[0].id);
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');

  const selectedTopic = strategyTopics.find(t => t.id === selectedTopicId) || strategyTopics[0];
  const writeCount = strategyTopics.filter(t => t.verdict === 'بنویس').length;
  const pivotCount = strategyTopics.filter(t => t.verdict === 'بنویس ولی زاویه را عوض کن').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white font-sans" dir="rtl">
      {/* Top Banner & Header */}
      <Header 
        totalTopics={strategyTopics.length} 
        writeCount={writeCount} 
        pivotCount={pivotCount} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compliance and Hard Rules Banner */}
        <BrandRulesBanner />

        {/* Send To Pipeline Component */}
        <div className="mb-6">
          <SendToPipeline topics={strategyTopics} />
        </div>

        {/* Master Strategy Matrix Table */}
        <StrategyTable
          topics={strategyTopics}
          selectedTopicId={selectedTopicId}
          onSelectTopic={(id) => {
            setSelectedTopicId(id);
            const element = document.getElementById('deep-dive-section');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          filterVerdict={filterVerdict}
          setFilterVerdict={setFilterVerdict}
        />

        {/* Seasonal Roadmap */}
        <CalendarRoadmap />

        {/* Detailed 7-Section Analysis for Selected Topic */}
        <div id="deep-dive-section" className="scroll-mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                بررسی موشکافانه موضوع انتخابی
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              برای تغییر موضوع، روی هر سطر در جدول بالا کلیک کنید
            </span>
          </div>

          <TopicDeepDive topic={selectedTopic} />
        </div>

        {/* RaheKonkur Mission Card */}
        <div className="mt-12 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>هویت برند rahekonkur.ir</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              چرا تولید محتوای مستند و بدون اغراق مزیت رقابتی ماست؟
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              بازار کنکور ایران اشباع از وعده‌های «رتبه تک‌رقمی در ۲ ماه» و آمارهای بدون منبع است. استراتژی راه کنکور تبدیل مقالات وبلاگ به ابزارهای عملیاتی (اکسل، جدول، مدل مدیریت زمان) است که داوطلب را مستقیم به محصول (مشاوره هفتگی + تحلیل آزمون) پیوند می‌زند.
            </p>
          </div>

          <div className="shrink-0 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-slate-900 mb-1">خدمات هسته سایت:</div>
            <div>• مشاوره تلفنی برنامه‌محور</div>
            <div>• برنامه درسی هفتگی با رفع تعارض مدرسه</div>
            <div>• تحلیل حرفه‌ای آزمون‌های قلم‌چی و ماز</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            استراتژی محتوای سئو — اختصاصی پایگاه آموزشی <strong className="text-slate-800">راه کنکور (rahekonkur.ir)</strong>
          </span>
          <span className="text-slate-400">
            بر اساس تحلیل واقعی وب، داده‌های رقبا و Google Trends
          </span>
        </div>
      </footer>
    </div>
  );
}
