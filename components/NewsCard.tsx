'use client';

import { useState } from 'react';
import { Star, ExternalLink, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { News } from '@/lib/types';

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

function formatNewsDate(dateStr: string) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  } catch {
    return dateStr;
  }
}

interface NewsCardProps {
  news: News;
  onClick: () => void;
  onToggleFavorite: (id: string, current: boolean) => void;
}

export default function NewsCard({ news, onClick, onToggleFavorite }: NewsCardProps) {
  const [popping, setPopping] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (popping) return;
    setPopping(true);
    setTimeout(() => setPopping(false), 350);
    onToggleFavorite(news.id, news.is_favorite);
  };

  const summaryLines = Array.isArray(news.summary_3line) ? news.summary_3line : [];

  return (
    <article
      onClick={onClick}
      className="news-card group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 cursor-pointer select-none flex flex-col gap-3.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn(
            'text-[11px] font-semibold tracking-wide px-2 py-0.5 rounded-full border',
            getCategoryStyle(news.category)
          )}>
            {news.category}
          </span>
          <span className="text-[12px] text-slate-400 dark:text-slate-500">
            {formatNewsDate(news.news_date)}
          </span>
        </div>
        {news.source && (
          <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[110px]">
            {news.source}
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="text-[15px] font-semibold leading-snug text-slate-900 dark:text-slate-100 line-clamp-2">
        {news.title}
      </h2>

      {/* 3-line summary */}
      {summaryLines.length > 0 && (
        <ul className="space-y-2">
          {summaryLines.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] leading-[1.55] text-slate-600 dark:text-slate-400">
              <span className="shrink-0 mt-[7px] w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Impact callout */}
      {news.impact_1line && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-amber-50 border-l-[3px] border-amber-400 dark:bg-amber-950/30 dark:border-amber-500">
          <TrendingUp className="shrink-0 mt-0.5 w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <p className="text-[12px] font-medium leading-relaxed text-amber-800 dark:text-amber-300">
            {news.impact_1line}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-0.5 mt-auto">
        {news.url ? (
          <a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            원문 보기
          </a>
        ) : (
          <span />
        )}

        <button
          onClick={handleFavorite}
          aria-label={news.is_favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
          className={cn(
            'p-1.5 rounded-full transition-colors duration-150 touch-manipulation',
            popping && 'animate-fav-pop',
            news.is_favorite
              ? 'text-amber-400 hover:text-amber-500'
              : 'text-slate-200 hover:text-amber-400 dark:text-slate-700 dark:hover:text-amber-400'
          )}
        >
          <Star
            className={cn('w-[18px] h-[18px] transition-all duration-150', news.is_favorite && 'fill-amber-400')}
          />
        </button>
      </div>
    </article>
  );
}
