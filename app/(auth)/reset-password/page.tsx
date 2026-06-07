"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import NeuroBackground from "@/components/layout/NeuroBackground"
import GlobalLoadingOverlay from "@/components/layout/GlobalLoadingOverlay"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const tokenParam = searchParams.get("token") || ""
    const emailParam = searchParams.get("email") || ""
    setToken(tokenParam)
    setEmail(emailParam)

    if (!tokenParam || !emailParam) {
      setError("Invalid or missing password reset parameters. Please request a new link.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!token || !email) {
      setError("Missing reset parameters. Please request a new link.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to reset password. Please try again.")
        return
      }

      setSuccess("Your password has been successfully reset!")
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      console.error("Reset password error:", err)
      setError("An unexpected error occurred. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {success ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
            <svg className="h-5 w-5 shrink-0 text-green-600 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.8-10.2a.75.75 0 00-1.08-1.04L9 11.6 7.28 9.88a.75.75 0 10-1.06 1.06l2.25 2.25a.75.75 0 001.08 0l4.33-4.5z" clipRule="evenodd" />
            </svg>
            <div className="space-y-1">
              <p className="font-semibold">Password Reset Success</p>
              <p>{success}</p>
              <p className="text-xs text-green-700/80 mt-1">Redirecting you to sign in shortly...</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-4 px-4 bg-gradient-to-r from-[#1700ae] via-[#2a10c0] to-[#001bff] text-white font-semibold rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 transition-all text-lg"
          >
            Go to Sign In Now
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <GlobalLoadingOverlay show={loading} message="Updating your password..." />

          <div className="space-y-2">
            <label htmlFor="emailDisplay" className="block text-sm font-semibold text-slate-700">
              Account Email
            </label>
            <input
              id="emailDisplay"
              type="text"
              value={email}
              disabled
              className="w-full px-4 py-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!token || !email}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-slate-400 shadow-sm"
              placeholder="At least 8 characters"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={!token || !email}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all placeholder:text-slate-400 shadow-sm"
              placeholder="Confirm new password"
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
            disabled={loading || !token || !email}
            className="w-full py-4 px-4 bg-gradient-to-r from-[#1700ae] via-[#2a10c0] to-[#001bff] text-white font-semibold rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_rgba(23,0,174,0.5),inset_0_1px_0_rgba(255,255,255,0.25)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.2),0_16px_40px_rgba(23,0,174,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg tracking-wide"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
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
              <span className="text-slate-900">Reset</span>
              <span className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 bg-clip-text text-transparent"> Password</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Create a new secure password for your account
            </p>
          </div>

          <Suspense fallback={<div className="h-40 flex items-center justify-center text-slate-400">Loading form...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
