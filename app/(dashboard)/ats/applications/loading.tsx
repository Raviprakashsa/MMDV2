import { SkeletonCard } from '@/components/ui/Skeleton'

export default function ApplicationsLoading() {
  const columns = ['Applied', 'Screening', 'Interviewing', 'Offer']
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2 animate-pulse">
          <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-64 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
        <div className="w-32 h-10 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      </div>

      {/* Kanban Columns Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
        {columns.map((col, index) => (
          <div key={`column-skeleton-${col}`} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between animate-pulse">
              <div className="w-24 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
            
            {/* Render different number of cards in columns for staggered realistic look */}
            {Array.from({ length: 3 - (index % 2) }).map((_, idx) => (
              <SkeletonCard key={`column-${col}-card-${idx}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
