import mongoose from 'mongoose';

const MONGO_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>';

async function main() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;
  const rawUsers = await db.collection('users').find({}).toArray();
  
  console.log(`Production MongoDB Users Count: ${rawUsers.length}`);
  rawUsers.forEach((u, i) => {
    console.log(`${i+1}. Email: ${u.email} | role: ${u.role} | isActive: ${u.isActive} | deletedAt: ${u.deletedAt}`);
  });
  
  await mongoose.disconnect();
}

main().catch(console.error);
