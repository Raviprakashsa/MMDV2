import { Client } from 'pg';
import mongoose from 'mongoose';

const POSTGRES_URL = '<REDACTED_AZURE_POSTGRES_CONNECTION_STRING>';
const MONGO_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>';

async function main() {
  console.log('=== PostgreSQL ===');
  const pgClient = new Client({ connectionString: POSTGRES_URL });
  await pgClient.connect();
  const pgRes = await pgClient.query('SELECT * FROM "User" WHERE LOWER(email) = LOWER($1)', ['bhavyashree@magnuscopo.com']);
  console.log('PostgreSQL Rows:', pgRes.rows);
  
  if (pgRes.rows.length > 0) {
    const user = pgRes.rows[0];
    console.log('PostgreSQL User Detail:');
    console.log(' - id:', user.id);
    console.log(' - email:', user.email);
    console.log(' - status:', user.status);
    console.log(' - roleId:', user.roleId);
    console.log(' - tenantId:', user.tenantId);
    console.log(' - deletedAt:', user.deletedAt);
    console.log(' - createdAt:', user.createdAt);
    
    // Fetch role details
    const roleRes = await pgClient.query('SELECT * FROM "Role" WHERE id = $1', [user.roleId]);
    console.log('PostgreSQL Role Detail:', roleRes.rows[0]);
  } else {
    console.log('PostgreSQL: NO RECORD FOUND');
  }
  await pgClient.end();

  console.log('\n=== MongoDB ===');
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;
  const mongoUser = await db.collection('users').findOne({ email: /bhavyashree@magnuscopo.com/i });
  console.log('MongoDB User Document:', mongoUser);
  await mongoose.disconnect();
}

main().catch(console.error);
