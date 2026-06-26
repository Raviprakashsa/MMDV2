require('ts-node/register');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const connectDB = require('./lib/db/mongodb').default;
const User = require('./lib/db/models/User').default;

(async () => {
  const pgUser = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
  console.log('PG_USER', JSON.stringify(pgUser, null, 2));
  if (!pgUser) { console.log('No PostgreSQL user found'); process.exit(); }
  await connectDB();
  const mongoUser = await User.findOne({ email: pgUser.email }).lean();
  console.log('MONGO_USER', JSON.stringify(mongoUser, null, 2));
  process.exit();
})();
