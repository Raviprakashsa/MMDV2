import { prisma } from '@/lib/prisma';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

async function main() {
  // Get latest PostgreSQL user
  const pgUser = await prisma.user.findFirst({
    orderBy: { createdAt: 'desc' },
    where: { deletedAt: null },
  });
  console.log('PostgreSQL latest user:', pgUser);

  if (!pgUser) return;

  await connectDB();
  const mongoUser = await User.findOne({ email: pgUser.email }).lean();
  console.log('Mongo user for same email:', mongoUser);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
