import { test, expect } from '@playwright/test';
import { openAsAdmin } from './auth';

test.describe('Lead Lifecycle', () => {
    test.beforeEach(({ page }) => {
        page.on('console', msg => console.log(`[BROWSER]: ${msg.text()}`));
        page.on('pageerror', err => console.error(`[BROWSER ERROR]: ${err.message}`));
    });

    test('should create, move, and persist a lead', async ({ page, context, request }) => {
        console.log('Navigating to Leads...');
        await openAsAdmin(page, context, request, '/dashboard/leads');

        try {
            await expect(page.getByRole('heading', { name: /Leads Management/i })).toBeVisible({ timeout: 10000 });
        } catch (e) {
            console.error(`Url: ${page.url()}`);
            console.error('Text not found. Printing page content snippet:');
            const body = await page.innerHTML('body');
            console.error(body.slice(0, 500));
            await page.screenshot({ path: 'leads-fail-nav.png' });
            throw e;
        }

        console.log('Creating Lead...');
        try {
            await page.click("button:has-text('New Lead')");
        } catch (e) {
            await page.screenshot({ path: 'leads-fail-create-btn.png' });
            const html = await page.innerHTML('.flex.gap-2');
            console.error('Button area content:', html);
            throw e;
        }

        const timestamp = Date.now();
        const companyName = `Test Corp ${timestamp}`;
        await page.selectOption('#create-source', 'LinkedIn');
        await page.fill('#create-company', companyName);
        await page.selectOption('#create-sector', 'IT');
        await page.fill('#create-confidence', '90');
        await page.fill('#create-contact-name', 'Lifecycle Test Contact');
        await page.fill('#create-phone', '+91 9000000002');
        await page.fill('#create-email', `lifecycle-${timestamp}@example.com`);
        await page.click("button:has-text('Add Lead')");

        console.log('Verifying creation...');
        const row = page.locator('tr', { hasText: companyName }).first();
        await expect(row).toBeVisible({ timeout: 10000 });

        console.log('Updating status to CONTACTED...');
        await row.locator('button[title="View lead"]').click();
        await expect(page.getByRole('button', { name: 'Edit Lead' })).toBeVisible({ timeout: 10000 });
        await page.getByRole('button', { name: 'Edit Lead' }).click();
        await page.selectOption('#edit-status', 'CONTACTED');
        await page.click("button:has-text('Save Changes')");
        await expect(page.locator('text=Lead Updated')).toBeVisible({ timeout: 10000 });

        console.log('Reloading to verify persistence...');
        await page.reload({ waitUntil: 'domcontentloaded' });

        const reloadedRow = page.locator('tr', { hasText: companyName }).first();
        await expect(reloadedRow).toBeVisible({ timeout: 10000 });
        await expect(reloadedRow).toContainText('Contacted');

        console.log('Verifying status in edit modal...');
        await reloadedRow.locator('button[title="View lead"]').click();
        await page.getByRole('button', { name: 'Edit Lead' }).click();
        await expect(page.locator('#edit-status')).toHaveValue('CONTACTED');
        console.log('Integration Test Passed!');
    });
});
