import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { signInAs } from './auth';
import connectDB from '../../lib/db/mongodb';
import User from '../../lib/db/models/User';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('MMD V2 ATS End-to-End & Tenant Isolation Integration Tests', () => {
  let tenantAPlanId: string;
  let tenantAId: string;
  let tenantBId: string;
  let interviewerAId: string;

  test.beforeAll(async () => {
    // Connect to MongoDB and seed users for NextAuth credentials authentication
    await connectDB();
    const hashedPwd = await hash('Admin123!', 12);
    
    await User.findOneAndUpdate(
      { email: 'interviewer-a@example.com' },
      {
        email: 'interviewer-a@example.com',
        password: hashedPwd,
        name: 'Interviewer A',
        role: 'RECRUITER',
        isActive: true,
        deletedAt: null,
      },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate(
      { email: 'interviewer-b@example.com' },
      {
        email: 'interviewer-b@example.com',
        password: hashedPwd,
        name: 'Interviewer B',
        role: 'RECRUITER',
        isActive: true,
        deletedAt: null,
      },
      { upsert: true, new: true }
    );

    // 1. Seed or find Starter plan
    let plan = await prisma.plan.findFirst({ where: { code: 'starter', deletedAt: null } });
    if (!plan) {
      plan = await prisma.plan.create({
        data: {
          code: 'starter',
          name: 'Starter Plan',
          tenantId: 'system',
        },
      });
    }
    tenantAPlanId = plan.id;

    // 2. Create Tenant A
    const tenantAObj = await prisma.tenant.upsert({
      where: { tenantId: 'tenant-A' },
      update: { deletedAt: null },
      create: {
        tenantId: 'tenant-A',
        slug: 'tenant-a',
        name: 'Tenant A',
        planId: tenantAPlanId,
      },
    });
    tenantAId = tenantAObj.id;

    // 3. Create Tenant B
    const tenantBObj = await prisma.tenant.upsert({
      where: { tenantId: 'tenant-B' },
      update: { deletedAt: null },
      create: {
        tenantId: 'tenant-B',
        slug: 'tenant-b',
        name: 'Tenant B',
        planId: tenantAPlanId,
      },
    });
    tenantBId = tenantBObj.id;

    // 4. Create Roles
    let roleA = await prisma.role.findFirst({ where: { tenantId: tenantAId, code: 'interviewer' } });
    if (!roleA) {
      roleA = await prisma.role.create({
        data: {
          tenantId: tenantAId,
          code: 'interviewer',
          name: 'Interviewer',
        },
      });
    }

    let roleB = await prisma.role.findFirst({ where: { tenantId: tenantBId, code: 'interviewer' } });
    if (!roleB) {
      roleB = await prisma.role.create({
        data: {
          tenantId: tenantBId,
          code: 'interviewer',
          name: 'Interviewer',
        },
      });
    }

    // 5. Create Interviewer Users in PostgreSQL
    const userA = await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenantAId, email: 'interviewer-a@example.com' } },
      update: { deletedAt: null },
      create: {
        tenantId: tenantAId,
        email: 'interviewer-a@example.com',
        name: 'Interviewer A',
        passwordHash: 'dummy',
        roleId: roleA.id,
      },
    });
    interviewerAId = userA.id;

    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenantBId, email: 'interviewer-b@example.com' } },
      update: { deletedAt: null },
      create: {
        tenantId: tenantBId,
        email: 'interviewer-b@example.com',
        name: 'Interviewer B',
        passwordHash: 'dummy',
        roleId: roleB.id,
      },
    });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test.beforeEach(async ({ request, context }) => {
    process.env.E2E_USE_SEEDED_USERS = '1';
    await signInAs(request, context, 'interviewer-a@example.com', 'Admin123!');
  });

  // --- JOB POSTINGS ---
  test('Job Posting CRUD & status transitions', async ({ request }) => {
    const headers = { 'x-tenant-id': tenantAId, 'x-user-id': 'user-1' };

    // 1. Create
    const createRes = await request.post(`${BASE_URL}/api/v1/job-postings`, {
      headers,
      data: {
        title: 'Software Engineer II',
        department: 'Engineering',
        location: 'Bengaluru, IN',
        employmentType: 'FULL_TIME',
        description: 'Excellent Next.js role',
        requirements: 'TypeScript and Prisma experience',
        status: 'DRAFT',
      },
    });
    expect(createRes.status()).toBe(200);
    const job = await createRes.json();
    expect(job.id).toBeTruthy();
    expect(job.status).toBe('DRAFT');

    // 2. Read
    const getRes = await request.get(`${BASE_URL}/api/v1/job-postings/${job.id}`, { headers });
    expect(getRes.status()).toBe(200);
    const fetchedJob = await getRes.json();
    expect(fetchedJob.title).toBe('Software Engineer II');

    // 3. Update & Status Transition (DRAFT -> OPEN)
    const patchRes = await request.patch(`${BASE_URL}/api/v1/job-postings/${job.id}`, {
      headers,
      data: {
        title: 'Senior Software Engineer II',
        status: 'OPEN',
      },
    });
    expect(patchRes.status()).toBe(200);
    const updatedJob = await patchRes.json();
    expect(updatedJob.title).toBe('Senior Software Engineer II');
    expect(updatedJob.status).toBe('OPEN');

    // 4. Status Transition (OPEN -> CLOSED)
    const closeRes = await request.patch(`${BASE_URL}/api/v1/job-postings/${job.id}`, {
      headers,
      data: { status: 'CLOSED' },
    });
    expect(closeRes.status()).toBe(200);
    const closedJob = await closeRes.json();
    expect(closedJob.status).toBe('CLOSED');

    // 5. Soft Delete
    const deleteRes = await request.delete(`${BASE_URL}/api/v1/job-postings/${job.id}`, { headers });
    expect(deleteRes.status()).toBe(200);

    // Verify Read fails on soft deleted job posting (returns 404)
    const checkDeletedRes = await request.get(`${BASE_URL}/api/v1/job-postings/${job.id}`, { headers });
    expect(checkDeletedRes.status()).toBe(404);
  });

  // --- CANDIDATES ---
  test('Candidate CRUD & Soft Delete', async ({ request }) => {
    const headers = { 'x-tenant-id': tenantAId, 'x-user-id': 'user-1' };
    const email = `candidate-${Date.now()}@example.com`;

    // 1. Create
    const createRes = await request.post(`${BASE_URL}/api/v1/candidates`, {
      headers,
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email,
        phone: '+919999999999',
        currentLocation: 'Delhi, IN',
        totalExperience: '5',
        currentCompany: 'Google',
        currentDesignation: 'SWE',
        resumeUrl: 'https://example.com/resume.pdf',
      },
    });
    expect(createRes.status()).toBe(200);
    const candidate = await createRes.json();
    expect(candidate.id).toBeTruthy();

    // 2. Read
    const getRes = await request.get(`${BASE_URL}/api/v1/candidates/${candidate.id}`, { headers });
    expect(getRes.status()).toBe(200);
    const fetchedCandidate = await getRes.json();
    expect(fetchedCandidate.email).toBe(email);

    // 3. Update
    const patchRes = await request.patch(`${BASE_URL}/api/v1/candidates/${candidate.id}`, {
      headers,
      data: { firstName: 'Johnny' },
    });
    expect(patchRes.status()).toBe(200);
    const updatedCandidate = await patchRes.json();
    expect(updatedCandidate.firstName).toBe('Johnny');

    // 4. Soft Delete
    const deleteRes = await request.delete(`${BASE_URL}/api/v1/candidates/${candidate.id}`, { headers });
    expect(deleteRes.status()).toBe(200);

    // Verify read fails on soft deleted candidate (returns 404)
    const checkDeletedRes = await request.get(`${BASE_URL}/api/v1/candidates/${candidate.id}`, { headers });
    expect(checkDeletedRes.status()).toBe(404);
  });

  // --- APPLICATIONS & WORKFLOW TRANSITIONS ---
  test('Applications status flow and invalid transitions', async ({ request }) => {
    const headers = { 'x-tenant-id': tenantAId, 'x-user-id': 'user-1' };

    // Setup helper data
    const jobRes = await request.post(`${BASE_URL}/api/v1/job-postings`, {
      headers,
      data: {
        title: 'Product Manager',
        department: 'Product',
        location: 'Remote',
        employmentType: 'FULL_TIME',
        description: 'Build MMD V2',
        requirements: 'Agile skills',
      },
    });
    const job = await jobRes.json();

    const candidateRes = await request.post(`${BASE_URL}/api/v1/candidates`, {
      headers,
      data: {
        firstName: 'Alice',
        lastName: 'Smith',
        email: `alice-${Date.now()}@example.com`,
        phone: '+918888888888',
        resumeUrl: 'https://example.com/alice.pdf',
      },
    });
    const candidate = await candidateRes.json();

    // 1. Create Application (Default: APPLIED)
    const appRes = await request.post(`${BASE_URL}/api/v1/applications`, {
      headers,
      data: {
        candidateId: candidate.id,
        jobPostingId: job.id,
      },
    });
    expect(appRes.status()).toBe(200);
    const application = await appRes.json();
    expect(application.status).toBe('APPLIED');

    // 2. Validate valid sequence: APPLIED -> SCREENING -> SHORTLISTED -> INTERVIEW -> OFFERED -> HIRED
    const transitions = ['SCREENING', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'HIRED'];
    for (const target of transitions) {
      const transRes = await request.post(`${BASE_URL}/api/v1/applications/${application.id}/status`, {
        headers,
        data: { status: target },
      });
      expect(transRes.status()).toBe(200);
      const updated = await transRes.json();
      expect(updated.status).toBe(target);
    }

    // 3. Verify terminal status change fails (reopening / changing from HIRED to SHORTLISTED is blocked)
    const invalidTransRes = await request.post(`${BASE_URL}/api/v1/applications/${application.id}/status`, {
      headers,
      data: { status: 'SHORTLISTED' },
    });
    expect(invalidTransRes.status()).toBe(409); // Conflict Error

    // Setup another app to test REJECTED and WITHDRAWN
    const candidate2Res = await request.post(`${BASE_URL}/api/v1/candidates`, {
      headers,
      data: {
        firstName: 'Bob',
        lastName: 'Jones',
        email: `bob-${Date.now()}@example.com`,
        phone: '+917777777777',
        resumeUrl: 'https://example.com/bob.pdf',
      },
    });
    const candidate2 = await candidate2Res.json();

    const app2Res = await request.post(`${BASE_URL}/api/v1/applications`, {
      headers,
      data: { candidateId: candidate2.id, jobPostingId: job.id },
    });
    const app2 = await app2Res.json();

    // APPLIED -> SCREENING
    await request.post(`${BASE_URL}/api/v1/applications/${app2.id}/status`, {
      headers,
      data: { status: 'SCREENING' },
    });

    // SCREENING -> REJECTED (Valid path)
    const rejectRes = await request.post(`${BASE_URL}/api/v1/applications/${app2.id}/status`, {
      headers,
      data: { status: 'REJECTED' },
    });
    expect(rejectRes.status()).toBe(200);

    // Setup third app to test WITHDRAWN
    const candidate3Res = await request.post(`${BASE_URL}/api/v1/candidates`, {
      headers,
      data: {
        firstName: 'Charlie',
        lastName: 'Brown',
        email: `charlie-${Date.now()}@example.com`,
        phone: '+916666666666',
        resumeUrl: 'https://example.com/charlie.pdf',
      },
    });
    const candidate3 = await candidate3Res.json();

    const app3Res = await request.post(`${BASE_URL}/api/v1/applications`, {
      headers,
      data: { candidateId: candidate3.id, jobPostingId: job.id },
    });
    const app3 = await app3Res.json();

    // APPLIED -> WITHDRAWN (Valid path from any state)
    const withdrawRes = await request.post(`${BASE_URL}/api/v1/applications/${app3.id}/status`, {
      headers,
      data: { status: 'WITHDRAWN' },
    });
    expect(withdrawRes.status()).toBe(200);
  });

  // --- INTERVIEWS & STATUS TRANSITIONS ---
  test('Interviews lifecycle & invalid transitions', async ({ request }) => {
    const headers = { 'x-tenant-id': tenantAId, 'x-user-id': 'user-1' };

    // Setup helper data
    const jobRes = await request.post(`${BASE_URL}/api/v1/job-postings`, {
      headers,
      data: {
        title: 'Database Administrator',
        department: 'IT',
        location: 'Mumbai, IN',
        employmentType: 'FULL_TIME',
        description: 'Manage PostgreSQL',
        requirements: 'Postgres expert',
      },
    });
    const job = await jobRes.json();

    const candidateRes = await request.post(`${BASE_URL}/api/v1/candidates`, {
      headers,
      data: {
        firstName: 'Diana',
        lastName: 'Prince',
        email: `diana-${Date.now()}@example.com`,
        phone: '+915555555555',
        resumeUrl: 'https://example.com/diana.pdf',
      },
    });
    const candidate = await candidateRes.json();

    const appRes = await request.post(`${BASE_URL}/api/v1/applications`, {
      headers,
      data: { candidateId: candidate.id, jobPostingId: job.id },
    });
    const application = await appRes.json();

    // 1. Create Interview (Default: SCHEDULED)
    const interviewRes = await request.post(`${BASE_URL}/api/v1/interviews`, {
      headers,
      data: {
        applicationId: application.id,
        interviewerId: interviewerAId,
        round: 1,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      },
    });
    expect(interviewRes.status()).toBe(200);
    const interview = await interviewRes.json();
    expect(interview.status).toBe('SCHEDULED');

    // 2. Validate SCHEDULED -> COMPLETED
    const completeRes = await request.post(`${BASE_URL}/api/v1/interviews/${interview.id}/status`, {
      headers,
      data: { status: 'COMPLETED' },
    });
    expect(completeRes.status()).toBe(200);
    const completed = await completeRes.json();
    expect(completed.status).toBe('COMPLETED');

    // 3. Verify terminal transition fails (COMPLETED -> CANCELLED)
    const invalidTransRes = await request.post(`${BASE_URL}/api/v1/interviews/${interview.id}/status`, {
      headers,
      data: { status: 'CANCELLED' },
    });
    expect(invalidTransRes.status()).toBe(409); // Conflict Error

    // Setup another interview to test SCHEDULED -> CANCELLED
    const interview2Res = await request.post(`${BASE_URL}/api/v1/interviews`, {
      headers,
      data: {
        applicationId: application.id,
        interviewerId: interviewerAId,
        round: 2,
        scheduledAt: new Date(Date.now() + 172800000).toISOString(),
      },
    });
    const interview2 = await interview2Res.json();

    const cancelRes = await request.post(`${BASE_URL}/api/v1/interviews/${interview2.id}/status`, {
      headers,
      data: { status: 'CANCELLED' },
    });
    expect(cancelRes.status()).toBe(200);

    // Setup third interview to test SCHEDULED -> NO_SHOW
    const interview3Res = await request.post(`${BASE_URL}/api/v1/interviews`, {
      headers,
      data: {
        applicationId: application.id,
        interviewerId: interviewerAId,
        round: 3,
        scheduledAt: new Date(Date.now() + 259200000).toISOString(),
      },
    });
    const interview3 = await interview3Res.json();

    const noShowRes = await request.post(`${BASE_URL}/api/v1/interviews/${interview3.id}/status`, {
      headers,
      data: { status: 'NO_SHOW' },
    });
    expect(noShowRes.status()).toBe(200);
  });

  // --- TENANT ISOLATION ---
  test('Tenant Isolation trace on JobPosting, Candidate, Application, Interview', async ({ request, context }) => {
    const headersA = { 'x-tenant-id': tenantAId, 'x-user-id': interviewerAId };
    const headersB = { 'x-tenant-id': tenantBId, 'x-user-id': 'user-2' };

    // --- JOB POSTING ISOLATION ---
    // Create a Job Posting under Tenant A (currently logged in as interviewer-a@example.com)
    const jobRes = await request.post(`${BASE_URL}/api/v1/job-postings`, {
      headers: headersA,
      data: {
        title: 'Isolation Test Job',
        department: 'Finance',
        location: 'Delhi',
        employmentType: 'FULL_TIME',
        description: 'Confidential finance role',
        requirements: 'Accounting skills',
      },
    });
    expect(jobRes.status()).toBe(200);
    const job = await jobRes.json();

    // Verify we can read it as Tenant A
    const getJobResA = await request.get(`${BASE_URL}/api/v1/job-postings/${job.id}`, { headers: headersA });
    expect(getJobResA.status()).toBe(200);

    // Header Spoofing check: Even if we send a spoofed Tenant B header, the backend
    // uses the session-derived context (Tenant A) and still allows access to Tenant A's job.
    const getJobSpoofRes = await request.get(`${BASE_URL}/api/v1/job-postings/${job.id}`, {
      headers: { 'x-tenant-id': tenantBId, 'x-user-id': 'user-2' },
    });
    expect(getJobSpoofRes.status()).toBe(200);

    // --- CANDIDATE ISOLATION ---
    // Create a Candidate under Tenant A
    const candRes = await request.post(`${BASE_URL}/api/v1/candidates`, {
      headers: headersA,
      data: {
        firstName: 'Secret',
        lastName: 'Agent',
        email: `secret-${Date.now()}@example.com`,
        phone: '+911111111111',
        resumeUrl: 'https://example.com/secret.pdf',
      },
    });
    expect(candRes.status()).toBe(200);
    const candidate = await candRes.json();

    // --- APPLICATION ISOLATION ---
    // Create an Application under Tenant A
    const appRes = await request.post(`${BASE_URL}/api/v1/applications`, {
      headers: headersA,
      data: { candidateId: candidate.id, jobPostingId: job.id },
    });
    expect(appRes.status()).toBe(200);
    const application = await appRes.json();

    // --- INTERVIEW ISOLATION ---
    // Create an Interview under Tenant A
    const interviewRes = await request.post(`${BASE_URL}/api/v1/interviews`, {
      headers: headersA,
      data: {
        applicationId: application.id,
        interviewerId: interviewerAId,
        round: 1,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      },
    });
    expect(interviewRes.status()).toBe(200);
    const interview = await interviewRes.json();

    // --- SWITCH SESSION TO TENANT B ---
    await signInAs(request, context, 'interviewer-b@example.com', 'Admin123!');

    // Tenant B cannot Read Job Posting of Tenant A
    const getJobRes = await request.get(`${BASE_URL}/api/v1/job-postings/${job.id}`, { headers: headersB });
    expect(getJobRes.status()).toBe(404);

    // Tenant B cannot bypass by spoofing headers to Tenant A's ID
    const getJobSpoofResB = await request.get(`${BASE_URL}/api/v1/job-postings/${job.id}`, {
      headers: { 'x-tenant-id': tenantAId, 'x-user-id': interviewerAId },
    });
    expect(getJobSpoofResB.status()).toBe(404);

    // Tenant B cannot Update Job Posting of Tenant A
    const patchJobRes = await request.patch(`${BASE_URL}/api/v1/job-postings/${job.id}`, {
      headers: headersB,
      data: { title: 'Hacked Job Title' },
    });
    expect(patchJobRes.status()).toBe(404);

    // Tenant B cannot Delete Job Posting of Tenant A
    const deleteJobRes = await request.delete(`${BASE_URL}/api/v1/job-postings/${job.id}`, { headers: headersB });
    expect(deleteJobRes.status()).toBe(404);

    // Tenant B cannot Read Candidate of Tenant A
    const getCandRes = await request.get(`${BASE_URL}/api/v1/candidates/${candidate.id}`, { headers: headersB });
    expect(getCandRes.status()).toBe(404);

    // Tenant B cannot Update Candidate of Tenant A
    const patchCandRes = await request.patch(`${BASE_URL}/api/v1/candidates/${candidate.id}`, {
      headers: headersB,
      data: { firstName: 'Hacked Candidate Name' },
    });
    expect(patchCandRes.status()).toBe(404);

    // Tenant B cannot Delete Candidate of Tenant A
    const deleteCandRes = await request.delete(`${BASE_URL}/api/v1/candidates/${candidate.id}`, { headers: headersB });
    expect(deleteCandRes.status()).toBe(404);

    // Tenant B cannot Read Application of Tenant A
    const getAppRes = await request.get(`${BASE_URL}/api/v1/applications/${application.id}`, { headers: headersB });
    expect(getAppRes.status()).toBe(404);

    // Tenant B cannot Update Application of Tenant A (status change)
    const postAppStatusRes = await request.post(`${BASE_URL}/api/v1/applications/${application.id}/status`, {
      headers: headersB,
      data: { status: 'SCREENING' },
    });
    expect(postAppStatusRes.status()).toBe(404);

    // Tenant B cannot Read Interview of Tenant A
    const getIntRes = await request.get(`${BASE_URL}/api/v1/interviews/${interview.id}`, { headers: headersB });
    expect(getIntRes.status()).toBe(404);

    // Tenant B cannot Update Interview of Tenant A (status change)
    const postIntStatusRes = await request.post(`${BASE_URL}/api/v1/interviews/${interview.id}/status`, {
      headers: headersB,
      data: { status: 'COMPLETED' },
    });
    expect(postIntStatusRes.status()).toBe(404);
  });
});
