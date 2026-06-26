import { Client } from 'pg';

const POSTGRES_URL = '<REDACTED_AZURE_POSTGRES_CONNECTION_STRING>';

async function main() {
  const pgClient = new Client({ connectionString: POSTGRES_URL });
  await pgClient.connect();
  
  const res = await pgClient.query(`
    SELECT u.id, u.email, u.status, u."tenantId", u."deletedAt", u."createdAt", r.code as role_code 
    FROM "User" u 
    LEFT JOIN "Role" r ON u."roleId" = r.id
  `);
  
  console.log(`Production PostgreSQL Users Count: ${res.rows.length}`);
  res.rows.forEach((row: any, i) => {
    console.log(`${i+1}. Email: ${row.email} | status: ${row.status} | role: ${row.role_code} | tenantId: ${row.tenantId} | deletedAt: ${row.deletedAt}`);
  });
  
  await pgClient.end();
}

main().catch(console.error);
