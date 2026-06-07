'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, User, Clock } from 'lucide-react'
import Button from '@/components/ui/Button'
import { JoinedInterview } from './InterviewCard'
import { InterviewStatus } from './InterviewStatusBadge'

interface InterviewCalendarProps {
  interviews: JoinedInterview[]
  onStatusChangeClick: (id: string, currentStatus: InterviewStatus) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function InterviewCalendar({
  interviews,
  onStatusChangeClick,
}: InterviewCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Calculate dates in month
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month])
  const firstDayIndex = useMemo(() => new Date(year, month, 1).getDay(), [year, month])

  const prevMonthDaysCount = useMemo(() => new Date(year, month, 0).getDate(), [year, month])

  const calendarDays = useMemo(() => {
    const days: { day: number; date: Date; isCurrentMonth: boolean }[] = []

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = prevMonthDaysCount - i
      const date = new Date(year, month - 1, prevDay)
      days.push({ day: prevDay, date, isCurrentMonth: false })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      days.push({ day: i, date, isCurrentMonth: true })
    }

    // Next month padding (total cell count 42 for a perfect 6x7 grid)
    const nextPadding = 42 - days.length
    for (let i = 1; i <= nextPadding; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ day: i, date, isCurrentMonth: false })
    }

    return days
  }, [year, month, daysInMonth, firstDayIndex, prevMonthDaysCount])

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Group interviews by Date Key (YYYY-MM-DD) for O(1) matching
  const interviewsByDateKey = useMemo(() => {
    const map = new Map<string, JoinedInterview[]>()
    interviews.forEach((item) => {
      const date = new Date(item.scheduledAt)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const existing = map.get(key) || []
      existing.push(item)
      map.set(key, existing)
    })
    return map
  }, [interviews])

  const monthLabel = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })

  // Status-dependent classes for event display in day blocks
  const eventStatusClasses: Record<InterviewStatus, string> = {
    SCHEDULED: 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-950/20 dark:border-brand-900 dark:text-brand-400',
    COMPLETED: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 dark:text-emerald-400',
    CANCELLED: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-400',
    NO_SHOW: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-400',
  }

  return (
    <div className="flex flex-col w-full bg-white dark:bg-slate-900 border border-[rgba(23,0,174,0.06)] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-1">
          <Calendar className="w-5 h-5 text-brand-700 shrink-0" />
          <h2 className="text-base font-extrabold text-[var(--foreground)] tracking-tight">
            {monthLabel}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleToday}>
            Today
          </Button>
          <div className="flex items-center border border-slate-200/80 rounded-xl bg-white dark:bg-slate-800 dark:border-slate-700 p-0.5 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded-lg transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 rounded-lg transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 text-center font-bold text-xxs uppercase tracking-wider text-slate-400 py-3">
        {WEEKDAYS.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* 6x7 Grid of Days */}
      <div className="grid grid-cols-7 bg-slate-100/50 dark:bg-slate-900/30 divide-x divide-y divide-slate-100 dark:divide-slate-800 border-l border-t border-transparent">
        {calendarDays.map((cell, idx) => {
          const dateKey = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`
          const cellInterviews = interviewsByDateKey.get(dateKey) || []

          const isToday = new Date().toDateString() === cell.date.toDateString()

          return (
            <div
              key={idx}
              className={`min-h-[100px] sm:min-h-[120px] p-2 flex flex-col justify-start bg-white dark:bg-slate-900 transition-colors ${
                cell.isCurrentMonth
                  ? 'text-[var(--foreground)]'
                  : 'text-slate-300 dark:text-slate-700 bg-slate-50/20 dark:bg-slate-900/10'
              }`}
            >
              {/* Day Number Indicator */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-brand-700 text-white font-extrabold shadow-sm'
                      : cell.isCurrentMonth
                      ? 'text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-600'
                  }`}
                >
                  {cell.day}
                </span>
                {cellInterviews.length > 0 && (
                  <span className="bg-slate-100 border border-slate-200/50 text-slate-600 px-1.5 py-0.5 rounded-full text-[9px] font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                    {cellInterviews.length}
                  </span>
                )}
              </div>

              {/* Day Events Slot */}
              <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[80px] custom-scrollbar">
                {cellInterviews.map((item) => {
                  const eventTime = new Date(item.scheduledAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })

                  const statusClass = eventStatusClasses[item.status] || ''

                  return (
                    <div
                      key={item.id}
                      className={`group border rounded-lg p-1.5 text-xxs transition-all shadow-2xs hover:shadow-xs cursor-pointer select-none flex flex-col gap-0.5 relative ${statusClass}`}
                      onClick={() => onStatusChangeClick(item.id, item.status)}
                      title={`Change Status (Current: ${item.status})`}
                    >
                      <div className="font-bold truncate flex items-center gap-0.5">
                        <User className="w-2.5 h-2.5 shrink-0 opacity-70" />
                        <span className="truncate">{item.candidateName}</span>
                      </div>
                      <div className="truncate opacity-90 pl-3">
                        {item.jobTitle}
                      </div>
                      <div className="flex items-center gap-0.5 text-[9px] opacity-75 mt-0.5 font-medium pl-3">
                        <Clock className="w-2.5 h-2.5 shrink-0" />
                        {eventTime} &bull; R{item.round}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
