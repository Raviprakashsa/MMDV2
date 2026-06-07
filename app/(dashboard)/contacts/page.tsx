"use server"

import Link from "next/link"
import { getContacts } from "@/lib/actions/module15-contacts"
import { User, Plus, Briefcase, Eye } from "lucide-react"

export default async function ContactsListPage() {
  const result = await getContacts({})
  const contacts = Array.isArray(result.data) ? result.data : []

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">HR Contacts</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Manage all customer HR personnel across tenant company boundaries.
          </p>
        </div>
        <Link
          href="/contacts/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-95 transition-opacity"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Contact
        </Link>
      </div>

      {/* Grid List */}
      {contacts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white/50">
          <User className="mx-auto h-12 w-12 text-slate-400 stroke-1" />
          <h3 className="mt-4 text-base font-semibold text-slate-900">No contacts found</h3>
          <p className="mt-1 text-sm text-slate-500">
            Start by adding a contact to link with a tenant company.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <article
              key={contact._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 font-bold border border-cyan-100">
                    {contact.firstName?.[0] || ""}{contact.lastName?.[0] || ""}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-slate-900 truncate">
                      {contact.firstName} {contact.lastName}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      {contact.title}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider w-16">Company</span>
                    <span className="truncate font-medium text-slate-700">{contact.companyName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider w-16">Email</span>
                    <a href={`mailto:${contact.email}`} className="truncate text-[var(--primary)] hover:underline">
                      {contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-semibold text-xs text-slate-400 uppercase tracking-wider w-16">Phone</span>
                    <a href={`tel:${contact.phone}`} className="truncate text-slate-700 hover:text-[var(--primary)]">
                      {contact.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                <Link
                  href={`/contacts/${contact._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[var(--primary)] transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
