import { test, expect } from '@playwright/test';
import { openAsAdmin, BASE_URL } from './auth';

test.describe('MMD Recruit CRM Live Production CRUD Validation', () => {
    test.beforeEach(async ({ page, context, request }) => {
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.error(`[BROWSER CONSOLE ERROR]: ${msg.text()}`);
            }
        });
        page.on('pageerror', err => {
            console.error(`[BROWSER UNCAUGHT ERROR]: ${err.message}`);
        });

        await openAsAdmin(page, context, request);
    });

    test('Production Feature CRUD Audit Matrix', async ({ page }) => {
        const timestamp = Date.now();
        const companyName = `Audit Corp ${timestamp}`;
        const updatedCompanyName = `${companyName} Updated`;
        const reqTitle = `Audit Requirement ${timestamp}`;
        const updatedReqTitle = `${reqTitle} Updated`;
        const candidateFirstName = `AudCandidate${timestamp}`;
        const candidateEmail = `audit-candidate-${timestamp}@magnuscopo.com`;
        const hrContactFirstName = `AudContact${timestamp}`;
        const hrContactEmail = `audit-contact-${timestamp}@magnuscopo.com`;
        const userEmail = `audit-user-${timestamp}@magnuscopo.com`;

        console.log('=================================================');
        console.log('STARTING MANUAL FEATURE AUDIT SEQUENTIAL STEPS');
        console.log('=================================================');

        // 1. Companies Module
        console.log('Module: Companies');
        await page.goto(`${BASE_URL}/dashboard/companies`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1').first()).toContainText('Companies');
        
        console.log('Action: Create Company');
        await page.click("button:has-text('Add Company')");
        await page.fill('#company-name', companyName);
        await page.fill('#category', 'Verification Agency');
        await page.selectOption('#sector', 'IT');
        await page.fill('#location', 'Delhi, IN');
        await page.fill('#website', 'https://audit-test.magnuscopo.com');
        await page.selectOption('#hiring-type', 'CONTRACT');
        await page.selectOption('#source', 'REFERRAL');
        await page.fill('#assigned-coordinator', 'system');
        await page.fill('input[placeholder="Contact name"]', 'Primary Auditor');
        await page.fill('input[placeholder="HR Manager"]', 'Audits Lead');
        await page.fill('input[placeholder="email@example.com"]', `audit-hr-${timestamp}@magnuscopo.com`);
        await page.fill('input[placeholder="Phone number"]', '+91 9999900021');
        await page.fill('input[placeholder="https://www.linkedin.com/in/..."]', 'https://linkedin.com/in/audit-lead');
        await page.click("button:has-text('Create Company')");
        
        console.log('Action: Verify persistence & database write');
        const companyCard = page.locator('article', { hasText: companyName }).first();
        await expect(companyCard).toBeVisible({ timeout: 15000 });

        console.log('Action: Edit Company');
        await companyCard.locator('button[aria-label="More options"]').click();
        await page.click('button:has-text("Edit")');
        await page.fill('#company-name', updatedCompanyName);
        await page.fill('#category', 'Verification Agency');
        await page.fill('#assigned-coordinator', 'system');
        await page.check('input[name="primary-contact"]');
        await page.fill('input[placeholder="email@example.com"]', `audit-hr-updated-${timestamp}@magnuscopo.com`);
        await page.fill('input[placeholder="https://www.linkedin.com/in/..."]', 'https://linkedin.com/in/audit-lead');
        await page.click("button:has-text('Save Changes')");
        
        console.log('Action: Refresh page & check persistence');
        await page.reload({ waitUntil: 'domcontentloaded' });
        const updatedCompanyCard = page.locator('article', { hasText: updatedCompanyName }).first();
        await expect(updatedCompanyCard).toBeVisible({ timeout: 15000 });
        console.log('Companies: PASS');

        // 2. Contacts Module
        console.log('Module: Contacts');
        await page.goto(`${BASE_URL}/contacts`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1').first()).toContainText('HR Contacts');

        console.log('Action: Create Contact');
        await page.click("text=Add Contact");
        await page.selectOption('#companyId', { label: updatedCompanyName });
        await page.fill('#firstName', hrContactFirstName);
        await page.fill('#lastName', 'Verification');
        await page.fill('#email', hrContactEmail);
        await page.fill('#phone', '+91 9999900022');
        await page.fill('#title', 'Hiring Manager');
        await page.click("button:has-text('Save Contact')");

        console.log('Action: Verify persistence & database write');
        const contactCard = page.locator('article', { hasText: hrContactFirstName }).first();
        await expect(contactCard).toBeVisible({ timeout: 15000 });

        console.log('Action: Edit Contact');
        await contactCard.locator('text=View Details').click();
        await page.click('button:has-text("Edit")');
        await page.fill('#lastName', 'VerificationUpdated');
        await page.click("button:has-text('Save Changes')");

        console.log('Action: Refresh page & check persistence');
        await page.goto(`${BASE_URL}/contacts`, { waitUntil: 'domcontentloaded' });
        await page.reload({ waitUntil: 'domcontentloaded' });
        const updatedContactCard = page.locator('article', { hasText: hrContactFirstName }).first();
        await expect(updatedContactCard).toBeVisible({ timeout: 15000 });
        await expect(updatedContactCard).toContainText('VerificationUpdated');
        console.log('Contacts: PASS');

        // 3. Leads Module
        console.log('Module: Leads');
        await page.goto(`${BASE_URL}/dashboard/leads`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1').first()).toContainText('Leads Management');

        console.log('Action: Create Lead');
        await page.click("button:has-text('New Lead')");
        await page.selectOption('#create-source', 'LinkedIn');
        await page.fill('#create-company', `Lead Corp ${timestamp}`);
        await page.selectOption('#create-sector', 'IT');
        await page.fill('#create-confidence', '85');
        await page.fill('#create-contact-name', 'AudLead Contact');
        await page.fill('#create-phone', '+91 9999900023');
        await page.fill('#create-email', `lead-${timestamp}@magnuscopo.com`);
        await page.click("button:has-text('Add Lead')");

        console.log('Action: Verify persistence & database write');
        const leadRow = page.locator('tr', { hasText: `Lead Corp ${timestamp}` }).first();
        await expect(leadRow).toBeVisible({ timeout: 15000 });

        console.log('Action: Edit Lead');
        await leadRow.locator('button[title="View lead"]').click();
        await page.getByRole('button', { name: 'Edit Lead' }).click();
        await page.selectOption('#edit-status', 'CONTACTED');
        await page.click("button:has-text('Save Changes')");

        console.log('Action: Refresh page & check persistence');
        await page.reload({ waitUntil: 'domcontentloaded' });
        const updatedLeadRow = page.locator('tr', { hasText: `Lead Corp ${timestamp}` }).first();
        await expect(updatedLeadRow).toBeVisible({ timeout: 15000 });
        await expect(updatedLeadRow).toContainText('Contacted');
        console.log('Leads: PASS');

        // 4. Requirements Module
        console.log('Module: Requirements');
        await page.goto(`${BASE_URL}/dashboard/requirements`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1').first()).toContainText('Requirements');

        console.log('Action: Create Requirement');
        await page.click("button:has-text('Add Requirement')");
        await page.fill('#req-title', reqTitle);
        await page.click('button:has-text("Select a company")');
        await page.fill('input[placeholder="Search companies..."]', updatedCompanyName);
        await page.click(`button:has-text("${updatedCompanyName}")`);
        await page.locator('dialog div:has(label[for="req-priority"]) select').selectOption('High');
        await page.fill('#req-location', 'Delhi, IN');
        await page.fill('#req-budget', '₹12L - ₹18L');
        await page.fill('#req-openings', '2');
        await page.locator('dialog div:has(label[for="req-status"]) select').selectOption('ACTIVE');
        await page.locator('dialog div:has(label[for="req-location-type"]) select').selectOption('Hybrid');
        await page.locator('dialog div:has(label[for="req-group"]) select').selectOption('RASHMI');
        await page.fill('#req-skills', 'Next.js, TailwindCSS, Zod');
        await page.fill('#req-exp-min', '2');
        await page.fill('#req-exp-max', '6');
        await page.fill('#req-description', 'Audit Verification requirement containing detailed description string.');
        await page.click("button:has-text('Create Requirement')");

        console.log('Action: Verify persistence & database write');
        const reqCard = page.locator('div.group', { hasText: reqTitle }).first();
        await expect(reqCard).toBeVisible({ timeout: 15000 });

        console.log('Action: Edit Requirement');
        await reqCard.locator('button[aria-label="More options"]').click();
        await page.click('button:has-text("Edit")');
        await page.fill('#req-title', updatedReqTitle);
        await page.click("button:has-text('Save Changes')");

        console.log('Action: Refresh page & check persistence');
        await page.reload({ waitUntil: 'domcontentloaded' });
        const updatedReqCard = page.locator('div.group', { hasText: updatedReqTitle }).first();
        await expect(updatedReqCard).toBeVisible({ timeout: 15000 });
        console.log('Requirements: PASS');

        // 5. Candidates Module
        console.log('Module: Candidates');
        await page.goto(`${BASE_URL}/ats/candidates`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1').first()).toContainText('Candidate Directory');

        console.log('Action: Create Candidate');
        await page.click("button:has-text('Add Candidate')");
        await page.fill('input[name="firstName"]', candidateFirstName);
        await page.fill('input[name="lastName"]', 'Auditor');
        await page.fill('input[name="email"]', candidateEmail);
        await page.fill('input[name="phone"]', '+91 9999900024');
        await page.fill('input[name="currentLocation"]', 'Chennai, IN');
        await page.fill('input[name="totalExperience"]', '5');
        await page.fill('input[name="currentCompany"]', 'Quality Labs');
        await page.fill('input[name="currentDesignation"]', 'QA Engineer');
        await page.fill('input[name="resumeUrl"]', 'https://audit-test.magnuscopo.com/resume.pdf');
        await page.click("button:has-text('Register Candidate')");

        console.log('Action: Verify persistence & database write');
        const candRow = page.locator('tr', { hasText: candidateFirstName }).first();
        await expect(candRow).toBeVisible({ timeout: 15000 });

        console.log('Action: Edit Candidate');
        await candRow.locator('button:has-text("Edit")').click();
        await page.fill('input[name="lastName"]', 'AuditorUpdated');
        await page.click("button:has-text('Save Profile')");

        console.log('Action: Refresh page & check persistence');
        await page.reload({ waitUntil: 'domcontentloaded' });
        const updatedCandRow = page.locator('tr', { hasText: candidateFirstName }).first();
        await expect(updatedCandRow).toBeVisible({ timeout: 15000 });
        await expect(updatedCandRow).toContainText('AuditorUpdated');
        console.log('Candidates: PASS');

        // 6. Applications Module
        console.log('Module: Applications');
        await page.goto(`${BASE_URL}/ats/applications`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1').first()).toContainText('Application Pipelines');

        console.log('Action: Register Application');
        await page.click("button:has-text('Register Application')");
        // Select candidate name
        await page.selectOption('select[name="candidateId"]', { label: `${candidateFirstName} AuditorUpdated (${candidateEmail})` });
        // Select first job posting
        await page.selectOption('select[name="jobPostingId"]', { index: 1 });
        await page.click("button:has-text('Submit Application')");

        console.log('Action: Verify persistence & database write');
        await page.goto(`${BASE_URL}/ats/applications`, { waitUntil: 'domcontentloaded' });
        await page.click('button[aria-label="Table View"]');
        const appRow = page.locator('tr', { hasText: candidateFirstName }).first();
        await expect(appRow).toBeVisible({ timeout: 15000 });
        console.log('Applications: PASS');

        // 7. Interviews Module
        console.log('Module: Interviews');
        await page.goto(`${BASE_URL}/ats/interviews`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1').first()).toContainText('Interview Schedules');

        console.log('Action: Schedule Interview');
        await page.click("button:has-text('Schedule Interview')");
        await page.selectOption('select[name="applicationId"]', { index: 1 });
        await page.selectOption('select[name="interviewerId"]', { index: 1 });
        await page.fill('input[type="number"]', '1');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0] + 'T11:00';
        await page.fill('input[type="datetime-local"]', tomorrowStr);
        await page.click("button:has-text('Schedule Interview')");

        console.log('Action: Verify persistence & database write');
        await page.goto(`${BASE_URL}/ats/interviews`, { waitUntil: 'domcontentloaded' });
        await page.click('button[aria-label="Table View"]');
        const intRow = page.locator('tr', { hasText: candidateFirstName }).first();
        await expect(intRow).toBeVisible({ timeout: 15000 });
        console.log('Interviews: PASS');

        // 8. Placements Module
        console.log('Module: Placements');
        await page.goto(`${BASE_URL}/dashboard/placements`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1').first()).toContainText('Placements');

        console.log('Action: Record Placement');
        await page.click("button:has-text('New Placement')");
        await page.selectOption('select[name="candidateId"]', { label: `${candidateFirstName} AuditorUpdated` });
        await page.selectOption('select[name="requirementId"]', { index: 1 });
        await page.selectOption('select[name="status"]', 'OFFERED');
        const joiningDate = new Date().toISOString().split('T')[0];
        await page.fill('input[type="date"]', joiningDate);
        await page.fill('input[type="number"]', '20000');
        await page.click("button:has-text('Create Placement')");

        console.log('Action: Verify persistence & database write');
        await page.goto(`${BASE_URL}/dashboard/placements`, { waitUntil: 'domcontentloaded' });
        const placementRow = page.locator('tr', { hasText: candidateFirstName }).first();
        await expect(placementRow).toBeVisible({ timeout: 15000 });
        console.log('Placements: PASS');

        // 9. Users Module
        console.log('Module: Users');
        await page.goto(`${BASE_URL}/dashboard/users`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1').first()).toContainText('User Management');

        console.log('Action: Create User');
        await page.click("button:has-text('Invite User')");
        await page.fill('#user-email', userEmail);
        await page.fill('#user-name', 'Audit Recruiter');
        await page.fill('#user-password', 'AuditRecruiter123!');
        await page.selectOption('#user-role', 'RECRUITER');
        await page.click("button:has-text('Create')");

        console.log('Action: Verify persistence & database write');
        await page.reload({ waitUntil: 'domcontentloaded' });
        const userRow = page.locator('tr', { hasText: userEmail }).first();
        await expect(userRow).toBeVisible({ timeout: 15000 });
        console.log('Users: PASS');
    });

    test('Mobile Viewport Audit Suite', async ({ page }) => {
        const viewports = [320, 375, 390, 414, 768];
        const pagesToTest = [
            '/dashboard/companies',
            '/dashboard/requirements',
            '/dashboard/leads',
            '/contacts',
            '/ats/candidates',
            '/ats/applications',
            '/ats/interviews',
            '/dashboard/placements',
            '/dashboard/users'
        ];

        console.log('=================================================');
        console.log('STARTING MOBILE RESPONSIVE AUDITS');
        console.log('=================================================');

        for (const vp of viewports) {
            await page.setViewportSize({ width: vp, height: 800 });
            for (const path of pagesToTest) {
                const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
                expect(response?.status()).toBe(200);
                await expect(page.locator('h1:visible').first()).toBeVisible({ timeout: 10000 });
                console.log(`Viewport ${vp}px: Page ${path} loaded successfully.`);
            }
        }
        console.log('Mobile viewports audit passed.');
    });
});
