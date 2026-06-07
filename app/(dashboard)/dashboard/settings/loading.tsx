export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2 animate-pulse">
          <div className="w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="w-64 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>

      {/* Form Settings Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-8 max-w-3xl animate-pulse">
        {/* Section 1 */}
        <div className="space-y-4">
          <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-full h-11 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="w-full h-11 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="space-y-4">
          <div className="w-40 h-6 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="space-y-2">
            <div className="w-28 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-full h-24 bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
          <div className="w-24 h-11 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="w-32 h-11 bg-slate-300 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
