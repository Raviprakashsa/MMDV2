import { SkeletonTable } from '@/components/ui/Skeleton'

export default function AtsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2 animate-pulse">
          <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-48 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
      <SkeletonTable rows={6} />
    </div>
  )
}
