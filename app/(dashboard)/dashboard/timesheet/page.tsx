'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Clock,
  Activity,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Eye,
  Plus,
  Edit,
  Trash,
  LogIn,
  LogOut,
  AlertCircle,
  Zap,
  MousePointer,
  Compass,
} from 'lucide-react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import Button, { IconButton } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { getUserDailySummariesAction, getUserActivityTimelineAction } from '@/lib/actions/productivity'

interface DailyWorkSummary {
  id: string
  tenantId: string
  userId: string
  date: string | Date
  loginHours: number
  activeHours: number
  idleHours: number
  totalActions: number
  productivityScore: number
}

interface ActivityLog {
  id: string
  tenantId: string
  userId: string
  module: string
  entityType: string
  entityId: string | null
  action: string
  metadata: any
  createdAt: string | Date
}

function productivityColor(score: number) {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
  if (score >= 50) return 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50'
  return 'text-rose-600 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
}

function getActionIcon(action: string, entityType: string) {
  const act = action.toUpperCase()
  if (act.includes('LOGIN')) return <LogIn className="w-4 h-4 text-blue-500" />
  if (act.includes('LOGOUT')) return <LogOut className="w-4 h-4 text-orange-500" />
  if (act.includes('CREATE') || act.includes('ADD')) return <Plus className="w-4 h-4 text-emerald-500" />
  if (act.includes('UPDATE') || act.includes('EDIT')) return <Edit className="w-4 h-4 text-amber-500" />
  if (act.includes('DELETE') || act.includes('REMOVE')) return <Trash className="w-4 h-4 text-rose-500" />
  if (act.includes('PAGE_VIEW') || entityType.toLowerCase() === 'page') return <Eye className="w-4 h-4 text-slate-500" />
  return <MousePointer className="w-4 h-4 text-indigo-500" />
}

function getActionColor(action: string) {
  const act = action.toUpperCase()
  if (act.includes('CREATE')) return 'bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
  if (act.includes('UPDATE')) return 'bg-amber-100/70 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
  if (act.includes('DELETE')) return 'bg-rose-100/70 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
  if (act.includes('LOGIN')) return 'bg-blue-100/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

export default function TimesheetPage() {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isTimelineLoading, setIsTimelineLoading] = useState(false)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [summaries, setSummaries] = useState<DailyWorkSummary[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [timelineLogs, setTimelineLogs] = useState<ActivityLog[]>([])

  // Fetch summaries for the selected week
  const fetchWeeklySummaries = async () => {
    setIsLoading(true)
    const startDateStr = format(weekStart, 'yyyy-MM-dd')
    const endDateStr = format(addDays(weekStart, 6), 'yyyy-MM-dd')

    try {
      const result = await getUserDailySummariesAction({
        startDate: startDateStr,
        endDate: endDateStr,
      })

      if (result?.success && result.data) {
        setSummaries(result.data as DailyWorkSummary[])
      } else {
        toast.error('Failed to load summaries', result?.error || 'Unknown error')
      }
    } catch (err: any) {
      toast.error('Error loading summaries', err.message || 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch daily activity timeline
  const fetchTimeline = async (date: Date) => {
    setIsTimelineLoading(true)
    const dateStr = format(date, 'yyyy-MM-dd')
    try {
      const result = await getUserActivityTimelineAction({ date: dateStr })
      if (result?.success && result.data) {
        setTimelineLogs(result.data as ActivityLog[])
      } else {
        toast.error('Failed to load timeline', result?.error || 'Unknown error')
      }
    } catch (err: any) {
      toast.error('Error loading timeline', err.message || 'Unknown error')
    } finally {
      setIsTimelineLoading(false)
    }
  }

  useEffect(() => {
    fetchWeeklySummaries()
  }, [weekStart])

  useEffect(() => {
    if (selectedDate) {
      fetchTimeline(selectedDate)
    }
  }, [selectedDate])

  // Map summaries to Mon-Sun array
  const weekDays = useMemo(() => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const todayStr = format(new Date(), 'yyyy-MM-dd')

    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(weekStart, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const isToday = dateStr === todayStr

      // Find summary matching this date
      const summary = summaries.find((s) => {
        const sDate = typeof s.date === 'string' ? parseISO(s.date) : new Date(s.date)
        return format(sDate, 'yyyy-MM-dd') === dateStr
      })

      return {
        date,
        dateStr,
        dayName: dayNames[i],
        isToday,
        activeHours: summary?.activeHours || 0,
        idleHours: summary?.idleHours || 0,
        totalActions: summary?.totalActions || 0,
        productivityScore: summary?.productivityScore || 0,
        hasData: !!summary,
      }
    })
  }, [weekStart, summaries])

  // Compute stats for the current week
  const weekStats = useMemo(() => {
    let totalActive = 0
    let totalIdle = 0
    let totalActions = 0
    let scoreSum = 0
    let activeDaysCount = 0

    weekDays.forEach((day) => {
      totalActive += day.activeHours
      totalIdle += day.idleHours
      totalActions += day.totalActions
      if (day.activeHours > 0) {
        scoreSum += day.productivityScore
        activeDaysCount++
      }
    })

    const avgScore = activeDaysCount > 0 ? Math.round(scoreSum / activeDaysCount) : 0

    return {
      totalActive,
      totalIdle,
      totalActions,
      avgScore,
    }
  }, [weekDays])

  const goToPreviousWeek = () => setWeekStart(subWeeks(weekStart, 1))
  const goToNextWeek = () => setWeekStart(addWeeks(weekStart, 1))
  const goToCurrentWeek = () => {
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
    setSelectedDate(new Date())
  }

  const selectedDayData = useMemo(() => {
    const selStr = format(selectedDate, 'yyyy-MM-dd')
    return weekDays.find((d) => d.dateStr === selStr)
  }, [weekDays, selectedDate])

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 via-brand-600 to-brand-800 text-white shadow-lg shadow-indigo-500/20">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Work Intelligence Timesheet</h1>
            <p className="text-[var(--foreground-muted)] text-sm">
              Automated, activity-based tracking engine capturing passive active time and platform interactions.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50/60 dark:bg-slate-900 border border-indigo-100/50 dark:border-slate-800 px-4 py-2 rounded-xl text-xs text-indigo-700 dark:text-indigo-300">
          <Zap className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>No manual entry required. System logs activity and compiles stats.</span>
        </div>
      </div>

      {/* Week Metrics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-stat bg-white dark:bg-slate-900 border border-[var(--border)] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Active Hours This Week</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[var(--foreground)] tabular-nums">
              {weekStats.totalActive.toFixed(1)}h
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">logged</span>
          </div>
        </div>
        <div className="card-stat bg-white dark:bg-slate-900 border border-[var(--border)] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Total Idle Time</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-500 tabular-nums">
              {weekStats.totalIdle.toFixed(1)}h
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">detected</span>
          </div>
        </div>
        <div className="card-stat bg-white dark:bg-slate-900 border border-[var(--border)] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Weekly Productivity Score</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={cn("text-3xl font-extrabold tabular-nums", 
              weekStats.avgScore >= 80 ? "text-emerald-600" : weekStats.avgScore >= 50 ? "text-amber-600" : "text-rose-600"
            )}>
              {weekStats.avgScore}%
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">efficiency</span>
          </div>
        </div>
        <div className="card-stat bg-white dark:bg-slate-900 border border-[var(--border)] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Captured Actions</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {weekStats.totalActions}
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">mutations & views</span>
          </div>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl border border-[var(--border)] p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <IconButton aria-label="Previous week" variant="secondary" onClick={goToPreviousWeek}>
            <ChevronLeft className="w-5 h-5" />
          </IconButton>
          <IconButton aria-label="Next week" variant="secondary" onClick={goToNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </IconButton>
          <Button variant="ghost" size="sm" onClick={goToCurrentWeek}>
            Today
          </Button>
        </div>
        <div className="text-center">
          <p className="font-semibold text-sm md:text-base text-[var(--foreground)]">
            {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
          </p>
          <p className="text-xs text-[var(--foreground-muted)]">Week {format(weekStart, 'w')}</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 px-3 py-1.5 rounded-lg font-medium border border-indigo-100/50 dark:border-indigo-900/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Auto-Timesheet
          </span>
        </div>
      </div>

      {/* Calendar Week Days View */}
      <div className="card-premium bg-white dark:bg-slate-900 border border-[var(--border)] p-5 rounded-2xl shadow-sm">
        {isLoading ? (
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={`skel-${i}`} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map((day, i) => {
              const isSelected = format(selectedDate, 'yyyy-MM-dd') === day.dateStr
              const isWeekend = i >= 5
              const hasData = day.hasData

              return (
                <button
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.date)}
                  className={cn(
                    'relative p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between h-32',
                    isSelected 
                      ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-400 ring-1 ring-indigo-500' 
                      : 'bg-white dark:bg-slate-900 border-[var(--border)] hover:border-slate-300 dark:hover:border-slate-700',
                    isWeekend && 'opacity-70',
                    day.isToday && !isSelected && 'ring-1 ring-brand-500/30 border-brand-500/30'
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-[var(--foreground-muted)] uppercase">{day.dayName}</span>
                    {day.isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500" title="Today" />
                    )}
                  </div>
                  <div className="mt-1">
                    <span className="text-xl font-bold tracking-tight block text-[var(--foreground)]">{format(day.date, 'd')}</span>
                  </div>
                  <div className="w-full mt-2 space-y-1">
                    {hasData ? (
                      <>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--foreground-muted)] font-medium">Active:</span>
                          <span className="font-bold tabular-nums text-[var(--foreground)]">{day.activeHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-[var(--foreground-subtle)]">
                          <span>Idle:</span>
                          <span className="tabular-nums">{day.idleHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[9px] uppercase tracking-wider text-[var(--foreground-muted)]">Score:</span>
                          <span className={cn("text-[10px] font-bold px-1 rounded", 
                            day.productivityScore >= 80 ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30" : 
                            day.productivityScore >= 50 ? "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/30" : 
                            "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30"
                          )}>
                            {day.productivityScore}%
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[10px] text-[var(--foreground-subtle)] italic pt-4">
                        No activity
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Selected Day Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Summary Card for Selected Day */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-lg text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Day Audit Summary
            </h3>
            
            {selectedDayData?.hasData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-[var(--foreground-muted)]">Active Hours</span>
                  </div>
                  <span className="font-bold text-[var(--foreground)] tabular-nums">{selectedDayData.activeHours.toFixed(2)} hrs</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <Monitor className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-[var(--foreground-muted)]">Idle Interval Hours</span>
                  </div>
                  <span className="font-bold text-[var(--foreground)] tabular-nums">{selectedDayData.idleHours.toFixed(2)} hrs</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-medium text-[var(--foreground-muted)]">Productivity Score</span>
                  </div>
                  <span className={cn("font-bold px-2 py-0.5 rounded-md text-sm border", productivityColor(selectedDayData.productivityScore))}>
                    {selectedDayData.productivityScore}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-[var(--foreground-muted)]">Total User Actions</span>
                  </div>
                  <span className="font-bold text-[var(--foreground)] tabular-nums">{selectedDayData.totalActions} events</span>
                </div>

                <div className="text-[11px] text-[var(--foreground-subtle)] leading-relaxed bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  Productivity score is computed dynamically based on the ratio of active intervals (clicks, page navigations, scroll and keyboard inputs) against idle intervals where the window remains inactive.
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--foreground-muted)] text-sm">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-35" />
                No summaries found for {format(selectedDate, 'MMM d, yyyy')}.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Timeline of Events */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-lg text-[var(--foreground)]">Activity Log Timeline</h3>
                <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                  Chronological event trail for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-[var(--foreground-muted)] font-medium">
                {timelineLogs.length} events logged
              </span>
            </div>

            {isTimelineLoading ? (
              <div className="space-y-4 py-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`timeline-skel-${i}`} className="flex gap-4 items-start animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-slate-150 dark:bg-slate-800 shrink-0" />
                    <div className="space-y-2 w-full">
                      <div className="h-4 bg-slate-150 dark:bg-slate-800 rounded w-1/4" />
                      <div className="h-3 bg-slate-150 dark:bg-slate-800 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : timelineLogs.length === 0 ? (
              <div className="text-center py-16 text-[var(--foreground-muted)]">
                <Compass className="w-12 h-12 mx-auto mb-3 opacity-25" />
                <p className="text-sm font-medium">No system interactions or page navigation logs recorded.</p>
                <p className="text-xs mt-1">Work activities are automatically captured when user interacts with the app modules.</p>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-indigo-100 dark:border-indigo-950/70 ml-3 py-2 space-y-6">
                {timelineLogs.map((log) => {
                  const logTime = typeof log.createdAt === 'string' ? parseISO(log.createdAt) : new Date(log.createdAt)
                  const timeFormatted = format(logTime, 'hh:mm:ss a')
                  
                  return (
                    <div key={log.id} className="relative group">
                      {/* Timeline dot */}
                      <span className="absolute -left-[35px] top-1 bg-white dark:bg-slate-900 border-2 border-indigo-400 dark:border-indigo-600 rounded-full p-1.5 flex items-center justify-center shrink-0 w-8 h-8 shadow-sm">
                        {getActionIcon(log.action, log.entityType)}
                      </span>

                      <div className="space-y-1 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-3 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-100/50 dark:border-indigo-900/30">
                              {log.module}
                            </span>
                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", getActionColor(log.action))}>
                              {log.action}
                            </span>
                          </div>
                          <span className="text-xs text-[var(--foreground-subtle)] font-medium tabular-nums">{timeFormatted}</span>
                        </div>
                        
                        <p className="text-sm text-[var(--foreground)] font-medium pt-1">
                          {log.entityType}: <span className="font-semibold text-slate-700 dark:text-slate-200">{log.entityId || 'Platform'}</span>
                        </p>

                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="text-xs text-[var(--foreground-muted)] bg-white dark:bg-slate-850 p-2 rounded-lg border border-slate-100 dark:border-slate-800/50 mt-2 font-mono break-all max-h-24 overflow-y-auto">
                            {typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata, null, 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
