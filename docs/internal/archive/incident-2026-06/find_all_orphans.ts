import { Client } from 'pg';
import mongoose from 'mongoose';

const POSTGRES_URL = '<REDACTED_AZURE_POSTGRES_CONNECTION_STRING>';
const MONGO_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>';

async function main() {
  // 1. Connect to databases
  console.log('Connecting to PostgreSQL...');
  const pgClient = new Client({ connectionString: POSTGRES_URL });
  await pgClient.connect();
  
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  
  // 2. Fetch all users from PostgreSQL
  const pgRes = await pgClient.query('SELECT id, email FROM "User"');
  const pgEmails = new Set(pgRes.rows.map((r: any) => r.email.toLowerCase().trim()));
  
  // 3. Fetch all users from MongoDB
  const db = mongoose.connection.db;
  const mongoUsers = await db.collection('users').find({}).toArray();
  
  console.log('\n--- FINDING ORPHANED USERS ---');
  console.log(`Total MongoDB Users: ${mongoUsers.length}`);
  console.log(`Total PostgreSQL Users: ${pgRes.rows.length}`);
  console.log('--------------------------------------------------\n');
  
  const orphans: any[] = [];
  
  for (const mUser of mongoUsers) {
    const email = mUser.email.toLowerCase().trim();
    const existsInPg = pgEmails.has(email);
    
    if (!existsInPg) {
      orphans.push({
        email: mUser.email,
        mongoId: mUser._id.toString(),
        role: mUser.role,
        createdAt: mUser.createdAt ? mUser.createdAt.toISOString() : 'N/A',
        exists: 'NO'
      });
    } else {
      console.log(`User exists in both: ${mUser.email} (Mongo ID: ${mUser._id.toString()})`);
    }
  }
  
  console.log('\n==================================================');
  console.log('ORPHANED USERS TABLE/LIST');
  console.log('==================================================');
  orphans.forEach(o => {
    console.log(`Email: ${o.email}`);
    console.log(`Mongo ID: ${o.mongoId}`);
    console.log(`Role: ${o.role}`);
    console.log(`Created Date: ${o.createdAt}`);
    console.log(`Exists in PostgreSQL?: ${o.exists}`);
    console.log('--------------------------------------------------');
  });

  await pgClient.end();
  await mongoose.disconnect();
}

main().catch(console.error);
