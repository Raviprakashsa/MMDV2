'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Command, Menu } from 'lucide-react'
import NotificationBell from '@/components/notifications/NotificationBell'
import { GlobalSearch } from '@/components/layout/GlobalSearch'

interface TopNavProps {
  userName?: string
  userRole?: string
  onMenuClick?: () => void
}

export function TopNav({ userName, userRole, onMenuClick }: Readonly<TopNavProps>) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setSearchOpen(true)
    }
    if (e.key === 'Escape') {
      setSearchOpen(false)
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(globalThis.scrollY > 8)
    }

    document.addEventListener('keydown', handleKeyDown)
    globalThis.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      globalThis.removeEventListener('scroll', onScroll)
    }
  }, [handleKeyDown])

  return (
    <>
      <header
        className={`sticky top-0 z-50 flex items-center justify-between px-6 transition-all bg-gradient-to-r from-white/95 via-white/90 to-white/95 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-900/95 backdrop-blur-xl border-b border-[rgba(23,0,174,0.06)] shadow-[0_2px_16px_rgba(15,23,42,0.04)] ${isScrolled ? 'py-2' : 'py-3'
          }`}
        data-scrolled={isScrolled}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-xl transition-all duration-base text-muted-foreground hover:text-foreground hover:bg-brand-50 lg:hidden shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          )}

          {/* Search trigger - responsive width */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 px-3 sm:px-4 py-2.5 rounded-xl bg-white border border-[rgba(23,0,174,0.08)] text-muted-foreground hover:border-brand-700 hover:text-foreground transition-all w-11 sm:w-80 shadow-[0_2px_8px_rgba(15,23,42,0.06)] shrink-0 sm:shrink"
            aria-label="Open global search"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="text-sm hidden sm:inline">Search...</span>
            <kbd className="ml-auto items-center gap-1 text-xs bg-slate-50 text-muted-foreground px-2 py-1 rounded-md border border-slate-200 font-mono hidden sm:flex">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <NotificationBell />

          {/* User menu */}
          <div className="flex items-center gap-3 pl-4 border-l border-[rgba(23,0,174,0.08)]">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-900 to-brand-700 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-brand-700/25">
              {userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-foreground">{userName || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole?.toLowerCase() || 'user'}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Global search modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
