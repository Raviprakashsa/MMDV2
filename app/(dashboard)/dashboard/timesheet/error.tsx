'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorProps {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

export default function RouteError({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    console.error('Route error:', error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
        <div className="p-4 bg-rose-500/10 rounded-full w-fit mx-auto mb-4">
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Operation Failed</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          An error occurred while loading this section. This might be due to a network interruption or temporary service issue.
        </p>
        
        {error.digest && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6 font-mono bg-slate-50 dark:bg-slate-950 py-1 rounded">
            Digest: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium text-sm flex-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-sm flex-1 shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    </div>
  )
}
