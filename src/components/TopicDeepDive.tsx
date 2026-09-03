import React from 'react';
import { TopicStrategy } from '../types';
import { 
  Search, 
  ExternalLink, 
  Layers, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Key, 
  TrendingUp, 
  Lightbulb,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface TopicDeepDiveProps {
  topic: TopicStrategy;
}

export const TopicDeepDive: React.FC<TopicDeepDiveProps> = ({ topic }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Title Header */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-600 text-white shadow-xs">
              تحلیل عمیق ۷ بخشی
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              کلمه هدف: {topic.targetKeyword}
            </span>
            <span className="px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              تولید: {topic.productionMonth}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {topic.title}
          </h2>
          {topic.suggestedAngle && (
            <p className="mt-2 text-xs sm:text-sm text-blue-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 shrink-0 text-blue-400" />
              <span>زاویه پیشنهادی: {topic.suggestedAngle}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-700/80">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">حکم نهایی استراتژیست:</div>
            <div className={`text-sm sm:text-base font-bold ${
              topic.verdict === 'بنویس' ? 'text-blue-400' : 'text-amber-400'
            }`}>
              {topic.verdict}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-8">
        {/* ۱. عبارت‌های واقعی جستجو */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-200 pb-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full inline-block"></span>
            <Search className="w-4 h-4 text-blue-600" />
            <h3>۱. عبارت‌های واقعی جستوجو (Google Autocomplete & Related)</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            عبارت‌هایی که داوطلبان و خانواده‌ها در نوار جستجو تایپ می‌کنند، به تفکیک عبارات برندی:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {topic.searchPhrases.map((sp, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 border border-slate-300">
                    [دیده]
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-slate-800">
                    {sp.phrase}
                  </span>
                </div>
                {sp.isBranded ? (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                    برندی: {sp.brandName}
                  </span>
                ) : (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    عمومی / بدون برند
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ۲. صفحات رتبه‌دار فعلی */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-200 pb-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full inline-block"></span>
            <Layers className="w-4 h-4 text-blue-600" />
            <h3>۲. صفحات رتبه‌دار فعلی (تحلیل رقبا در نتایج برتر گوگل)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {topic.rankingPages.map((page, idx) => (
              <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50/70 transition-colors shadow-2xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    {page.domain}
                  </span>
                  <a 
                    href={page.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium hover:underline"
                  >
                    <span>مشاهده منبع</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  {page.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-700">محتوای ارائه شده:</strong> {page.summary}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ۳. شکاف محتوایی */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base border-b border-slate-200 pb-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full inline-block"></span>
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3>۳. شکاف محتوایی (آنچه در نتایج فعلی نیست و برگ برنده راه کنکور است)</h3>
          </div>
          <div className="bg-blue-50/30 border border-blue-200 rounded-xl p-4 sm:p-5 space-y-3">
            <div>
              <span className="text-xs font-bold text-blue-900 block mb-1">
                المان‌های مفقود در مقالات رقبا:
              </span>
              <ul className="list-disc list-inside text-xs sm:text-sm text-slate-700 space-y-1.5">
                {topic.contentGap.missingElements.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="text-slate-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-blue-200/80">
              <span className="text-xs font-bold text-slate-900 block mb-1">
                پیشنهاد عملیاتی تولید محتوا برای راه کنکور:
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {topic.contentGap.actionableProposal}
              </p>
            </div>

            <div className="bg-white p-3 rounded-lg border border-blue-200 text-xs sm:text-sm shadow-2xs">
              <strong className="text-blue-800 font-bold">ارتباط با خدمات راه کنکور: </strong>
              <span className="text-slate-700">{topic.contentGap.rahekonkurAdvantage}</span>
            </div>
          </div>
        </section>

        {/* ۴ و ۴.۵: سختی رقابت و روند زمانی Google Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ۴. سختی رقابت */}
          <section className="space-y-2.5 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <span className="label-guess text-[10px] font-bold px-2 py-0.5 rounded bg-pink-50 text-pink-700 border border-pink-200">[حدس]</span>
                <Flame className="w-4 h-4 text-orange-500" />
                <h4>۴. سختی رقابت</h4>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                درجه: {topic.difficulty}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {topic.difficultyRationale}
            </p>
          </section>

          {/* ۴.۵ روند زمانی ترندز */}
          <section className="space-y-2.5 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <span className="label-observed text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">[دیده]</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h4>۴.۵ روند زمانی (Google Trends)</h4>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                روند ۵ ساله: {topic.googleTrends.fiveYearTrend}
              </span>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 space-y-1.5">
              <div>
                <strong className="text-slate-900">الف) ماه اوج جستجو: </strong>
                <span>{topic.googleTrends.peakMonth}</span>
              </div>
              <div>
                <strong className="text-slate-900">ب) جهت پنج‌ساله: </strong>
                <span>{topic.googleTrends.fiveYearTrend}</span>
              </div>
              <div>
                <strong className="text-slate-900">ج) مقایسه صورتبندی: </strong>
                <span>{topic.googleTrends.wordingComparison}</span>
              </div>
              <div className="text-xs text-slate-500 pt-1">
                *{topic.googleTrends.notes}
              </div>
            </div>
          </section>
        </div>

        {/* ۵ و ۶: زمان‌بندی فصلی و حکم نهایی */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ۵. زمان‌بندی فصلی */}
          <section className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h4>۵. زمانبندی فصلی و ریتم کنکور</h4>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 space-y-1">
              <div><strong>بازه اوج مصرف:</strong> {topic.seasonalTiming.peakPeriod}</div>
              <div><strong>ماه تولید (قاعده دو ماه قبل):</strong> <span className="font-bold text-blue-800">{topic.seasonalTiming.productionMonth}</span></div>
              <p className="text-xs text-slate-500">{topic.seasonalTiming.productionRule}</p>
            </div>
          </section>

          {/* ۶. حکم نهایی */}
          <section className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <h4>۶. حکم نهایی استراتژیست</h4>
            </div>
            <div className="text-xs sm:text-sm text-slate-700 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">وضعیت:</span>
                <span className="font-bold text-blue-700">{topic.verdictDetails.type}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {topic.verdictDetails.justification}
              </p>
              {topic.verdictDetails.angleRecommendation && (
                <div className="text-xs bg-white p-2.5 rounded border border-slate-200 text-slate-800 shadow-2xs">
                  <strong className="text-slate-900">توصیه زاویه: </strong>
                  {topic.verdictDetails.angleRecommendation}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ۷. عبارت کلیدی پیشنهادی و متادیتا */}
        <section className="p-5 rounded-xl border border-slate-200 bg-slate-50/80 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm sm:text-base">
              <span className="w-1 h-4 bg-blue-600 rounded-full inline-block"></span>
              <Key className="w-4 h-4 text-blue-600" />
              <h4>۷. عبارت کلیدی پیشنهادی (حداکثر ۳ کلمه، بدون سال، چندساله)</h4>
            </div>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold border border-blue-200">
              {topic.keywordDetails.wordCount} کلمه
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">کلمه کلیدی کانونی (Focus Keyword):</span>
            <code className="text-sm sm:text-base font-bold px-3 py-1 bg-white border border-slate-300 rounded-md text-blue-700 font-mono shadow-xs">
              {topic.keywordDetails.keyword}
            </code>
          </div>

          {/* Sample Snippet */}
          <div className="mt-3 bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-1.5">
            <div className="text-[11px] text-slate-400 font-mono">پیش‌نمایش نتایج گوگل (SERP Snippet Preview):</div>
            <div className="text-xs text-emerald-700 font-mono dir-ltr text-right">
              https://rahekonkur.ir/blog/{topic.targetKeyword.replace(/\s+/g, '-')}
            </div>
            <div className="text-sm sm:text-base font-bold text-blue-700 hover:underline cursor-pointer">
              {topic.keywordDetails.sampleMetaTitle}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {topic.keywordDetails.sampleMetaDescription}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
