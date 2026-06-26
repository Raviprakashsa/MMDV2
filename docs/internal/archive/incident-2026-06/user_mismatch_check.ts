import { prisma } from '@/lib/prisma';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';

async function main() {
  // Fetch all PostgreSQL users (non-deleted)
  const pgUsers = await prisma.user.findMany({
    where: { deletedAt: null },
    select: { id: true, email: true, tenantId: true, roleId: true, status: true },
  });
  console.log('PostgreSQL users count:', pgUsers.length);

  await connectDB();
  // Fetch all Mongo users (active)
  const mongoUsers = await User.find({ deletedAt: null }).select('email _id').lean();
  const mongoMap = new Map(mongoUsers.map(u => [u.email.toLowerCase(), u._id.toString()]));

  console.log('Mongo users count:', mongoUsers.length);

  for (const pg of pgUsers) {
    const mongoId = mongoMap.get(pg.email.toLowerCase());
    if (!mongoId) {
      console.log('Missing in Mongo ->', pg);
    }
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
