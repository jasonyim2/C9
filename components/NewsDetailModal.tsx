'use client';

import { X, Star, ExternalLink, TrendingUp, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { News } from '@/lib/types';
import { useState, useEffect } from 'react';

const CATEGORY_STYLES: Record<string, string> = {
  '주식': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  '채권': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  '원자재': 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  '테마': 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
  'ETF': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

function getCategoryStyle(cat: string) {
  return CATEGORY_STYLES[cat] ?? CATEGORY_STYLES['ETF'];
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  } catch {
    return dateStr;
  }
}

interface NewsDetailModalProps {
  news: News;
  onClose: () => void;
  onToggleFavorite: (id: string, current: boolean) => void;
}

export default function NewsDetailModal({ news, onClose, onToggleFavorite }: NewsDetailModalProps) {
  const [visible, setVisible] = useState(false);
  const [popping, setPopping] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleFavorite = () => {
    if (popping) return;
    setPopping(true);
    setTimeout(() => setPopping(false), 350);
    onToggleFavorite(news.id, news.is_favorite);
  };

  const summaryLines = Array.isArray(news.summary_3line) ? news.summary_3line : [];

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-200',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'relative w-full sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden transition-transform duration-200',
          visible ? 'translate-y-0' : 'translate-y-6 sm:translate-y-0'
        )}
        style={{ maxHeight: '90dvh' }}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 sm:pt-5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-full border',
              getCategoryStyle(news.category)
            )}>
              {news.category}
            </span>
            <span className="text-[12px] text-slate-400 dark:text-slate-500">
              {formatDate(news.news_date)}
            </span>
            {news.source && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">· {news.source}</span>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 pb-6 space-y-4" style={{ maxHeight: 'calc(90dvh - 80px)' }}>
          {/* Title */}
          <h2 className="text-lg font-bold leading-snug text-slate-900 dark:text-slate-100">
            {news.title}
          </h2>

          {/* 3-line summary */}
          {summaryLines.length > 0 && (
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                핵심 요약
              </p>
              {summaryLines.map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-px">
                    {i + 1}
                  </span>
                  <p className="text-[14px] leading-[1.6] text-slate-700 dark:text-slate-300">{line}</p>
                </div>
              ))}
            </div>
          )}

          {/* Impact callout */}
          {news.impact_1line && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
              <TrendingUp className="shrink-0 mt-0.5 w-4 h-4 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-1">
                  투자 영향도
                </p>
                <p className="text-[13px] font-medium leading-relaxed text-amber-800 dark:text-amber-300">
                  {news.impact_1line}
                </p>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center gap-3 pt-2">
            {news.url && (
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                원문 기사 보기
              </a>
            )}
            <button
              onClick={handleFavorite}
              aria-label={news.is_favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              className={cn(
                'flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-[13px] font-medium transition-all duration-150 min-w-[100px]',
                popping && 'animate-fav-pop',
                news.is_favorite
                  ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 dark:hover:bg-amber-950/20 dark:hover:border-amber-800 dark:hover:text-amber-400'
              )}
            >
              <Star className={cn('w-4 h-4', news.is_favorite && 'fill-amber-400 text-amber-400')} />
              {news.is_favorite ? '즐겨찾기됨' : '즐겨찾기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
