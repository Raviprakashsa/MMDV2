import { test, expect } from '@playwright/test';
import { BASE_URL, openAsAdmin } from './auth';

const ROUTES = [
    { path: '/dashboard', title: 'Dashboard' },
    { path: '/dashboard/companies', title: 'Companies' },
    { path: '/dashboard/candidates', title: 'Candidates' },
    { path: '/dashboard/leads', title: 'Leads' },
    { path: '/dashboard/reports', title: 'Reports' },
];

test.describe('Dashboard Smoke Tests', () => {
    test.beforeEach(async ({ page, context, request }) => {
        await openAsAdmin(page, context, request);
        await expect(page).toHaveURL(/\/dashboard$/);
    });

    for (const route of ROUTES) {
        test(`should load ${route.title} page correctly`, async ({ page }) => {
            console.log(`Navigating to ${route.path}...`);

            const response = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded' });

            expect(response?.status()).toBe(200);
            await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 10000 });
            await expect(page.locator('text=Application Error')).toBeHidden();

            console.log(`${route.title} loaded successfully.`);
        });
    }
});
