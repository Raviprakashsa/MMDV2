import { Client } from 'pg';
import { compare } from 'bcryptjs';

const POSTGRES_URL = '<REDACTED_AZURE_POSTGRES_CONNECTION_STRING>';

async function main() {
  console.log('=== Verifying bcrypt Password Matching for Migrated Users ===');
  const pgClient = new Client({ connectionString: POSTGRES_URL });
  await pgClient.connect();

  const testCases = [
    { email: 'admin_limited@magnuscopo.com', password: 'Admin123!' },
    { email: 'scraper@magnuscopo.com', password: 'Scraper123!' }
  ];

  for (const tc of testCases) {
    const res = await pgClient.query('SELECT * FROM "User" WHERE LOWER(email) = LOWER($1)', [tc.email]);
    if (res.rows.length === 0) {
      console.log(`❌ User ${tc.email} not found in PostgreSQL!`);
      continue;
    }
    const user = res.rows[0];
    const isMatch = await compare(tc.password, user.passwordHash);
    console.log(`User: ${tc.email}`);
    console.log(`  - Found: YES (ID: ${user.id})`);
    console.log(`  - Password Validated: ${isMatch ? '✅ MATCH SUCCESSFUL' : '❌ MATCH FAILED'}`);
  }

  await pgClient.end();
}

main().catch(console.error);
