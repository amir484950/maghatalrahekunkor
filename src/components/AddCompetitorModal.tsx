import React, { useState, useEffect } from 'react';
import { CompetitorPage, TopicStrategy } from '../types';
import { X, Plus, Globe, Sparkles, ExternalLink, AlertCircle, Check } from 'lucide-react';

interface AddCompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: TopicStrategy;
  onSave: (competitor: CompetitorPage, addToGap: boolean) => void;
  initialCompetitor?: CompetitorPage | null;
  editIndex?: number | null;
}

const COMMON_COMPETITORS = [
  { domain: 'kanoon.ir', name: 'قلم‌چی (کانون)' },
  { domain: 'biomaze.ir', name: 'گروه آموزشی ماز' },
  { domain: 'heyvagroup.com', name: 'هیوا' },
  { domain: 'gozine2.ir', name: 'گزینه دو' },
  { domain: 'gaj.ir', name: 'گاج مارکت' },
  { domain: 'alavi.ir', name: 'آموزشگاه علوی' },
  { domain: 'classino.com', name: 'کلاسینو' },
  { domain: 'maktabestan.ir', name: 'مکتبستان' },
];

export const AddCompetitorModal: React.FC<AddCompetitorModalProps> = ({
  isOpen,
  onClose,
  topic,
  onSave,
  initialCompetitor,
  editIndex,
}) => {
  const [url, setUrl] = useState('');
  const [domain, setDomain] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [weaknessNotes, setWeaknessNotes] = useState('');
  const [addToGap, setAddToGap] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialCompetitor) {
      setUrl(initialCompetitor.url || '');
      setDomain(initialCompetitor.domain || '');
      setTitle(initialCompetitor.title || '');
      setSummary(initialCompetitor.summary || '');
      setWeaknessNotes(initialCompetitor.weaknessNotes || '');
      setAddToGap(false);
    } else {
      setUrl('');
      setDomain('');
      setTitle('');
      setSummary('');
      setWeaknessNotes('');
      setAddToGap(true);
    }
    setError(null);
  }, [initialCompetitor, isOpen]);

  if (!isOpen) return null;

  const extractDomain = (rawUrl: string): string => {
    try {
      let clean = rawUrl.trim();
      if (!clean) return '';
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = 'https://' + clean;
      }
      const hostname = new URL(clean).hostname;
      return hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    const detected = extractDomain(val);
    if (detected && (!domain || COMMON_COMPETITORS.some(c => c.domain === domain))) {
      setDomain(detected);
    }
  };

  const handleQuickDomain = (d: string) => {
    setDomain(d);
    if (!url) {
      setUrl(`https://www.${d}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      setError('لطفاً دامنه یا نام سایت رقیب را وارد کنید.');
      return;
    }
    if (!title.trim()) {
      setError('لطفاً عنوان مقاله یا صفحه رقیب را وارد کنید.');
      return;
    }
    if (!summary.trim()) {
      setError('لطفاً خلاصه یا تحلیل محتوای رقیب را بنویسید.');
      return;
    }

    let finalUrl = url.trim();
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    if (!finalUrl) {
      finalUrl = `https://${domain.trim()}`;
    }

    const competitor: CompetitorPage = {
      domain: domain.trim(),
      title: title.trim(),
      summary: summary.trim(),
      url: finalUrl,
      isCustom: true,
      addedAt: initialCompetitor?.addedAt || new Date().toISOString(),
      weaknessNotes: weaknessNotes.trim() || undefined,
    };

    onSave(competitor, addToGap && Boolean(weaknessNotes.trim()));
    onClose();
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {initialCompetitor ? 'ویرایش صفحه رقیب' : 'افزودن دستی صفحه رقیب جدید'}
              </h3>
              <p className="text-xs text-slate-300">
                مربوط به موضوع: <span className="font-semibold text-blue-300">{topic.title}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* URL Input */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              آدرس اینترنتی صفحه رقیب (URL):
            </label>
            <input
              type="text"
              dir="ltr"
              placeholder="https://kanoon.ir/Article/12345"
              value={url}
              onChange={handleUrlChange}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono bg-slate-50/50"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              با وارد کردن آدرس، نام دامنه به صورت خودکار استخراج می‌شود.
            </span>
          </div>

          {/* Quick Domain Presets */}
          <div>
            <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
              انتخاب سریع دامنه‌های معروف کنکور:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_COMPETITORS.map((c) => (
                <button
                  key={c.domain}
                  type="button"
                  onClick={() => handleQuickDomain(c.domain)}
                  className={`px-2 py-1 rounded text-[11px] border transition ${
                    domain === c.domain
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Domain & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                دامنه یا برند سایت رقیب: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                dir="ltr"
                placeholder="kanoon.ir"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                عنوان مقاله یا صفحه: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="مثال: روش اصولی تحلیل آزمون"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Content Summary */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              تحلیل و خلاصه محتوای صفحه رقیب: <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="این رقیب چه مواردی را مطرح کرده؟ رویکرد مقاله چیست؟ آیا تبلیغاتی است یا محتوایی؟"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 leading-relaxed"
            />
          </div>

          {/* Weakness & Content Gap */}
          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>نقطه ضعف یا المان مفقود این رقیب (برگ برنده راه کنکور):</span>
            </div>
            <textarea
              rows={2}
              placeholder="مثال: عدم ارائه جدول استاندارد خطایابی، بی‌پاسخ گذاشتن داوطلبانی که به تراز دلخواه نرسیده‌اند..."
              value={weaknessNotes}
              onChange={(e) => setWeaknessNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-amber-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 leading-relaxed"
            />

            {weaknessNotes.trim() && (
              <label className="flex items-center gap-2 pt-1 text-xs text-amber-950 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={addToGap}
                  onChange={(e) => setAddToGap(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-amber-300"
                />
                <span>این نقطه ضعف مستقیماً به لیست شکاف‌های محتوایی (بخش ۳) اضافه شود.</span>
              </label>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialCompetitor ? 'ذخیره تغییرات' : 'افزودن به تحلیل رقبا'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddCompetitorModal;
