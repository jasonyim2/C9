'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { News } from '@/lib/types';
import { ArrowLeft, Star, ExternalLink, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [popping, setPopping] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    // Fetch from API instead of localStorage
    fetch('/api/sheet')
      .then(res => res.json())
      .then(result => {
        if (!result.success) throw new Error(result.error);
        const allNews: News[] = result.data || [];
        const item = allNews.find((n) => n.id === id);
        if (item) {
          setNews(item);
        } else {
          toast.error('뉴스를 찾을 수 없습니다.');
          router.replace('/');
        }
      })
      .catch(e => {
        console.error(e);
        toast.error('뉴스를 불러오지 못했습니다.');
        router.replace('/');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, router]);

  const handleToggleFavorite = async () => {
    if (!news || popping) return;
    setPopping(true);
    setTimeout(() => setPopping(false), 350);
    const next = !news.is_favorite;
    setNews({ ...news, is_favorite: next });
    
    try {
      const res = await fetch('/api/sheet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: news.id, is_favorite: next })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
    } catch (e) {
      setNews({ ...news, is_favorite: !next });
      toast.error('즐겨찾기 업데이트에 실패했습니다.');
    }
  };

  const summaryLines = news && Array.isArray(news.summary_3line) ? news.summary_3line : [];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-[15px] font-semibold text-slate-700 dark:text-slate-300 truncate">
            뉴스 상세
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-12">
        {loading ? (
          <div className="space-y-4">
            <div className="skeleton-shimmer h-5 w-20 rounded-full" />
            <div className="skeleton-shimmer h-7 w-full rounded-xl" />
            <div className="skeleton-shimmer h-7 w-4/5 rounded-xl" />
            <div className="skeleton-shimmer h-40 w-full rounded-2xl" />
            <div className="skeleton-shimmer h-16 w-full rounded-2xl" />
          </div>
        ) : news ? (
          <div className="space-y-5">
            {/* Meta */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                'text-[11px] font-semibold tracking-wide px-2.5 py-0.5 rounded-full border',
                getCategoryStyle(news.category)
              )}>
                {news.category}
              </span>
              <span className="text-[13px] text-slate-500 dark:text-slate-400">
                {formatDate(news.news_date)}
              </span>
              {news.source && (
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {news.source}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold leading-snug text-slate-900 dark:text-slate-100">
              {news.title}
            </h1>

            {/* Summary section */}
            {summaryLines.length > 0 && (
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/50 p-5 space-y-3 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  핵심 요약
                </p>
                {summaryLines.map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-[15px] leading-[1.65] text-slate-700 dark:text-slate-300">{line}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Impact callout */}
            {news.impact_1line && (
              <div className="flex items-start gap-3 px-4 py-4 rounded-2xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
                <TrendingUp className="shrink-0 mt-0.5 w-4 h-4 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-1">
                    투자 영향도
                  </p>
                  <p className="text-[14px] font-medium leading-relaxed text-amber-800 dark:text-amber-300">
                    {news.impact_1line}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              {news.url && (
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-[14px] font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  원문 기사 보기
                </a>
              )}
              <button
                onClick={handleToggleFavorite}
                aria-label={news.is_favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                className={cn(
                  'flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl border text-[14px] font-medium transition-all duration-150',
                  popping && 'animate-fav-pop',
                  news.is_favorite
                    ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 dark:hover:bg-amber-950/20 dark:hover:border-amber-800'
                )}
              >
                <Star className={cn('w-4 h-4', news.is_favorite && 'fill-amber-400 text-amber-400')} />
                {news.is_favorite ? '즐겨찾기됨' : '즐겨찾기'}
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
