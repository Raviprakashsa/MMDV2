"use client"

import { useState } from "react"
import NeuroBackground from "@/components/layout/NeuroBackground"
import GlobalLoadingOverlay from "@/components/layout/GlobalLoadingOverlay"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [resetLink, setResetLink] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setError("")
    setSuccess("")
    setResetLink("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to process request. Please try again.")
        return
      }

      setSuccess("If your account is active, a password reset link has been generated.")
      if (data.resetLink) {
        setResetLink(data.resetLink)
      }
    } catch (err) {
      console.error("Forgot password request error:", err)
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050710] px-4 relative overflow-y-auto scroll-smooth">
      {/* Three.js Neural Background - Full screen dramatic effect */}
      <div className="absolute inset-0 z-0">
        <NeuroBackground variant="aurora" intensity={1.2} />
      </div>

      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_30%,rgba(23,0,174,0.25),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(0,27,255,0.15),transparent_40%)]" />

      {/* Premium card container */}
      <div className="relative z-10 w-full max-w-md animate-in zoom-in-95 fade-in duration-500">
        <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 space-y-6 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_25px_50px_-12px_rgba(0,0,0,0.6),0_50px_100px_-24px_rgba(23,0,174,0.4)] border border-white/20">
          {/* Logo section */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight font-display">
              <span className="text-slate-900">Forgot</span>
              <span className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 bg-clip-text text-transparent"> Password</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Enter your email to receive a password reset link
            </p>
          </div>

          <GlobalLoadingOverlay show={loading} message="Processing request..." />

          {success ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
                <svg className="h-5 w-5 shrink-0 text-green-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.8-10.2a.75.75 0 00-1.08-1.04L9 11.6 7.28 9.88a.75.75 0 10-1.06 1.06l2.25 2.25a.75.75 0 001.08 0l4.33-4.5z" clipRule="evenodd" />
                </svg>
                <div className="space-y-1">
                  <p className="font-semibold">Reset Request Received</p>
                  <p>{success}</p>
                </div>
              </div>

              {resetLink && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2.5">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Demo / Test Link:</p>
                  <p className="text-xs text-slate-600 break-all select-all font-mono p-2 bg-white rounded-lg border border-blue-100">
                    {resetLink}
                  </p>
                  <a
                    href={resetLink}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1700ae] hover:text-[#001bff] transition-colors"
                  >
                    <span>Click here to reset password directly</span>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>
              )}

              <div className="text-center pt-2">
                <a
                  href="/login"
                  className="text-sm font-semibold text-[#1700ae] hover:text-[#001bff] transition-colors"
                >
                  Back to Sign In
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="you@company.com"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-in fade-in duration-200">
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 bg-gradient-to-r from-[#1700ae] via-[#2a10c0] to-[#001bff] text-white font-semibold rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_rgba(23,0,174,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.2),0_16px_40px_rgba(23,0,174,0.6),inset_0_1px_0_rgba(255,255,255,0.25)] hover:-translate-y-1 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg tracking-wide"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center pt-2">
                <a
                  href="/login"
                  className="text-sm font-semibold text-[#1700ae] hover:text-[#001bff] transition-colors"
                >
                  Back to Sign In
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
