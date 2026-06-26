// run_validation.ts
// Validation script for pre-deployment user visibility bug fix

import { UserService } from '../lib/services/user.service';
import { prisma } from '../lib/prisma';
import connectDB from '../lib/db/mongodb';
import { loginAction } from '../lib/actions/module1-auth';
import UserModel from '../lib/db/models/User';

function timestampedEmail(prefix: string) {
  const ts = Date.now();
  return `${prefix}_${ts}@magnuscopo.com`;
}

async function main() {
  const adminContext = { id: 'admin-id', role: 'SUPER_ADMIN', tenantId: 'test-tenant' };
  await connectDB();

  const roles = [
    { role: 'RECRUITER', prefix: 'test_recruiter' },
    { role: 'COORDINATOR', prefix: 'test_coordinator' },
    { role: 'SCRAPER', prefix: 'test_scrapper' },
  ];

  const createdUsers: any[] = [];

  for (const { role, prefix } of roles) {
    const email = timestampedEmail(prefix);
    const password = 'Passw0rd!';
    const name = `${prefix}_name`;
    console.log('\n=== Creating', role, email, '===');
    const created = await UserService.create(adminContext, { email, password, name, role });
    console.log('Created (UserService):', created);

    // PostgreSQL record
    const pgUser = await prisma.user.findFirst({ where: { email }, select: { id: true, email: true, status: true, deletedAt: true } });
    console.log('PostgreSQL record:', pgUser);

    // MongoDB record
    const mongoUser = await UserModel.findOne({ email }).lean();
    console.log('MongoDB record:', {
      _id: mongoUser?._id?.toString(),
      email: mongoUser?.email,
      isActive: mongoUser?.isActive,
      deletedAt: mongoUser?.deletedAt,
    });

    // Login test
    const loginRes = await loginAction({ email, password });
    console.log('Login result:', loginRes);

    // Duplicate attempt
    try {
      await UserService.create(adminContext, { email, password, name, role });
      console.log('Duplicate creation succeeded unexpectedly');
    } catch (err: any) {
      console.log('Duplicate creation error (expected):', err.message);
    }

    createdUsers.push({ email, role });
  }

  // Verify visibility via UserService.getAll
  const allVisible = await UserService.getAll(adminContext);
  console.log('\nAll visible users (latest 5):', allVisible.slice(-5).map((u: any) => u.email));
}

main()
  .catch(err => {
    console.error('Validation script error:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
    process.exit();
  });
