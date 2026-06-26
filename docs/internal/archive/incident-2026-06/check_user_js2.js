require('ts-node/register');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const connectDB = require('../lib/db/mongodb.ts').default;
const User = require('../lib/db/models/User.ts').default;

(async () => {
  // Find the user we created recently. For demo, fetch any user that is not system.
  const pgUser = await prisma.user.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!pgUser) {
    console.log('No PostgreSQL user found');
    process.exit(0);
  }
  console.log('PostgreSQL user:', JSON.stringify(pgUser, null, 2));

  await connectDB();
  const mongoUser = await User.findOne({ email: pgUser.email }).lean();
  console.log('MongoDB user:', mongoUser ? JSON.stringify(mongoUser, null, 2) : 'Not found');
})();
