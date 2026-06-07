/* global console, URLSearchParams, process */
import { request, chromium } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || process.env.E2E_BASE_URL || 'http://localhost:3000';
const allowSeededDefaults = process.env.E2E_USE_SEEDED_USERS === '1';

const seededUsers = {
  SUPER_ADMIN: { email: 'admin@magnuscopo.com', password: 'Admin123!' },
  ADMIN: { email: 'admin_limited@magnuscopo.com', password: 'Admin123!' },
  COORDINATOR: { email: 'rashmi@magnuscopo.com', password: 'Coordinator123!' },
  RECRUITER: { email: 'priya@magnuscopo.com', password: 'Recruiter123!' },
  SCRAPER: { email: 'scraper@magnuscopo.com', password: 'Scraper123!' },
};

const routes = [
  '/dashboard',
  '/dashboard/admin',
  '/dashboard/settings',
  '/dashboard/companies',
  '/dashboard/candidates',
  '/dashboard/leads',
  '/dashboard/reports',
  '/dashboard/users',
];

function getCredential(role, field) {
  const envKey = `E2E_${role}_${field}`;
  const value = process.env[envKey];
  if (value) return value;
  if (allowSeededDefaults) return seededUsers[role]?.[field.toLowerCase()];
  throw new Error(`Missing ${envKey}. Set it explicitly, or set E2E_USE_SEEDED_USERS=1 for local seeded test data.`);
}

function getUsers() {
  return Object.keys(seededUsers).map((role) => ({
    role,
    email: getCredential(role, 'EMAIL'),
    password: getCredential(role, 'PASSWORD'),
  }));
}

function expectedRouteResult(role, route) {
  if (route === '/dashboard/users') {
    return role === 'SUPER_ADMIN' ? 'OK' : 'FORBIDDEN';
  }

  if (route === '/dashboard/admin') {
    return role === 'SUPER_ADMIN' || role === 'ADMIN' ? 'OK' : 'FORBIDDEN';
  }

  return 'OK';
}

async function createAuthedContext(email, password) {
  const api = await request.newContext({ baseURL: base });
  const csrfRes = await api.get('/api/auth/csrf');
  if (!csrfRes.ok()) {
    throw new Error(`CSRF request failed with status ${csrfRes.status()}`);
  }

  const csrfJson = await csrfRes.json();
  const csrfToken = csrfJson?.csrfToken;
  if (!csrfToken) throw new Error('No CSRF token returned by NextAuth');

  const form = new URLSearchParams();
  form.set('email', email);
  form.set('password', password);
  form.set('csrfToken', csrfToken);
  form.set('callbackUrl', '/dashboard');
  form.set('json', 'true');

  const loginRes = await api.post('/api/auth/callback/credentials', {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: form.toString(),
    failOnStatusCode: false,
  });

  if (![200, 302].includes(loginRes.status())) {
    throw new Error(`Credentials callback failed with status ${loginRes.status()}`);
  }

  const sessionRes = await api.get('/api/auth/session');
  if (!sessionRes.ok()) {
    throw new Error(`Session request failed with status ${sessionRes.status()}`);
  }

  const session = await sessionRes.json();
  if (session?.user?.email !== email) {
    throw new Error(`Session email mismatch. Expected ${email}, got ${session?.user?.email || 'empty session'}`);
  }

  const state = await api.storageState();
  await api.dispose();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: state });
  const page = await context.newPage();
  return { browser, context, page, session };
}

const out = [];
let hasFailure = false;

for (const u of getUsers()) {
  const row = { role: u.role, email: u.email, login: 'FAIL', routes: {} };
  let browser;

  try {
    const authed = await createAuthedContext(u.email, u.password);
    browser = authed.browser;
    const page = authed.page;
    const sessionRole = authed.session?.user?.role;

    row.login = sessionRole === u.role ? 'PASS' : 'FAIL';
    row.sessionRole = sessionRole || null;

    if (row.login !== 'PASS') {
      hasFailure = true;
      row.error = `Expected role ${u.role}, got ${sessionRole || 'none'}`;
    }

    for (const route of routes) {
      const t0 = Date.now();
      await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      const ms = Date.now() - t0;
      const finalUrl = page.url();
      const body = ((await page.textContent('body')) || '').toLowerCase();
      const redirectLogin = finalUrl.includes('/login?callbackUrl=');
      const forbidden = finalUrl.includes('/forbidden') || body.includes('403 - forbidden') || body.includes('access denied') || body.includes('you do not have permission');
      const result = redirectLogin ? 'REDIRECT_LOGIN' : forbidden ? 'FORBIDDEN' : 'OK';

      if (redirectLogin) {
        hasFailure = true;
      }

      const expected = expectedRouteResult(u.role, route);
      if (result !== expected) {
        hasFailure = true;
      }

      row.routes[route] = { ms, result, expected, ok: result === expected, finalUrl };
    }

    const perf = {};
    for (const route of ['/dashboard', '/dashboard/companies', '/dashboard/candidates', '/dashboard/requirements', '/dashboard/reports']) {
      const c0 = Date.now();
      await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      const cold = Date.now() - c0;
      const w0 = Date.now();
      await page.goto(base + route, { waitUntil: 'domcontentloaded' });
      const warm = Date.now() - w0;
      perf[route] = { coldMs: cold, warmMs: warm, deltaMs: cold - warm };
    }
    row.performance = perf;
  } catch (e) {
    hasFailure = true;
    row.error = String(e?.message || e);
  } finally {
    out.push(row);
    if (browser) await browser.close();
  }
}

console.log(JSON.stringify(out, null, 2));

if (hasFailure) {
  process.exitCode = 1;
}
