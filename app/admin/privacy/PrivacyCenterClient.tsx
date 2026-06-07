'use client'

import React, { useEffect, useState } from 'react'
import { getAccessLogs, getExportJobs, createExportJob } from '@/lib/ui/api'

interface PrivacyLogRow {
  id: string
  userId: string
  entity: string
  entityId: string
  action: string
  createdAt: string
}

interface GdprExportRow {
  id: string
  requestedBy: string
  format: 'CSV' | 'JSON' | 'XLSX'
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DEAD_LETTER'
  createdAt: string
  completedAt: string
  fileUrl: string
  errorMessage: string
}

export default function PrivacyCenterClient() {
  const [logs, setLogs] = useState<PrivacyLogRow[]>([])
  const [gdprJobs, setGdprJobs] = useState<GdprExportRow[]>([])
  const [format, setFormat] = useState<'CSV' | 'JSON' | 'XLSX'>('JSON')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [gdprFlag, setGdprFlag] = useState<string | null>(null)
  const [errorFlag, setErrorFlag] = useState<string | null>(null)
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setDataError(null)
    try {
      const [rawLogs, rawJobs] = await Promise.all([
        getAccessLogs(),
        getExportJobs()
      ])
      setLogs(rawLogs)
      setGdprJobs(rawJobs)
    } catch {
      setDataError('Unable to load privacy logs and GDPR export jobs right now.')
    } finally {
      setLoading(false)
    }
  }

  async function handleExportSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setGdprFlag(null)
    setErrorFlag(null)

    try {
      await createExportJob({ format })
      setGdprFlag('created')
      // Refresh the exports table list
      const freshJobs = await getExportJobs()
      setGdprJobs(freshJobs)
    } catch {
      setErrorFlag('create-failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-gray-500">
        Loading governance logs and portability schedules...
      </div>
    )
  }

  return (
    <div className="space-y-4 h-screen overflow-y-auto scroll-smooth p-6">
      <h1 className="text-2xl font-semibold">Privacy & Governance</h1>
      <p className="text-sm text-gray-600">
        Recent access logs (last 100). View, export, and mutation events are recorded for auditing.
      </p>

      {gdprFlag === 'created' && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          GDPR export request submitted. Track progress in the Data Portability section below.
        </div>
      )}

      {errorFlag && (
        <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorFlag === 'invalid-format'
            ? 'Invalid export format selected.'
            : 'Could not submit GDPR export request. Please try again.'}
        </div>
      )}

      {dataError && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {dataError}
        </div>
      )}

      <div className="border rounded overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left">User</th>
              <th className="px-2 py-1 text-left">Entity</th>
              <th className="px-2 py-1 text-left">Action</th>
              <th className="px-2 py-1 text-left">When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="px-2 py-1">{log.userId}</td>
                <td className="px-2 py-1">{log.entity} / {log.entityId}</td>
                <td className="px-2 py-1">{log.action}</td>
                <td className="px-2 py-1">{log.createdAt}</td>
              </tr>
            ))}
            {!logs.length && (
              <tr>
                <td className="px-2 py-2" colSpan={4}>
                  No access logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Data Portability</h2>
        <p className="text-sm text-gray-700">
          Create and monitor GDPR portability requests. Completed jobs expose a secure file URL for downstream delivery.
        </p>
        <form onSubmit={handleExportSubmit} className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="gdpr-format" className="block text-xs text-gray-600">Export format</label>
            <select
              id="gdpr-format"
              name="format"
              value={format}
              onChange={(e) => setFormat(e.target.value as 'CSV' | 'JSON' | 'XLSX')}
              className="mt-1 rounded border px-3 py-2 text-sm bg-white"
            >
              <option value="JSON">JSON</option>
              <option value="CSV">CSV</option>
              <option value="XLSX">XLSX</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting Request...' : 'Create GDPR Export Request'}
          </button>
        </form>

        <div className="border rounded overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-2 py-1 text-left">Requested By</th>
                <th className="px-2 py-1 text-left">Format</th>
                <th className="px-2 py-1 text-left">Status</th>
                <th className="px-2 py-1 text-left">Requested At</th>
                <th className="px-2 py-1 text-left">Completed At</th>
                <th className="px-2 py-1 text-left">Download</th>
              </tr>
            </thead>
            <tbody>
              {gdprJobs.map((job) => (
                <tr key={job.id} className="border-t">
                  <td className="px-2 py-1">{job.requestedBy}</td>
                  <td className="px-2 py-1">{job.format}</td>
                  <td className="px-2 py-1">{job.status}</td>
                  <td className="px-2 py-1">{job.createdAt || '-'}</td>
                  <td className="px-2 py-1">{job.completedAt || '-'}</td>
                  <td className="px-2 py-1">
                    {job.status === 'COMPLETED' && job.fileUrl ? (
                      <a href={job.fileUrl} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    ) : (job.status === 'FAILED' || job.status === 'DEAD_LETTER') ? (
                      <span className="text-rose-600">{job.errorMessage || 'Failed'}</span>
                    ) : (
                      <span className="text-gray-500">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
              {!gdprJobs.length && (
                <tr>
                  <td className="px-2 py-2" colSpan={6}>
                    No GDPR export requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Retention</h2>
        <p className="text-sm text-gray-700">Retain audit logs for 7 years. Soft deletes are archived for 30 days before anonymization.</p>
      </div>
    </div>
  )
}
