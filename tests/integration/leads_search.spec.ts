import { test, expect } from '@playwright/test';
import { openAsAdmin } from './auth';

test.describe('Leads Search Mechanism', () => {
    test.beforeEach(async ({ page, context, request }) => {
        page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));
        await openAsAdmin(page, context, request, '/dashboard/leads');
    });

    test('should filter leads by company name', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Leads Management/i })).toBeVisible({ timeout: 10000 });

        const timestamp = Date.now();
        const uniqueName = `SearchTest_Company_${timestamp}`;

        await page.click('button:has-text("New Lead")');
        await page.selectOption('#create-source', 'LinkedIn');
        await page.fill('#create-company', uniqueName);
        await page.selectOption('#create-sector', 'IT');
        await page.fill('#create-confidence', '90');
        await page.fill('#create-contact-name', 'Search Test Contact');
        await page.fill('#create-phone', '+91 9000000001');
        await page.fill('#create-email', `search-${timestamp}@example.com`);
        await page.click('button:has-text("Add Lead")');

        await expect(page.locator('div[role="dialog"]')).toBeHidden();
        const createdRow = page.locator('tr', { hasText: uniqueName }).first();
        await expect(createdRow).toBeVisible({ timeout: 10000 });

        console.log('TEST: Lead created. Starting search...');

        const searchInput = page.locator('input[placeholder="Search by company, contact, or sector..."]');
        await expect(searchInput).toBeEditable();
        await searchInput.fill(uniqueName);
        console.log(`TEST: Typed "${uniqueName}" into search`);

        await expect(page.locator('tr', { hasText: uniqueName }).first()).toBeVisible();

        await searchInput.fill('');
        await expect(page.locator('tr', { hasText: uniqueName }).first()).toBeVisible();
    });
});
