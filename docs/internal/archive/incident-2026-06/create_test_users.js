// create_test_users.js
// This script creates three new users (Recruiter, Coordinator, Scrapper) using the UserService
// and then verifies their records in PostgreSQL and MongoDB, as well as login capability.

import { UserService } from '@/lib/services/user.service';
import { prisma } from '@/lib/prisma'; // assumes prisma client export
import connectDB from '@/lib/db/mongodb';

// Helper to generate a timestamped email
function generateEmail(prefix) {
  const ts = Date.now();
  return `${prefix}_${ts}@magnuscopo.com`;
}

async function main() {
  const adminContext = { id: 'admin-id', role: 'SUPER_ADMIN', tenantId: 'test-tenant' };
  await connectDB();

  const users = [
    { role: 'RECRUITER', prefix: 'test_recruiter' },
    { role: 'COORDINATOR', prefix: 'test_coordinator' },
    { role: 'SCRAPER', prefix: 'test_scrapper' },
  ];

  console.log('--- Creating Users ---');
  for (const u of users) {
    const email = generateEmail(u.prefix);
    const password = 'Passw0rd!';
    const name = u.prefix + '_name';
    const created = await UserService.create(adminContext, {
      email,
      password,
      name,
      role: u.role,
    });
    console.log('\nCreated:', created);

    // Fetch from PostgreSQL
    const pgUser = await prisma.user.findFirst({
      where: { email },
      select: { id: true, email: true, status: true, deletedAt: true },
    });
    console.log('PostgreSQL:', pgUser);

    // Fetch from MongoDB (already connected)
    const { default: User } = await import('@/lib/db/models/User');
    const mongoUser = await User.findOne({ email }).lean();
    console.log('MongoDB:', {
      _id: mongoUser?._id?.toString(),
      email: mongoUser?.email,
      isActive: mongoUser?.isActive,
      deletedAt: mongoUser?.deletedAt,
    });

    // Attempt login via auth action
    const { loginAction } = await import('@/lib/actions/module1-auth');
    const loginResult = await loginAction({ email, password });
    console.log('Login result:', loginResult);
  }

  // Verify visibility via UserService.getAll
  const allUsers = await UserService.getAll(adminContext);
  console.log('\nAll visible users count:', allUsers.length);
  console.log('Sample visible user emails:', allUsers.slice(-3).map(u => u.email));
}

main()
  .catch(err => {
    console.error('Error in script:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
    process.exit();
  });
