"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createContactAction } from "@/lib/actions/module15-contacts"
import Link from "next/link"
import { ShieldAlert, ArrowLeft } from "lucide-react"

interface CompanyOption {
  _id: string
  name: string
}

interface ContactFormProps {
  companies: CompanyOption[]
}

export default function ContactForm({ companies }: ContactFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    companyId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await createContactAction(formData)
      if (res.success) {
        router.push("/contacts")
        router.refresh()
      } else {
        setError(res.error || "Failed to create contact")
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <Link href="/contacts" className="text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900">New Contact</h2>
          <p className="text-xs text-slate-500">Provide the contact credentials to link with a company.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="companyId" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Select Company *
          </label>
          <select
            id="companyId"
            required
            value={formData.companyId}
            onChange={(e) => setFormData((prev) => ({ ...prev, companyId: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="">-- Choose Company --</option>
            {companies.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              First Name *
            </label>
            <input
              id="firstName"
              type="text"
              required
              placeholder="e.g. John"
              value={formData.firstName}
              onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Last Name *
            </label>
            <input
              id="lastName"
              type="text"
              required
              placeholder="e.g. Doe"
              value={formData.lastName}
              onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="e.g. john.doe@example.com"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            required
            placeholder="e.g. +919999999999"
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Job Title / Designation *
          </label>
          <input
            id="title"
            type="text"
            required
            placeholder="e.g. HR Director"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <Link
            href="/contacts"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Creating..." : "Save Contact"}
          </button>
        </div>
      </form>
    </div>
  )
}
