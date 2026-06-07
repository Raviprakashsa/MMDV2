"use client"

import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

interface ActivityTrackerContextType {
  isActive: boolean
  activeSeconds: number
  idleSeconds: number
}

const ActivityTrackerContext = createContext<ActivityTrackerContextType | null>(null)

export const useActivityTracker = () => {
  const context = useContext(ActivityTrackerContext)
  if (!context) {
    throw new Error("useActivityTracker must be used within an ActivityTrackerProvider")
  }
  return context
}

// Idle timeout set to 10 minutes in milliseconds
const IDLE_TIMEOUT = 10 * 60 * 1000

export function ActivityTrackerProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const [isActive, setIsActive] = useState(true)
  const lastActivityRef = useRef<number>(Date.now())
  
  const activeSecondsRef = useRef<number>(0)
  const idleSecondsRef = useRef<number>(0)
  const pageViewsRef = useRef<string[]>([])
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Track pathname changes as page views
  useEffect(() => {
    if (!session?.user) return

    // Register active behavior on route change
    lastActivityRef.current = Date.now()
    setIsActive(true)

    // Append to page views if it's not already the last page view
    const lastPage = pageViewsRef.current[pageViewsRef.current.length - 1]
    if (pathname && pathname !== lastPage) {
      pageViewsRef.current.push(pathname)
    }
  }, [pathname, session])

  // Set up activity event listeners
  useEffect(() => {
    if (!session?.user) return

    const handleUserInteraction = () => {
      lastActivityRef.current = Date.now()
      setIsActive(true)
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"]
    events.forEach((event) => {
      window.addEventListener(event, handleUserInteraction, { passive: true })
    })

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserInteraction)
      })
    }
  }, [session])

  // Second-by-second timer to count active vs idle time
  useEffect(() => {
    if (!session?.user) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivityRef.current
      const isCurrentlyActive = timeSinceLastActivity < IDLE_TIMEOUT && document.visibilityState === "visible"

      setIsActive(isCurrentlyActive)

      if (isCurrentlyActive) {
        activeSecondsRef.current += 1
      } else {
        idleSecondsRef.current += 1
      }
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [session])

  // Heartbeat API synchronizer (every 60 seconds)
  useEffect(() => {
    if (!session?.user) {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current)
      return
    }

    const sendHeartbeat = async () => {
      const activeSec = activeSecondsRef.current
      const idleSec = idleSecondsRef.current
      const pages = [...pageViewsRef.current]

      // Only send if there is accumulated time
      if (activeSec === 0 && idleSec === 0 && pages.length === 0) return

      // Reset local accumulators immediately to avoid race conditions
      activeSecondsRef.current = 0
      idleSecondsRef.current = 0
      pageViewsRef.current = []

      try {
        await fetch("/api/productivity/heartbeat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activeSeconds: activeSec,
            idleSeconds: idleSec,
            pageViews: pages,
          }),
        })
      } catch (err) {
        console.error("Failed to send activity heartbeat:", err)
        // Put values back to try again in next interval
        activeSecondsRef.current += activeSec
        idleSecondsRef.current += idleSec
        pageViewsRef.current = [...pages, ...pageViewsRef.current]
      }
    }

    heartbeatTimerRef.current = setInterval(sendHeartbeat, 60 * 1000)

    // Send a final heartbeat on unmount or beforeunload
    const handleBeforeUnload = () => {
      const activeSec = activeSecondsRef.current
      const idleSec = idleSecondsRef.current
      const pages = pageViewsRef.current

      if (activeSec > 0 || idleSec > 0 || pages.length > 0) {
        const payload = JSON.stringify({
          activeSeconds: activeSec,
          idleSeconds: idleSec,
          pageViews: pages,
        })
        // Use sendBeacon for reliable delivery on page close
        navigator.sendBeacon("/api/productivity/heartbeat", payload)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [session])

  return (
    <ActivityTrackerContext.Provider
      value={{
        isActive,
        activeSeconds: activeSecondsRef.current,
        idleSeconds: idleSecondsRef.current,
      }}
    >
      {children}
    </ActivityTrackerContext.Provider>
  )
}
