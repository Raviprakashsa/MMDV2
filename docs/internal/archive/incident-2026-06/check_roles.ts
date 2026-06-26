import { Client } from 'pg';

const POSTGRES_URL = '<REDACTED_AZURE_POSTGRES_CONNECTION_STRING>';

async function main() {
  const pgClient = new Client({ connectionString: POSTGRES_URL });
  await pgClient.connect();
  
  console.log('=== Tenants ===');
  const tenants = await pgClient.query('SELECT * FROM "Tenant"');
  console.log(tenants.rows);

  console.log('\n=== Roles ===');
  const roles = await pgClient.query('SELECT * FROM "Role"');
  console.log(roles.rows);
  
  await pgClient.end();
}

main().catch(console.error);
