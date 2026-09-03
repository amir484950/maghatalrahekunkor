import React from 'react';
import { TopicStrategy, Verdict, Difficulty } from '../types';
import { ArrowLeft, CheckCircle2, RotateCw, XCircle } from 'lucide-react';

interface StrategyTableProps {
  topics: TopicStrategy[];
  selectedTopicId: string;
  onSelectTopic: (id: string) => void;
  filterVerdict: string;
  setFilterVerdict: (v: string) => void;
}

export const StrategyTable: React.FC<StrategyTableProps> = ({
  topics,
  selectedTopicId,
  onSelectTopic,
  filterVerdict,
  setFilterVerdict,
}) => {
  const filteredTopics = topics.filter(t => {
    if (filterVerdict === 'ALL') return true;
    return t.verdict === filterVerdict;
  });

  const getVerdictBadge = (verdict: Verdict) => {
    switch (verdict) {
      case 'بنویس':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            بنویس
          </span>
        );
      case 'بنویس ولی زاویه را عوض کن':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <RotateCw className="w-3.5 h-3.5 text-amber-600" />
            تغییر زاویه
          </span>
        );
      case 'ننویس':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            ننویس
          </span>
        );
    }
  };

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'آسان':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">آسان</span>;
      case 'متوسط':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">متوسط</span>;
      case 'سخت':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-800 border border-red-200">سخت</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-8">
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full inline-block"></span>
            جدول اولویت‌بندی استراتژیک محتوا (فصل پاییز)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 mr-3">
            خلاصه احکام، کلمات کلیدی پیشنهادی و زمان‌بندی انتشار بر مبنای اصل دو ماه جلوتر
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setFilterVerdict('ALL')}
            className={`px-3 py-1.5 rounded transition-all ${
              filterVerdict === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            همه ({topics.length})
          </button>
          <button
            onClick={() => setFilterVerdict('بنویس')}
            className={`px-3 py-1.5 rounded transition-all ${
              filterVerdict === 'بنویس'
                ? 'bg-white text-blue-700 shadow-xs font-bold border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            بنویس ({topics.filter(t => t.verdict === 'بنویس').length})
          </button>
          <button
            onClick={() => setFilterVerdict('بنویس ولی زاویه را عوض کن')}
            className={`px-3 py-1.5 rounded transition-all ${
              filterVerdict === 'بنویس ولی زاویه را عوض کن'
                ? 'bg-white text-amber-800 shadow-xs font-bold border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تغییر زاویه ({topics.filter(t => t.verdict === 'بنویس ولی زاویه را عوض کن').length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-semibold tracking-wider">
              <th className="py-3 px-4">موضوع</th>
              <th className="py-3 px-4">عبارت کلیدی</th>
              <th className="py-3 px-4 text-center">سختی</th>
              <th className="py-3 px-4 text-center">ماه تولید</th>
              <th className="py-3 px-4 text-center">حکم</th>
              <th className="py-3 px-4">دلیل یک‌خطی</th>
              <th className="py-3 px-4 text-center">اقدام</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {filteredTopics.map((topic) => {
              const isSelected = selectedTopicId === topic.id;
              return (
                <tr
                  key={topic.id}
                  onClick={() => onSelectTopic(topic.id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/40 font-medium'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  <td className="py-3.5 px-4 text-slate-900 font-semibold">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-600 ring-2 ring-blue-200' : 'bg-transparent'}`} />
                      {topic.title}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <code className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono text-xs border border-slate-200">
                      {topic.targetKeyword}
                    </code>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {getDifficultyBadge(topic.difficulty)}
                  </td>
                  <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs">
                      {topic.productionMonth}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {getVerdictBadge(topic.verdict)}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs sm:max-w-md leading-relaxed">
                    {topic.oneLineReason}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTopic(topic.id);
                      }}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border transition-colors font-medium ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>تحلیل</span>
                      <ArrowLeft className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
