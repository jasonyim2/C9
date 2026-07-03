import { Newspaper } from 'lucide-react';

interface EmptyStateProps {
  isFavorites?: boolean;
  onCollect?: () => void;
}

export default function EmptyState({ isFavorites, onCollect }: EmptyStateProps) {
  if (isFavorites) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
        <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/30">
          <svg className="w-10 h-10 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
          아직 즐겨찾기가 없어요
        </h3>
        <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
          관심 있는 뉴스의 별 아이콘을 눌러<br />즐겨찾기에 추가해 보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Newspaper className="w-12 h-12 text-slate-300 dark:text-slate-600" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
          <span className="text-white text-xs font-bold">AI</span>
        </div>
        {/* decorative dots */}
        <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-amber-300 dark:bg-amber-600 opacity-60" />
        <div className="absolute top-2 -left-4 w-2.5 h-2.5 rounded-full bg-emerald-300 dark:bg-emerald-600 opacity-60" />
      </div>

      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
        오늘의 뉴스를 수집해 보세요!
      </h3>
      <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-8">
        AI가 오늘의 주요 ETF 뉴스를 요약해<br />핵심 인사이트만 전달해 드립니다.
      </p>

      {onCollect && (
        <button
          onClick={onCollect}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[14px] font-semibold hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors shadow-sm"
        >
          <Newspaper className="w-4 h-4" />
          오늘 뉴스 수집하기
        </button>
      )}
    </div>
  );
}
