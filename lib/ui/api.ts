export type TenantContext = { tenantId?: string; userId?: string }

function buildHeaders(context?: TenantContext, initHeaders?: HeadersInit) {
  const headers = new Headers(initHeaders || {})
  const tenantId = context?.tenantId || getBrowserTenantId() || (process.env.NODE_ENV !== 'production' ? 'default-tenant' : '')
  const userId = context?.userId

  if (tenantId) headers.set('x-tenant-id', tenantId)
  if (userId) headers.set('x-user-id', userId)

  return headers
}

export function getBrowserTenantId() {
  if (typeof window === 'undefined') return ''

  const fromCookie = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('tenantId='))
    ?.split('=')[1]

  const fromStorage = window.localStorage.getItem('tenantId') || window.sessionStorage.getItem('tenantId') || ''

  return decodeURIComponent(fromCookie || fromStorage || '')
}

export function getBrowserTenantContext(userId?: string): TenantContext {
  return {
    tenantId: getBrowserTenantId(),
    userId,
  }
}

async function handleRes(res: Response) {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json()
}

async function requestJson(path: string, init: RequestInit = {}, context?: TenantContext) {
  const headers = buildHeaders(context, init.headers)
  return fetch(path, { ...init, headers }).then(handleRes)
}

function toQueryString(params?: Record<string, string | undefined | null>) {
  if (!params) return ''
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value))
    }
  })
  return search.toString()
}

export async function getUsers(context?: TenantContext) {
  return requestJson('/api/v1/users', {}, context)
}

export async function getUser(id: string, context?: TenantContext) {
  return requestJson(`/api/v1/users/${id}`, {}, context)
}

export async function createUser(payload: any, context?: TenantContext) {
  return requestJson('/api/v1/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, context)
}

export async function updateUser(id: string, payload: any, context?: TenantContext) {
  return requestJson(`/api/v1/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, context)
}

export async function getRoles(context?: TenantContext) { return requestJson('/api/v1/roles', {}, context) }
export async function getRole(id: string, context?: TenantContext) { return requestJson(`/api/v1/roles/${id}`, {}, context) }
export async function createRole(payload: any, context?: TenantContext) { return requestJson('/api/v1/roles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, context) }
export async function updateRole(id: string, payload: any, context?: TenantContext) { return requestJson(`/api/v1/roles/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, context) }

export async function getPermissions(context?: TenantContext) { return requestJson('/api/v1/permissions', {}, context) }

export async function getSessions(context?: TenantContext) { return requestJson('/api/v1/sessions', {}, context) }
export async function revokeSession(id: string, context?: TenantContext) { return requestJson(`/api/v1/sessions/${id}`, { method: 'DELETE' }, context) }

export async function assignRolePermission(roleId: string, permissionId: string, context?: TenantContext) { return requestJson(`/api/v1/roles/${roleId}/permissions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ permissionId }) }, context) }
export async function removeRolePermission(roleId: string, permissionId: string, context?: TenantContext) { return requestJson(`/api/v1/roles/${roleId}/permissions/${permissionId}`, { method: 'DELETE' }, context) }

export async function getCompanies(params?: Record<string, string | undefined>, context?: TenantContext) {
  const query = toQueryString(params)
  return requestJson(`/api/v1/companies${query ? `?${query}` : ''}`, {}, context)
}

export async function getCompany(id: string, context?: TenantContext) {
  return requestJson(`/api/v1/companies/${id}`, {}, context)
}

export async function createCompany(payload: any, context?: TenantContext) {
  return requestJson('/api/v1/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, context)
}

export async function updateCompany(id: string, payload: any, context?: TenantContext) {
  return requestJson(`/api/v1/companies/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, context)
}

export async function deleteCompany(id: string, context?: TenantContext) {
  return requestJson(`/api/v1/companies/${id}`, { method: 'DELETE' }, context)
}

export async function getContacts(params?: Record<string, string | undefined>, context?: TenantContext) {
  const query = toQueryString(params)
  return requestJson(`/api/v1/contacts${query ? `?${query}` : ''}`, {}, context)
}

export async function getContact(id: string, context?: TenantContext) {
  return requestJson(`/api/v1/contacts/${id}`, {}, context)
}

export async function createContact(payload: any, context?: TenantContext) {
  return requestJson('/api/v1/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, context)
}

export async function updateContact(id: string, payload: any, context?: TenantContext) {
  return requestJson(`/api/v1/contacts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, context)
}

export async function deleteContact(id: string, context?: TenantContext) {
  return requestJson(`/api/v1/contacts/${id}`, { method: 'DELETE' }, context)
}

export async function getLeads(params?: Record<string, string | undefined>, context?: TenantContext) {
  const query = toQueryString(params)
  return requestJson(`/api/v1/leads${query ? `?${query}` : ''}`, {}, context)
}

export async function getLead(id: string, context?: TenantContext) {
  return requestJson(`/api/v1/leads/${id}`, {}, context)
}

export async function createLead(payload: any, context?: TenantContext) {
  return requestJson('/api/v1/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, context)
}

export async function updateLead(id: string, payload: any, context?: TenantContext) {
  return requestJson(`/api/v1/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }, context)
}

export async function updateLeadStatus(id: string, status: string, context?: TenantContext) {
  return requestJson(`/api/v1/leads/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }, context)
}

export async function getAccessLogs(context?: TenantContext) {
  return requestJson('/api/v1/privacy/access-logs', {}, context)
}

export async function getExportJobs(context?: TenantContext) {
  return requestJson('/api/v1/privacy/export-jobs', {}, context)
}

export async function createExportJob(payload: { format: string }, context?: TenantContext) {
  return requestJson('/api/v1/privacy/export-jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, context)
}

export async function getJobPostings(context?: TenantContext) {
  return requestJson('/api/v1/job-postings', {}, context)
}

export async function getJobPosting(id: string, context?: TenantContext) {
  return requestJson(`/api/v1/job-postings/${id}`, {}, context)
}

export async function createJobPosting(payload: any, context?: TenantContext) {
  return requestJson('/api/v1/job-postings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, context)
}

export async function updateJobPosting(id: string, payload: any, context?: TenantContext) {
  return requestJson(`/api/v1/job-postings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, context)
}

export async function deleteJobPosting(id: string, context?: TenantContext) {
  return requestJson(`/api/v1/job-postings/${id}`, {
    method: 'DELETE'
  }, context)
}

export async function getCandidates(context?: TenantContext) {
  return requestJson('/api/v1/candidates', {}, context)
}

export async function getCandidate(id: string, context?: TenantContext) {
  return requestJson(`/api/v1/candidates/${id}`, {}, context)
}

export async function createCandidate(payload: any, context?: TenantContext) {
  return requestJson('/api/v1/candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, context)
}

export async function updateCandidate(id: string, payload: any, context?: TenantContext) {
  return requestJson(`/api/v1/candidates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, context)
}

export async function deleteCandidate(id: string, context?: TenantContext) {
  return requestJson(`/api/v1/candidates/${id}`, {
    method: 'DELETE'
  }, context)
}

export async function getApplications(context?: TenantContext) {
  return requestJson('/api/v1/applications', {}, context)
}

export async function getApplication(id: string, context?: TenantContext) {
  return requestJson(`/api/v1/applications/${id}`, {}, context)
}

export async function createApplication(payload: any, context?: TenantContext) {
  return requestJson('/api/v1/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, context)
}

export async function updateApplication(id: string, payload: any, context?: TenantContext) {
  return requestJson(`/api/v1/applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, context)
}

export async function changeApplicationStatus(id: string, status: string, context?: TenantContext) {
  return requestJson(`/api/v1/applications/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }, context)
}

export async function getInterviews(context?: TenantContext) {
  return requestJson('/api/v1/interviews', {}, context)
}

export async function getInterview(id: string, context?: TenantContext) {
  return requestJson(`/api/v1/interviews/${id}`, {}, context)
}

export async function createInterview(payload: any, context?: TenantContext) {
  return requestJson('/api/v1/interviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, context)
}

export async function updateInterview(id: string, payload: any, context?: TenantContext) {
  return requestJson(`/api/v1/interviews/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }, context)
}

export async function changeInterviewStatus(id: string, status: string, context?: TenantContext) {
  return requestJson(`/api/v1/interviews/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  }, context)
}



