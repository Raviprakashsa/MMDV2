import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const localConnectionString = "mongodb://localhost:27017/mmd_restore_test";

async function runRestore() {
  const backupDir = path.join(__dirname, 'backups', 'cosmos');
  const manifestPath = path.join(backupDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file not found at ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  console.log('Connecting to local MongoDB...');
  await mongoose.connect(localConnectionString);
  console.log('Connected successfully!');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database object is undefined');
  }

  // Clean the restore database first
  console.log('Cleaning existing collections in local restore database...');
  const existingCols = await db.listCollections().toArray();
  for (const colInfo of existingCols) {
    await db.collection(colInfo.name).drop();
    console.log(`Dropped collection: ${colInfo.name}`);
  }

  console.log('Starting restoration...');
  for (const colName of Object.keys(manifest)) {
    if (colName === 'test_users') continue; // Handled separately

    const filePath = path.join(backupDir, `${colName}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`Backup file not found for collection: ${colName}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const expectedCount = manifest[colName].count;

    console.log(`Restoring collection: ${colName} (Expected: ${expectedCount} docs)`);

    if (data.length > 0) {
      const collection = db.collection(colName);
      await collection.insertMany(data);
      const actualCount = await collection.countDocuments();
      if (actualCount !== expectedCount) {
        throw new Error(`Validation failed for ${colName}! Expected: ${expectedCount}, Restored: ${actualCount}`);
      }
      console.log(`✅ Restored ${actualCount} docs to ${colName}`);
    } else {
      // Create empty collection
      await db.createCollection(colName);
      console.log(`✅ Created empty collection: ${colName}`);
    }
  }

  console.log('Disconnecting from local restore database...');
  await mongoose.disconnect();

  // Restore test_users to test database
  const testConnectionString = "mongodb://localhost:27017/test_restore_test";
  console.log('Connecting to local test database...');
  await mongoose.connect(testConnectionString);
  const testDb = mongoose.connection.db;
  if (!testDb) {
    throw new Error('Test database object is undefined');
  }

  // Clean test collection
  try {
    await testDb.collection('users').drop();
  } catch (e) {}

  const testFilePath = path.join(backupDir, 'test_users.json');
  if (fs.existsSync(testFilePath)) {
    const testData = JSON.parse(fs.readFileSync(testFilePath, 'utf-8'));
    const expectedCount = manifest['test_users']?.count || 0;
    console.log(`Restoring test_users collection (Expected: ${expectedCount} docs)`);
    if (testData.length > 0) {
      await testDb.collection('users').insertMany(testData);
      const actualCount = await testDb.collection('users').countDocuments();
      if (actualCount !== expectedCount) {
        throw new Error(`Validation failed for test_users! Expected: ${expectedCount}, Restored: ${actualCount}`);
      }
      console.log(`✅ Restored ${actualCount} docs to test.users`);
    } else {
      await testDb.createCollection('users');
      console.log('✅ Created empty collection: users');
    }
  }

  console.log('Disconnecting from local test database...');
  await mongoose.disconnect();

  console.log('🎉 Cosmos DB Local Restoration Validation Complete!');
}

runRestore().catch(err => {
  console.error('❌ Restoration validation failed:', err);
  process.exit(1);
});
