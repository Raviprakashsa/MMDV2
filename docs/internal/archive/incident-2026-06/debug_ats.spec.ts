import { test } from '@playwright/test';
import { openAsAdmin, BASE_URL } from './auth';

test('Debug ATS Pages', async ({ page, context, request }) => {
    page.on('console', msg => console.log(`[BROWSER CONSOLE] [${msg.type()}]: ${msg.text()}`));
    page.on('pageerror', err => console.error(`[BROWSER ERROR]: ${err.message}`));
    
    page.on('response', async response => {
        const url = response.url();
        console.log(`[NETWORK RESPONSE] URL: ${url} | STATUS: ${response.status()}`);
    });

    await openAsAdmin(page, context, request);
    
    console.log('Navigating to /ats/candidates...');
    const response = await page.goto(`${BASE_URL}/ats/candidates`, { waitUntil: 'domcontentloaded' });
    console.log(`Page Navigation Status: ${response?.status()}`);
    
    const title = await page.title();
    console.log(`Page Title: ${title}`);
    
    const bodyText = await page.innerText('body');
    console.log(`Page Body Text Snippet: ${bodyText.slice(0, 1000)}`);
    
    await page.screenshot({ path: 'ats-debug-candidates.png' });
});
