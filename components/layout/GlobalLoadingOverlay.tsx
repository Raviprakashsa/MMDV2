'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface GlobalLoadingOverlayProps {
  show: boolean
  message?: string
}

export default function GlobalLoadingOverlay({ show, message = 'Loading System...' }: Readonly<GlobalLoadingOverlayProps>) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-md"
        >
          {/* Subtle Ambient Background Glowing Gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] left-[10%] w-[30rem] h-[30rem] rounded-full bg-brand-900/10 dark:bg-brand-900/20 blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
            <div className="absolute bottom-[20%] right-[10%] w-[30rem] h-[30rem] rounded-full bg-blue-900/10 dark:bg-blue-900/15 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
          </div>

          {/* Loading Container */}
          <div className="relative z-10 flex flex-col items-center space-y-6 px-6 text-center">
            {/* Animated Logo Mark */}
            <div className="relative flex items-center justify-center w-24 h-24">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-2 border-brand-500/20 animate-ping" style={{ animationDuration: '2s' }} />
              
              {/* Spinning gradient ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-600 border-r-blue-500 animate-spin" style={{ animationDuration: '1.2s' }} />
              
              {/* Inner branded core */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-700 to-blue-600 flex items-center justify-center shadow-[0_8px_24px_rgba(23,0,174,0.4)]">
                <span className="text-white text-2xl font-bold font-display tracking-tighter">MC</span>
              </div>
            </div>

            {/* Branded Brand Name */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-white font-display">
                Magnus<span className="bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">Copo</span>
              </h2>
              <p className="text-slate-400 text-sm font-medium tracking-wide">
                {message}
              </p>
            </div>

            {/* Linear Progress Indicator */}
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-500 via-blue-500 to-brand-400 rounded-full animate-[ops-gradient-shift_2s_infinite]" style={{ width: '60%', animation: 'shimmer-progress 1.5s infinite ease-in-out' }} />
            </div>
          </div>

          {/* Keyframe Styling */}
          <style jsx global>{`
            @keyframes shimmer-progress {
              0% {
                transform: translateX(-100%);
              }
              50% {
                transform: translateX(20%);
              }
              100% {
                transform: translateX(100%);
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
