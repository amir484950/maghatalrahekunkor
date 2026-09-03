import React, { useState, useEffect } from 'react';
import { strategyTopics } from './data/strategyData';
import { Header } from './components/Header';
import { BrandRulesBanner } from './components/BrandRulesBanner';
import { StrategyTable } from './components/StrategyTable';
import { TopicDeepDive } from './components/TopicDeepDive';
import { CalendarRoadmap } from './components/CalendarRoadmap';
import SendToPipeline from './components/SendToPipeline';
import ExportToGoogleSheets from './components/ExportToGoogleSheets';
import { TopicStrategy, CompetitorPage } from './types';
import { CheckCircle, ShieldAlert, Sparkles, BookOpen, Compass, RotateCcw } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'rk_strategy_topics_v1';

export default function App() {
  const [topics, setTopics] = useState<TopicStrategy[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved topics from localStorage:', e);
    }
    return strategyTopics;
  });

  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => topics[0]?.id || strategyTopics[0].id);
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(topics));
    } catch (e) {
      console.warn('Could not persist topics to localStorage:', e);
    }
  }, [topics]);

  const selectedTopic = topics.find(t => t.id === selectedTopicId) || topics[0] || strategyTopics[0];
  const writeCount = topics.filter(t => t.verdict === 'بنویس').length;
  const pivotCount = topics.filter(t => t.verdict === 'بنویس ولی زاویه را عوض کن').length;
  const totalCustomCompetitors = topics.reduce((acc, t) => acc + (t.rankingPages?.filter(p => p.isCustom).length || 0), 0);

  const handleAddCompetitor = (topicId: string, competitor: CompetitorPage, addToGap: boolean) => {
    setTopics(prev => prev.map(t => {
      if (t.id !== topicId) return t;
      const updatedPages = [...t.rankingPages, competitor];
      const updatedGap = { ...t.contentGap };
      if (addToGap && competitor.weaknessNotes) {
        updatedGap.missingElements = [
          ...updatedGap.missingElements,
          `[تحلیل رقیب ${competitor.domain}]: ${competitor.weaknessNotes}`
        ];
      }
      return {
        ...t,
        rankingPages: updatedPages,
        contentGap: updatedGap,
      };
    }));
  };

  const handleRemoveCompetitor = (topicId: string, pageIndex: number) => {
    setTopics(prev => prev.map(t => {
      if (t.id !== topicId) return t;
      const updatedPages = t.rankingPages.filter((_, idx) => idx !== pageIndex);
      return {
        ...t,
        rankingPages: updatedPages,
      };
    }));
  };

  const handleUpdateCompetitor = (topicId: string, pageIndex: number, updated: CompetitorPage) => {
    setTopics(prev => prev.map(t => {
      if (t.id !== topicId) return t;
      const updatedPages = [...t.rankingPages];
      updatedPages[pageIndex] = updated;
      return {
        ...t,
        rankingPages: updatedPages,
      };
    }));
  };

  const handleResetToDefault = () => {
    if (window.confirm('آیا مایلید تمام رقبای اضافه شده و تحلیل‌های اختصاصی به حالت پیش‌فرض بازنشانی شوند؟')) {
      setTopics(strategyTopics);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white font-sans" dir="rtl">
      {/* Top Banner & Header */}
      <Header 
        totalTopics={topics.length} 
        writeCount={writeCount} 
        pivotCount={pivotCount} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Compliance and Hard Rules Banner */}
        <BrandRulesBanner />

        {/* Custom Competitors Status Banner if any added */}
        {totalCustomCompetitors > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-blue-50/80 border border-blue-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm text-blue-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                شما <strong>{totalCustomCompetitors}</strong> صفحه رقیب جدید به تحلیل‌های استراتژی اضافه کرده‌اید. این اطلاعات در بریف‌های نهایی و خروجی شیت اعمال می‌شوند.
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-blue-200 text-blue-700 hover:bg-blue-100/70 transition font-medium text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی به پیش‌فرض</span>
            </button>
          </div>
        )}

        {/* Google Sheets Export & Pipeline Actions */}
        <ExportToGoogleSheets topics={topics} />

        {/* Send To Pipeline Component */}
        <div className="mb-6">
          <SendToPipeline topics={topics} />
        </div>

        {/* Master Strategy Matrix Table */}
        <StrategyTable
          topics={topics}
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

          <TopicDeepDive 
            topic={selectedTopic} 
            onAddCompetitor={handleAddCompetitor}
            onRemoveCompetitor={handleRemoveCompetitor}
            onUpdateCompetitor={handleUpdateCompetitor}
          />
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
