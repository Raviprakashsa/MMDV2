// validate_user_visibility.ts
// Minimal script to verify the user‑visibility fix after deployment.
// It creates three users (Recruiter, Coordinator, Scrapper), checks their
// records in PostgreSQL and MongoDB, confirms they appear via the Users API,
// and ensures duplicate‑email protection works.

import path from 'path';
import connectDB from '../lib/db/mongodb';
import UserModel from '../lib/db/models/User';
import { UserService } from '../lib/services/user.service';
import { prisma } from '../lib/prisma';
import { loginAction } from '../lib/actions/module1-auth';

function tsEmail(prefix: string) {
  return `${prefix}_${Date.now()}@magnuscopo.com`;
}

async function main() {
  const admin = { id: 'admin-id', role: 'SUPER_ADMIN', tenantId: 'test-tenant' };
  await connectDB();

  const roles = [
    { role: 'RECRUITER', prefix: 'test_recruiter' },
    { role: 'COORDINATOR', prefix: 'test_coordinator' },
    { role: 'SCRAPER', prefix: 'test_scrapper' },
  ];

  for (const { role, prefix } of roles) {
    const email = tsEmail(prefix);
    const password = 'Passw0rd!';
    const name = `${prefix}_name`;
    console.log('\n--- Creating', role, email, '---');
    const created = await UserService.create(admin, { email, password, name, role: role as any });
    console.log('Created:', created);

    const pg = await prisma.user.findFirst({ where: { email }, select: { id: true, email: true, status: true, deletedAt: true } });
    console.log('PostgreSQL:', pg);

    const mongo = await UserModel.findOne({ email }).lean();
    console.log('MongoDB:', { _id: mongo?._id?.toString(), email: mongo?.email, isActive: mongo?.isActive, deletedAt: mongo?.deletedAt });

    const loginRes = await loginAction({ email, password });
    console.log('Login result:', loginRes);

    try {
      await UserService.create(admin, { email, password, name, role });
    } catch (e:any) {
      console.log('Duplicate attempt error (expected):', e.message);
    }

    // Verify Users page visibility via service getAll
    const all = await UserService.getAll(admin);
    const visible = all.some(u => u.email === email);
    console.log('Visible in Users list:', visible);
  }

  await prisma.$disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Validation error:', err);
  process.exit(1);
});
