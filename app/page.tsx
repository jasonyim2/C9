'use client';

import { useState, useEffect, useCallback } from 'react';
import type { News } from '@/lib/types';
import NewsCard from '@/components/NewsCard';
import SkeletonCard from '@/components/SkeletonCard';
import EmptyState from '@/components/EmptyState';
import NewsDetailModal from '@/components/NewsDetailModal';
import { toast } from 'sonner';
import { Newspaper, Star, RefreshCw, Sun, Moon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

type Tab = 'all' | 'favorites';
type DateFilter = '24hours' | '3days' | '7days';

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: '24hours', label: '24시간' },
  { value: '3days', label: '3일' },
  { value: '7days', label: '7일' },
];

const COUNT_OPTIONS = [
  { value: '10', label: '10개' },
  { value: '20', label: '20개' },
  { value: '50', label: '50개' },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="테마 변경"
      className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}

export default function HomePage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('24hours');
  const [countFilter, setCountFilter] = useState('10');
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sheet');
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      
      let allNews: News[] = result.data || [];

      // Sort by news_date desc, created_at desc
      allNews.sort((a, b) => {
        if (a.news_date !== b.news_date) return b.news_date.localeCompare(a.news_date);
        return b.created_at.localeCompare(a.created_at);
      });

      if (activeTab === 'favorites') {
        allNews = allNews.filter((n) => n.is_favorite);
      }

      // Apply date filter
      const now = new Date();
      allNews = allNews.filter((n) => {
        const d = new Date(n.news_date + 'T00:00:00'); // approximated date
        const diffTime = Math.abs(now.getTime() - d.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (dateFilter === '24hours') return diffDays <= 1;
        if (dateFilter === '3days') return diffDays <= 3;
        if (dateFilter === '7days') return diffDays <= 7;
        return true;
      });

      // Apply count filter
      allNews = allNews.slice(0, parseInt(countFilter));
      setNews(allNews);
    } catch (err) {
      console.error(err);
      toast.error('뉴스를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, dateFilter, countFilter]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleCollect = async () => {
    if (collecting) return;
    setCollecting(true);
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateFilter, countFilter })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      
      const newItems = result.data as News[];
      if (newItems.length > 0) {
        const sheetRes = await fetch('/api/sheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItems)
        });
        const sheetResult = await sheetRes.json();
        if (!sheetResult.success) throw new Error(sheetResult.error);
      }
      
      toast.success(`${newItems.length}개의 뉴스를 수집했습니다.`);
      fetchNews();
    } catch (err) {
      console.error(err);
      toast.error('뉴스 수집에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setCollecting(false);
    }
  };

  const handleToggleFavorite = async (id: string, current: boolean) => {
    setNews((prev) => prev.map((n) => (n.id === id ? { ...n, is_favorite: !current } : n)));
    setSelectedNews((prev) => (prev?.id === id ? { ...prev, is_favorite: !current } : prev));

    try {
      const res = await fetch('/api/sheet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_favorite: !current })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
    } catch (err) {
      setNews((prev) => prev.map((n) => (n.id === id ? { ...n, is_favorite: current } : n)));
      setSelectedNews((prev) => (prev?.id === id ? { ...prev, is_favorite: current } : prev));
      toast.error('즐겨찾기 업데이트에 실패했습니다.');
    }
  };

  const showEmpty = !loading && news.length === 0;
  const skeletonCount = collecting ? 3 : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-xl bg-slate-900 dark:bg-slate-100 flex items-center justify-center">
              <Newspaper className="w-3.5 h-3.5 text-white dark:text-slate-900" />
            </div>
            <span className="text-[15px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Antigravity
            </span>
          </div>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {(['all', 'favorites'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                {tab === 'favorites' && <Star className="w-3.5 h-3.5" />}
                {tab === 'all' ? '전체 뉴스' : '즐겨찾기'}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleCollect}
              disabled={collecting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[13px] font-semibold hover:bg-slate-700 dark:hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 shadow-sm min-h-[36px]"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', collecting && 'animate-spin')} />
              <span className="hidden sm:inline">{collecting ? '수집 중...' : '오늘 뉴스 수집'}</span>
              <span className="sm:hidden">{collecting ? '...' : '수집'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-28 md:pb-12 pt-6">
        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {/* Date filter */}
          <div className="relative shrink-0">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[14px] text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-slate-100/20 min-h-[38px]"
            >
              {DATE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Count filter */}
          <div className="relative shrink-0">
            <select
              value={countFilter}
              onChange={(e) => setCountFilter(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[14px] text-slate-700 dark:text-slate-300 font-medium cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-slate-100/20 min-h-[38px]"
            >
              {COUNT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* Result count badge */}
          {!loading && news.length > 0 && (
            <span className="shrink-0 text-[12px] text-slate-400 dark:text-slate-500 ml-1">
              {news.length}개의 뉴스
            </span>
          )}
        </div>

        {/* News grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : showEmpty ? (
          <EmptyState
            isFavorites={activeTab === 'favorites'}
            onCollect={activeTab === 'all' ? handleCollect : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Skeleton placeholders at top during collection */}
            {collecting && [...Array(skeletonCount)].map((_, i) => (
              <SkeletonCard key={`sk-${i}`} />
            ))}
            {news.map((item) => (
              <NewsCard
                key={item.id}
                news={item}
                onClick={() => setSelectedNews(item)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── Mobile bottom pill nav ── */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700/60 px-2 py-2">
          {([
            { tab: 'all' as Tab, label: '전체 뉴스', icon: Newspaper },
            { tab: 'favorites' as Tab, label: '즐겨찾기', icon: Star },
          ] as const).map(({ tab, label, icon: Icon }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150',
                activeTab === tab
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Detail Modal ── */}
      {selectedNews && (
        <NewsDetailModal
          news={selectedNews}
          onClose={() => setSelectedNews(null)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
    </div>
  );
}
