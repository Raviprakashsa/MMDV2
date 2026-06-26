import mongoose from 'mongoose';

const MONGO_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>';

async function main() {
  await mongoose.connect(MONGO_URL);
  const db = mongoose.connection.db;
  const coll = db.collection('users');
  const indexes = await coll.indexes();
  console.log('Indexes on users collection:', JSON.stringify(indexes, null, 2));
  await mongoose.disconnect();
}

main().catch(console.error);
