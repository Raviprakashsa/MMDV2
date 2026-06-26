import mongoose from 'mongoose';

const MONGO_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>';

async function main() {
  console.log('Connecting to Cosmos DB...');
  await mongoose.connect(MONGO_URL);
  console.log('Connected.');

  const db = mongoose.connection.db;
  const coll = db.collection('users');

  console.log('Creating index on users collection: { createdAt: -1 }...');
  const result = await coll.createIndex({ createdAt: -1 });
  console.log('Index creation result:', result);

  console.log('\nListing current indexes to verify:');
  const indexes = await coll.indexes();
  console.log(JSON.stringify(indexes, null, 2));

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(console.error);
