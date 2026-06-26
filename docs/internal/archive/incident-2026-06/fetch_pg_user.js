const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('ts-node').register({ transpileOnly: true });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const email = 'test_new_user_1780912858863@magnuscopo.com';
    const pgUser = await prisma.user.findFirst({
      where: { email },
      select: { id:true, email:true, tenantId:true, status:true, deletedAt:true },
    });
    console.log('--- PostgreSQL User ---');
    console.log(pgUser);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
})();
