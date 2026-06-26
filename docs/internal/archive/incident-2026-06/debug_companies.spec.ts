import { test, expect } from '@playwright/test';
import { openAsAdmin, BASE_URL } from './auth';

test('Debug Company Create and Edit', async ({ page, context, request }) => {
    // Collect all browser console and page errors
    page.on('console', msg => console.log(`[BROWSER CONSOLE] [${msg.type()}]: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[BROWSER ERROR]: ${err.message}`));
    
    // Intercept all network responses to log errors
    page.on('response', async response => {
        const url = response.url();
        const request = response.request();
        if (request.method() === 'POST' || url.includes('/api/') || response.status() >= 400) {
            console.log(`[NETWORK RESPONSE] METHOD: ${request.method()} | URL: ${url} | STATUS: ${response.status()}`);
            try {
                const body = await response.text();
                console.log(`[NETWORK BODY]: ${body.slice(0, 1500)}`);
            } catch (error) {
                console.log(`[NETWORK BODY] could not read body: ${error}`);
            }
        }
    });

    await openAsAdmin(page, context, request);
    await page.goto(`${BASE_URL}/dashboard/companies`, { waitUntil: 'domcontentloaded' });
    
    await page.click("button:has-text('Add Company')");
    
    const timestamp = Date.now();
    const companyName = `Debug Company ${timestamp}`;
    const updatedCompanyName = `${companyName} Updated`;
    
    await page.fill('#company-name', companyName);
    await page.fill('#category', 'Software Services');
    await page.selectOption('#sector', 'IT');
    await page.fill('#location', 'Bangalore, IN');
    await page.fill('#website', 'https://debug-test.com');
    await page.selectOption('#hiring-type', 'PERMANENT');
    await page.selectOption('#source', 'REFERRAL');
    await page.fill('#assigned-coordinator', 'system');
    
    await page.fill('input[placeholder="Contact name"]', 'Primary Contact');
    await page.fill('input[placeholder="HR Manager"]', 'HR Director');
    await page.fill('input[placeholder="email@example.com"]', `debug-hr-${timestamp}@test.com`);
    await page.fill('input[placeholder="Phone number"]', '+919999900005');
    await page.fill('input[placeholder="https://www.linkedin.com/in/..."]', 'https://linkedin.com/in/debug-hr');
    
    console.log('Clicking Create Company...');
    await page.click("button:has-text('Create Company')");
    
    // Wait for the company card to be visible
    const companyCard = page.locator('article', { hasText: companyName }).first();
    await expect(companyCard).toBeVisible({ timeout: 15000 });
    console.log('Company created and verified in list.');
    
    // Edit company
    console.log('Clicking More options and Edit...');
    await companyCard.locator('button[aria-label="More options"]').click();
    await page.click('button:has-text("Edit")');
    
    // Inspect form field value of linkedin
    const linkedinValue = await page.inputValue('input[placeholder="https://www.linkedin.com/in/..."]');
    console.log(`Loaded LinkedIn value in Edit Form: "${linkedinValue}"`);
    
    await page.fill('#company-name', updatedCompanyName);
    
    // Fill the Category which is loaded as undefined due to database omission
    console.log('Filling Category...');
    await page.fill('#category', 'Software Services');
    
    // Fill the Assigned Coordinator which is loaded as empty due to database omission
    console.log('Filling Assigned Coordinator...');
    await page.fill('#assigned-coordinator', 'system');
    
    // Select the Primary radio button to satisfy frontend validation
    console.log('Selecting Primary contact radio button...');
    await page.check('input[name="primary-contact"]');
    
    // Use a different email to avoid unique constraint conflict
    await page.fill('input[placeholder="email@example.com"]', `debug-hr-updated-${timestamp}@test.com`);
    
    // If linkedin value is empty or anything, let's fill it with a valid URL
    await page.fill('input[placeholder="https://www.linkedin.com/in/..."]', 'https://linkedin.com/in/debug-hr-updated');
    
    console.log('Clicking Save Changes...');
    await page.click("button:has-text('Save Changes')");
    
    // Wait to see if any toast alert appears
    await page.waitForTimeout(5000);
    
    const toastError = page.locator('.toast-error, .alert, [role="alert"]');
    const count = await toastError.count();
    console.log(`Found ${count} alert/toast element(s).`);
    for (let i = 0; i < count; i++) {
        const text = await toastError.nth(i).innerText();
        console.log(`Alert/Toast Text [${i}]: ${text}`);
    }

    // Take screenshot to inspect visually
    await page.screenshot({ path: 'company-edit-debug-result.png' });
});

