import { expect, type APIRequestContext, type BrowserContext, type Page } from '@playwright/test';

export const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

const allowSeededDefaults = process.env.E2E_USE_SEEDED_USERS === '1';

function getAdminCredential(field: 'EMAIL' | 'PASSWORD') {
    const envKey = `E2E_ADMIN_${field}`;
    const value = process.env[envKey];
    if (value) return value;
    if (allowSeededDefaults) {
        return field === 'EMAIL' ? 'admin@magnuscopo.com' : 'Admin123!';
    }
    throw new Error(`Missing ${envKey}. Set it explicitly, or set E2E_USE_SEEDED_USERS=1 for local seeded test data.`);
}

const ADMIN_EMAIL = getAdminCredential('EMAIL');
const ADMIN_PASSWORD = getAdminCredential('PASSWORD');

export async function signInAsAdmin(request: APIRequestContext, context: BrowserContext) {
    const csrfResponse = await request.get(`${BASE_URL}/api/auth/csrf`);
    expect(csrfResponse.ok(), 'CSRF endpoint should be available before integration tests').toBeTruthy();

    const csrf = await csrfResponse.json();
    expect(csrf.csrfToken, 'NextAuth should return a CSRF token').toBeTruthy();

    const body = new URLSearchParams();
    body.set('email', ADMIN_EMAIL);
    body.set('password', ADMIN_PASSWORD);
    body.set('csrfToken', csrf.csrfToken);
    body.set('callbackUrl', `${BASE_URL}/dashboard`);
    body.set('json', 'true');

    const loginResponse = await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: body.toString(),
        failOnStatusCode: false,
    });

    expect(
        [200, 302].includes(loginResponse.status()),
        `Credentials callback should accept the seeded admin (${loginResponse.status()})`
    ).toBeTruthy();

    const sessionResponse = await request.get(`${BASE_URL}/api/auth/session`);
    expect(sessionResponse.ok(), 'Session endpoint should respond after login').toBeTruthy();

    const sessionText = await sessionResponse.text();
    expect(sessionText, 'Session should contain the authenticated admin email').toContain(ADMIN_EMAIL);

    const state = await request.storageState();
    expect(state.cookies.length, 'Authenticated request context should contain session cookies').toBeGreaterThan(0);
    await context.addCookies(state.cookies);
}

export async function signInAs(
    request: APIRequestContext,
    context: BrowserContext,
    email: string,
    password = 'Admin123!'
) {
    await context.clearCookies();

    const csrfResponse = await request.get(`${BASE_URL}/api/auth/csrf`);
    expect(csrfResponse.ok(), 'CSRF endpoint should be available').toBeTruthy();

    const csrf = await csrfResponse.json();
    expect(csrf.csrfToken, 'NextAuth should return a CSRF token').toBeTruthy();

    const body = new URLSearchParams();
    body.set('email', email);
    body.set('password', password);
    body.set('csrfToken', csrf.csrfToken);
    body.set('callbackUrl', `${BASE_URL}/dashboard`);
    body.set('json', 'true');

    const loginResponse = await request.post(`${BASE_URL}/api/auth/callback/credentials`, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: body.toString(),
        failOnStatusCode: false,
    });

    expect(
        [200, 302].includes(loginResponse.status()),
        `Credentials callback should accept login for ${email} (${loginResponse.status()})`
    ).toBeTruthy();

    const sessionResponse = await request.get(`${BASE_URL}/api/auth/session`);
    expect(sessionResponse.ok(), 'Session endpoint should respond').toBeTruthy();

    const sessionText = await sessionResponse.text();
    expect(sessionText, 'Session should contain the authenticated email').toContain(email);

    const state = await request.storageState();
    expect(state.cookies.length, 'Authenticated request context should contain session cookies').toBeGreaterThan(0);
    await context.addCookies(state.cookies);
}

export async function openAsAdmin(
    page: Page,
    context: BrowserContext,
    request: APIRequestContext,
    path = '/dashboard'
) {
    await signInAsAdmin(request, context);
    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
}
