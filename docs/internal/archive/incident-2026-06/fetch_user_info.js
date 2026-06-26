const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('ts-node').register({ transpileOnly: true });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const connectDB = require(path.join(__dirname, '..', 'lib', 'db', 'mongodb')).default;
const UserMongo = require(path.join(__dirname, '..', 'lib', 'db', 'models', 'User')).default;

(async () => {
  try {
    await connectDB();
    const mongoId = '6a2692db17e6f1f82b69cd62';
    const mongoUser = await UserMongo.findById(mongoId).lean();
    if (!mongoUser) {
      console.log('Mongo user not found');
    } else {
      console.log('--- MongoDB User ---');
      console.log({
        _id: mongoUser._id?.toString(),
        email: mongoUser.email,
        tenantId: mongoUser.tenantId,
        isActive: mongoUser.isActive,
        deletedAt: mongoUser.deletedAt,
      });
    }
    if (mongoUser && mongoUser.email) {
      const pgUser = await prisma.user.findUnique({
        where: { email: mongoUser.email },
        select: { id: true, email: true, tenantId: true, status: true, deletedAt: true },
      });
      console.log('--- PostgreSQL User ---');
      console.log(pgUser);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
})();
