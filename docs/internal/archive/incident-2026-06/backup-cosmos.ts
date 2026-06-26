import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const connectionString = "<REDACTED_AZURE_COSMOS_CONNECTION_STRING>";

async function runBackup() {
  const backupDir = path.join(__dirname, 'backups', 'cosmos');
  fs.mkdirSync(backupDir, { recursive: true });

  console.log('Connecting to Cosmos DB mmdss database...');
  await mongoose.connect(connectionString);
  console.log('Connected successfully!');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database object is undefined');
  }
  const collections = await db.listCollections().toArray();
  const manifest: { [key: string]: { count: number; sizeBytes: number } } = {};

  console.log(`Found ${collections.length} collections in mmdss. Starting backup...`);

  for (const colInfo of collections) {
    const colName = colInfo.name;
    console.log(`Backing up collection: ${colName}...`);
    const collection = db.collection(colName);
    const documents = await collection.find({}).toArray();

    const filePath = path.join(backupDir, `${colName}.json`);
    const dataString = JSON.stringify(documents, null, 2);
    fs.writeFileSync(filePath, dataString, 'utf-8');

    const stats = fs.statSync(filePath);
    manifest[colName] = {
      count: documents.length,
      sizeBytes: stats.size
    };
    console.log(`Saved ${documents.length} docs to ${colName}.json (${(stats.size / 1024).toFixed(2)} KB)`);
  }

  console.log('Disconnecting from mmdss...');
  await mongoose.disconnect();

  const testConnectionString = "<REDACTED_AZURE_COSMOS_CONNECTION_STRING>";
  console.log('Connecting to Cosmos DB test database...');
  await mongoose.connect(testConnectionString);
  const testDb = mongoose.connection.db;
  if (!testDb) {
    throw new Error('Test database object is undefined');
  }
  
  console.log('Backing up test.users collection...');
  const testUsers = await testDb.collection('users').find({}).toArray();
  const testFilePath = path.join(backupDir, 'test_users.json');
  fs.writeFileSync(testFilePath, JSON.stringify(testUsers, null, 2), 'utf-8');
  const testStats = fs.statSync(testFilePath);
  manifest['test_users'] = {
    count: testUsers.length,
    sizeBytes: testStats.size
  };
  console.log(`Saved ${testUsers.length} docs to test_users.json (${(testStats.size / 1024).toFixed(2)} KB)`);

  fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
  console.log('Backup manifest saved successfully.');

  await mongoose.disconnect();
  console.log('Cosmos DB backup complete!');
}

runBackup().catch(err => {
  console.error('Backup failed:', err);
  process.exit(1);
});
