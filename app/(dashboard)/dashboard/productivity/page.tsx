'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Clock,
  TrendingUp,
  User,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
  Eye,
  Plus,
  Edit,
  Trash,
  LogIn,
  LogOut,
  Calendar,
  MousePointer,
  ArrowRight,
  TrendingDown,
  Trophy,
  Filter,
} from 'lucide-react'
import { format, subDays, startOfWeek, addDays, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import Button, { IconButton } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import {
  getLeaderboardsAction,
  getTenantDailySummariesAction,
  getUserActivityTimelineAction,
} from '@/lib/actions/productivity'

interface LeaderboardUser {
  userId: string
  name: string
  email: string
  activeHours: number
  idleHours: number
  totalActions: number
  productivityScore: number
}

interface TenantDailySummary {
  id: string
  tenantId: string
  userId: string
  date: string | Date
  loginHours: number
  activeHours: number
  idleHours: number
  totalActions: number
  productivityScore: number
  user: {
    name: string
    email: string
  }
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

export default function AdminProductivityPage() {
  const toast = useToast()
  
  // Date states
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [rangeDays, setRangeDays] = useState<number>(7) // 7 or 30 days
  
  // Data states
  const [leaderboard, setLeaderboard] = useState<{ mostActive: LeaderboardUser[]; mostProductive: LeaderboardUser[] }>({
    mostActive: [],
    mostProductive: [],
  })
  const [dailySummaries, setDailySummaries] = useState<TenantDailySummary[]>([])
  
  // Loading states
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true)
  const [isDailySummariesLoading, setIsDailySummariesLoading] = useState(true)
  const [isTimelineLoading, setIsTimelineLoading] = useState(false)
  
  // Drawer states
  const [inspectedUser, setInspectedUser] = useState<{ userId: string; name: string } | null>(null)
  const [timelineLogs, setTimelineLogs] = useState<ActivityLog[]>([])

  // Search filter
  const [searchQuery, setSearchQuery] = useState('')

  // Range Dates
  const rangeDates = useMemo(() => {
    const end = new Date()
    const start = subDays(end, rangeDays - 1)
    return {
      startStr: format(start, 'yyyy-MM-dd'),
      endStr: format(end, 'yyyy-MM-dd'),
    }
  }, [rangeDays])

  // Fetch Team Leaderboard
  const fetchLeaderboard = async () => {
    setIsLeaderboardLoading(true)
    try {
      const result = await getLeaderboardsAction({
        startDate: rangeDates.startStr,
        endDate: rangeDates.endStr,
      })
      if (result?.success && result.data) {
        setLeaderboard(result.data as any as { mostActive: LeaderboardUser[]; mostProductive: LeaderboardUser[] })
      } else {
        toast.error('Failed to load leaderboard', result?.error || 'Unknown error')
      }
    } catch (err: any) {
      toast.error('Error loading leaderboard', err.message || 'Unknown error')
    } finally {
      setIsLeaderboardLoading(false)
    }
  }

  // Fetch Tenant Daily Summaries
  const fetchDailySummaries = async () => {
    setIsDailySummariesLoading(true)
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    try {
      const result = await getTenantDailySummariesAction({ date: dateStr })
      if (result?.success && result.data) {
        setDailySummaries(result.data as TenantDailySummary[])
      } else {
        toast.error('Failed to load summaries', result?.error || 'Unknown error')
      }
    } catch (err: any) {
      toast.error('Error loading summaries', err.message || 'Unknown error')
    } finally {
      setIsDailySummariesLoading(false)
    }
  }

  // Fetch Chronological Timeline for selected employee
  const fetchTimeline = async (userId: string) => {
    setIsTimelineLoading(true)
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    try {
      const result = await getUserActivityTimelineAction({ date: dateStr, userId })
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

  // Trigger loads
  useEffect(() => {
    fetchLeaderboard()
  }, [rangeDays])

  useEffect(() => {
    fetchDailySummaries()
  }, [selectedDate])

  // Handle drawer open
  const handleInspectUser = (userId: string, userName: string) => {
    setInspectedUser({ userId, name: userName })
    setTimelineLogs([])
    fetchTimeline(userId)
  }

  // Filter summaries by search
  const filteredSummaries = useMemo(() => {
    if (!searchQuery.trim()) return dailySummaries
    const query = searchQuery.toLowerCase()
    return dailySummaries.filter(
      (s) =>
        s.user.name.toLowerCase().includes(query) ||
        s.user.email.toLowerCase().includes(query)
    )
  }, [dailySummaries, searchQuery])

  // Aggregate Selected Day stats
  const selectedDayStats = useMemo(() => {
    let totalActive = 0
    let totalIdle = 0
    let totalActions = 0
    let scoreSum = 0
    const activeUsers = dailySummaries.filter((s) => s.activeHours > 0).length

    dailySummaries.forEach((s) => {
      totalActive += s.activeHours
      totalIdle += s.idleHours
      totalActions += s.totalActions
      scoreSum += s.productivityScore
    })

    const avgScore = dailySummaries.length > 0 ? Math.round(scoreSum / dailySummaries.length) : 0

    return {
      totalActive,
      totalIdle,
      totalActions,
      avgScore,
      activeUsers,
    }
  }, [dailySummaries])

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 via-brand-600 to-indigo-800 text-white shadow-lg shadow-indigo-600/20">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Productivity Analytics Dashboard</h1>
            <p className="text-[var(--foreground-muted)] text-sm">
              Team activity tracking, automated timesheet compilation, and session work audits.
            </p>
          </div>
        </div>
      </div>

      {/* Selected Day Team KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Active Employees</p>
          <p className="text-2xl font-extrabold text-[var(--foreground)] mt-1.5 tabular-nums">
            {isDailySummariesLoading ? '...' : selectedDayStats.activeUsers}
            <span className="text-xs font-normal text-[var(--foreground-muted)] ml-1">/ {dailySummaries.length}</span>
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Team Active Time</p>
          <p className="text-2xl font-extrabold text-[var(--foreground)] mt-1.5 tabular-nums">
            {isDailySummariesLoading ? '...' : `${selectedDayStats.totalActive.toFixed(1)}h`}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Team Idle Time</p>
          <p className="text-2xl font-extrabold text-amber-500 mt-1.5 tabular-nums">
            {isDailySummariesLoading ? '...' : `${selectedDayStats.totalIdle.toFixed(1)}h`}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider">Avg Productivity</p>
          <p className={cn("text-2xl font-extrabold mt-1.5 tabular-nums", 
            selectedDayStats.avgScore >= 80 ? "text-emerald-600" : selectedDayStats.avgScore >= 50 ? "text-amber-600" : "text-rose-600"
          )}>
            {isDailySummariesLoading ? '...' : `${selectedDayStats.avgScore}%`}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-[var(--border)] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-[var(--foreground-muted)] uppercase tracking-wider font-medium">Total Actions</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1.5 tabular-nums">
            {isDailySummariesLoading ? '...' : selectedDayStats.totalActions}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (2/3 width): Team Activity Log on Selected Date */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
            {/* Header controls */}
            <div className="p-5 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <IconButton
                  aria-label="Previous day"
                  variant="secondary"
                  onClick={() => setSelectedDate((d) => subDays(d, 1))}
                >
                  <ChevronLeft className="w-5 h-5" />
                </IconButton>
                <IconButton
                  aria-label="Next day"
                  variant="secondary"
                  onClick={() => setSelectedDate((d) => addDays(d, 1))}
                  disabled={format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
                >
                  <ChevronRight className="w-5 h-5" />
                </IconButton>
                <span className="font-bold text-sm md:text-base ml-2">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--foreground-muted)]" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-modern pl-9 py-1.5 text-xs w-full"
                />
              </div>
            </div>

            {/* Daily stats table */}
            <div className="overflow-x-auto">
              {isDailySummariesLoading ? (
                <div className="p-8 space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`daily-skel-${i}`} className="h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : filteredSummaries.length === 0 ? (
                <div className="p-12 text-center text-[var(--foreground-muted)] text-sm">
                  No automated timesheet records found for this date.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-slate-50/30 dark:bg-slate-900/30 text-xs font-bold text-[var(--foreground-muted)] uppercase tracking-wider">
                      <th className="p-4 pl-6">Employee</th>
                      <th className="p-4">Active / Idle Hours</th>
                      <th className="p-4">Productivity</th>
                      <th className="p-4 text-center">Actions</th>
                      <th className="p-4 pr-6 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSummaries.map((summary) => {
                      const totalHours = summary.activeHours + summary.idleHours
                      const activePercentage = totalHours > 0 ? (summary.activeHours / totalHours) * 100 : 0
                      
                      return (
                        <tr key={summary.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-sm">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-100/50 dark:border-indigo-900/30">
                                {summary.user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-[var(--foreground)]">{summary.user.name}</p>
                                <p className="text-xs text-[var(--foreground-muted)]">{summary.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-medium text-[var(--foreground)]">
                                <span>{summary.activeHours.toFixed(1)}h active</span>
                                <span className="text-[var(--foreground-subtle)]">{summary.idleHours.toFixed(1)}h idle</span>
                              </div>
                              <div className="w-40 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${activePercentage}%` }} />
                                <div className="h-full bg-amber-400" style={{ width: `${100 - activePercentage}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={cn("inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md border", 
                              summary.productivityScore >= 80 ? "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900" :
                              summary.productivityScore >= 50 ? "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900" :
                              "text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900"
                            )}>
                              {summary.productivityScore}%
                            </span>
                          </td>
                          <td className="p-4 text-center font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
                            {summary.totalActions}
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <Button
                              variant="secondary"
                              size="sm"
                              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                              onClick={() => handleInspectUser(summary.userId, summary.user.name)}
                            >
                              Timeline
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 width): Leaderboards */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-[var(--border)] rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Team Standings
              </h3>
              
              {/* Range Toggle */}
              <select
                value={rangeDays}
                onChange={(e) => setRangeDays(Number(e.target.value))}
                className="select-modern py-1 text-xs"
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
            </div>

            {/* Tabs for active vs productive */}
            <div className="space-y-4">
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex gap-1 text-xs">
                <button
                  className="flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 active"
                  style={{
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <Activity className="w-3.5 h-3.5 text-indigo-500" />
                  Most Active
                </button>
              </div>

              {isLeaderboardLoading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`leaderboard-skel-${i}`} className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : leaderboard.mostActive.length === 0 ? (
                <p className="text-center py-6 text-xs text-[var(--foreground-muted)]">
                  No data available in this range.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {leaderboard.mostActive.slice(0, 5).map((user, idx) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-extrabold text-slate-400 dark:text-slate-600 w-4">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{user.name}</p>
                          <p className="text-[10px] text-[var(--foreground-muted)]">
                            {user.totalActions} events captured
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {user.activeHours.toFixed(1)} hrs
                        </p>
                        <p className="text-[10px] text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/20 px-1 rounded inline-block">
                          {user.productivityScore}% Score
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Retention notice block */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-slate-900 dark:to-indigo-950/10 border border-indigo-100/50 dark:border-slate-800/80 rounded-2xl p-5">
            <h4 className="font-semibold text-sm text-indigo-950 dark:text-indigo-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-600" />
              12-Month Data Retention Policy
            </h4>
            <p className="text-xs text-indigo-900/70 dark:text-indigo-400/70 mt-2 leading-relaxed">
              Prisma activity trails and raw timesheet records undergo automated cleanup after 12 months. Periodic summaries are compressed to optimize database performance.
            </p>
          </div>
        </div>
      </div>

      {/* Side drawer displaying timeline audit log */}
      <Drawer
        isOpen={!!inspectedUser}
        onClose={() => setInspectedUser(null)}
        title={`${inspectedUser?.name || 'Employee'} Timeline`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
            <span className="text-xs font-semibold text-[var(--foreground-muted)]">
              Date: {format(selectedDate, 'MMMM d, yyyy')}
            </span>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
              Auditing employee activity
            </span>
          </div>

          {isTimelineLoading ? (
            <div className="space-y-4 py-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`drawer-skel-${i}`} className="flex gap-4 items-start animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                  <div className="space-y-2 w-full">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : timelineLogs.length === 0 ? (
            <div className="text-center py-16 text-[var(--foreground-muted)] text-sm">
              No activity logs recorded for this day.
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
      </Drawer>
    </div>
  )
}
