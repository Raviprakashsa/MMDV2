import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';

const POSTGRES_URL = process.env.POSTGRES_DATABASE_URL;
const MONGO_URL = process.env.DATABASE_URL;

if (!POSTGRES_URL || !MONGO_URL) {
  throw new Error("Missing POSTGRES_DATABASE_URL or DATABASE_URL in environment.");
}

const SYSTEM_TENANT_ID = 'cmq4ub3oq001vtm1sbihbpnxc';

const roleCodeMappings: Record<string, string> = {
  'SUPER_ADMIN': 'super_admin',
  'ADMIN': 'admin',
  'COORDINATOR': 'coordinator',
  'RECRUITER': 'recruiter',
  'SCRAPER': 'scraper'
};

async function main() {
  console.log('=== STARTING ORPHANED USERS MIGRATION ===');
  
  // Initialize DB clients directly with production URLs
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: POSTGRES_URL,
      },
    },
  });

  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  // 1. Fetch current users from PostgreSQL
  const pgUsers = await prisma.user.findMany({
    select: { email: true }
  });
  const pgEmails = new Set(pgUsers.map(u => u.email.toLowerCase().trim()));

  // 2. Fetch all users from MongoDB
  const mongoUsers = await db.collection('users').find({}).toArray();

  // 3. Find missing users
  const orphanedUsers = mongoUsers.filter(u => !pgEmails.has(u.email.toLowerCase().trim()));

  console.log(`Found ${orphanedUsers.length} orphaned MongoDB users to migrate.`);

  let migratedCount = 0;
  const migratedList: string[] = [];

  for (const mUser of orphanedUsers) {
    const email = mUser.email.toLowerCase().trim();
    const mongoRole = mUser.role || 'RECRUITER';
    const roleCode = roleCodeMappings[mongoRole] || mongoRole.toLowerCase();

    console.log(`\nMigrating: ${email} | role: ${mongoRole} (mapped to code: ${roleCode})`);

    // 3.1 Get or Create Role in PostgreSQL
    let role = await prisma.role.findFirst({
      where: { tenantId: SYSTEM_TENANT_ID, code: roleCode, deletedAt: null }
    });

    if (!role) {
      console.log(`  Role code '${roleCode}' not found. Creating in PostgreSQL...`);
      role = await prisma.role.create({
        data: {
          tenantId: SYSTEM_TENANT_ID,
          code: roleCode,
          name: roleCode.charAt(0).toUpperCase() + roleCode.slice(1),
        }
      });
      console.log(`  Created Role ID: ${role.id}`);
    }

    // 3.2 Create User in PostgreSQL
    try {
      const pgUser = await prisma.user.create({
        data: {
          tenantId: SYSTEM_TENANT_ID,
          email: email,
          passwordHash: mUser.password, // Preserve bcrypt hash
          name: mUser.name || 'Migrated User',
          roleId: role.id,
          status: 'ACTIVE',
          createdAt: mUser.createdAt || new Date(),
        }
      });
      console.log(`  Successfully synced user to PostgreSQL. User ID: ${pgUser.id}`);
      migratedCount++;
      migratedList.push(email);
    } catch (err: any) {
      console.error(`  ❌ Failed to migrate user ${email}:`, err.message);
    }
  }

  console.log('\n================ MIGRATION REPORT ================');
  console.log(`Total Migrated: ${migratedCount} / ${orphanedUsers.length}`);
  console.log('Migrated Users:');
  migratedList.forEach(email => console.log(` - ${email}`));
  console.log('==================================================');

  await prisma.$disconnect();
  await mongoose.disconnect();
}

main().catch(console.error);
