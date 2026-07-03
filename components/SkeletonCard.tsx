export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-5 flex flex-col gap-3.5 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="skeleton-shimmer h-5 w-14 rounded-full" />
          <div className="skeleton-shimmer h-4 w-12 rounded" />
        </div>
        <div className="skeleton-shimmer h-4 w-20 rounded" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="skeleton-shimmer h-[15px] w-full rounded" />
        <div className="skeleton-shimmer h-[15px] w-4/5 rounded" />
      </div>

      {/* Summary lines */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="skeleton-shimmer shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full" />
            <div className={`skeleton-shimmer h-[13px] rounded ${i === 3 ? 'w-3/5' : 'w-full'}`} />
          </div>
        ))}
      </div>

      {/* Impact callout */}
      <div className="skeleton-shimmer h-10 w-full rounded-xl" />

      {/* Footer */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="skeleton-shimmer h-4 w-16 rounded" />
        <div className="skeleton-shimmer h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}
