import { Client } from 'pg';
import mongoose from 'mongoose';

const POSTGRES_URL = '<REDACTED_AZURE_POSTGRES_CONNECTION_STRING>';
const MONGO_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>';

async function main() {
  console.log('=== Checking MongoDB Audit Logs ===');
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;
  
  const auditLogs = await db.collection('auditlogs').find({
    entityId: '6a268747afe63a07033dbc20'
  }).toArray();
  console.log('MongoDB Audit Logs for entityId bhavyashree:', auditLogs);

  const creationAudits = await db.collection('auditlogs').find({
    action: 'USER_CREATED'
  }).toArray();
  console.log('All USER_CREATED audits:', creationAudits);

  await mongoose.disconnect();

  console.log('\n=== Checking PostgreSQL Audit Logs ===');
  const pgClient = new Client({ connectionString: POSTGRES_URL });
  await pgClient.connect();
  
  const pgRes = await pgClient.query('SELECT * FROM "AuditLog" WHERE "changesJson"::text LIKE $1', ['%bhavyashree%']);
  console.log('PostgreSQL Audits containing bhavyashree:', pgRes.rows);
  
  await pgClient.end();
}

main().catch(console.error);
