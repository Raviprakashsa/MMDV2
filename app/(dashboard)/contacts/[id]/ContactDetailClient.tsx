"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateContactAction, deleteContact } from "@/lib/actions/module15-contacts"
import Link from "next/link"
import { ShieldAlert, ArrowLeft, Trash2, Edit2, Briefcase } from "lucide-react"

interface CompanyOption {
  _id: string
  name: string
}

interface Contact {
  _id: string
  companyId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  title: string
  companyName: string
}

interface ContactDetailClientProps {
  contact: Contact
  companies: CompanyOption[]
}

export default function ContactDetailClient({ contact, companies }: ContactDetailClientProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    id: contact._id,
    companyId: contact.companyId,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    title: contact.title,
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await updateContactAction(formData)
      if (res.success) {
        setIsEditing(false)
        router.refresh()
      } else {
        setError(res.error || "Failed to update contact")
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return
    setError(null)
    setLoading(true)

    try {
      const res = await deleteContact({ id: contact._id })
      if (res.success) {
        router.push("/contacts")
        router.refresh()
      } else {
        setError(res.error || "Failed to delete contact")
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/contacts" className="text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {contact.firstName} {contact.lastName}
            </h1>
            <p className="text-xs text-slate-500">Contact detail and association setup.</p>
          </div>
        </div>
        {!isEditing && (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 px-4 py-2 text-sm font-bold hover:bg-red-100/70 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
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
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 font-extrabold text-xl border border-cyan-100">
              {contact.firstName?.[0] || ""}{contact.lastName?.[0] || ""}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {contact.firstName} {contact.lastName}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Briefcase className="h-3.5 w-3.5" />
                {contact.title}
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Linked Company</span>
              <p className="text-sm font-semibold text-slate-800">{contact.companyName}</p>
            </div>

            <div className="space-y-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Email address</span>
              <a href={`mailto:${contact.email}`} className="text-sm font-semibold text-[var(--primary)] hover:underline block truncate">
                {contact.email}
              </a>
            </div>

            <div className="space-y-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Phone number</span>
              <a href={`tel:${contact.phone}`} className="text-sm font-semibold text-slate-800 hover:text-[var(--primary)] block">
                {contact.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
