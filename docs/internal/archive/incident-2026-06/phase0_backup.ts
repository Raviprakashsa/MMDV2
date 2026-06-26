import { Client } from 'pg';
import mongoose from 'mongoose';
import * as fs from 'fs';
import * as path from 'path';

const POSTGRES_URL = '<REDACTED_AZURE_POSTGRES_CONNECTION_STRING>';
const MONGO_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>';

const BACKUP_DIR = path.join(__dirname, 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

async function main() {
  console.log('=== PHASE 0: BACKUP AND DRY-RUN ===');
  
  // 1. Connect to databases
  console.log('Connecting to PostgreSQL...');
  const pgClient = new Client({ connectionString: POSTGRES_URL });
  await pgClient.connect();
  
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;

  // 2. Fetch data
  console.log('Fetching PostgreSQL users...');
  const pgUsersRes = await pgClient.query('SELECT * FROM "User"');
  const pgUsers = pgUsersRes.rows;

  console.log('Fetching MongoDB users...');
  const mongoUsers = await db.collection('users').find({}).toArray();

  // 3. Write backups to file
  const pgBackupPath = path.join(BACKUP_DIR, `pg_users_backup_${Date.now()}.json`);
  fs.writeFileSync(pgBackupPath, JSON.stringify(pgUsers, null, 2));
  console.log(`✅ Saved PostgreSQL User table backup (${pgUsers.length} rows) to: ${pgBackupPath}`);

  // Identify orphaned users
  const pgEmails = new Set(pgUsers.map((u: any) => u.email.toLowerCase().trim()));
  const orphanedUsers = mongoUsers.filter((u: any) => !pgEmails.has(u.email.toLowerCase().trim()));

  const mongoBackupPath = path.join(BACKUP_DIR, `mongo_orphaned_users_backup_${Date.now()}.json`);
  fs.writeFileSync(mongoBackupPath, JSON.stringify(orphanedUsers, null, 2));
  console.log(`✅ Saved MongoDB orphaned users backup (${orphanedUsers.length} rows) to: ${mongoBackupPath}`);

  // 4. Generate Dry-run Report
  console.log('\n--- DRY-RUN MIGRATION REPORT ---');
  console.log(`Total Affected (Orphaned) Users: ${orphanedUsers.length}`);
  
  const roleCodeMappings: Record<string, string> = {
    'SUPER_ADMIN': 'super_admin',
    'ADMIN': 'admin',
    'COORDINATOR': 'coordinator',
    'RECRUITER': 'recruiter',
    'SCRAPER': 'scraper'
  };

  // Check roles in PG
  const rolesRes = await pgClient.query('SELECT * FROM "Role" WHERE "tenantId" = \'cmq4ub3oq001vtm1sbihbpnxc\'');
  const pgRoles = rolesRes.rows;
  console.log('\nAvailable Roles for System Tenant in PostgreSQL:');
  pgRoles.forEach((r: any) => console.log(` - Code: ${r.code} | ID: ${r.id}`));

  console.log('\nSimulated User Role Mapping:');
  orphanedUsers.forEach((u: any, idx: number) => {
    const mongoRole = u.role;
    const mappedRoleCode = roleCodeMappings[mongoRole] || mongoRole.toLowerCase();
    const pgRoleMatch = pgRoles.find((r: any) => r.code === mappedRoleCode);
    
    console.log(`${idx+1}. User: ${u.email}`);
    console.log(`   - Mongo ID: ${u._id.toString()}`);
    console.log(`   - Mongo Role: ${mongoRole}`);
    console.log(`   - Mapped Role Code: ${mappedRoleCode}`);
    if (pgRoleMatch) {
      console.log(`   - Destination Role ID: ${pgRoleMatch.id} (Existing Role)`);
    } else {
      console.log(`   - Destination Role ID: Will be created as new Role (code: ${mappedRoleCode})`);
    }
  });

  await pgClient.end();
  await mongoose.disconnect();
  console.log('\nPHASE 0 completed successfully.');
}

main().catch(console.error);
