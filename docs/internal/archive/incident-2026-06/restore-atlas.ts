import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Load connection string from CLI argument or environment variable
const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: Please provide the MongoDB Atlas connection string as a CLI argument or set the DATABASE_URL environment variable.');
  console.error('Usage: npx tsx scratch/restore-atlas.ts "mongodb+srv://username:password@cluster.mongodb.net/dbname"');
  process.exit(1);
}

// Ensure the dbName is set. If not, mongoose will connect to default database.
async function runRestore() {
  const backupDir = path.join(__dirname, 'backups', 'cosmos');
  const manifestPath = path.join(backupDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest file not found at ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  console.log('Connecting to target MongoDB Atlas database...');
  await mongoose.connect(connectionString);
  console.log('Connected successfully!');

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database object is undefined');
  }

  console.log('Cleaning existing collections in target database...');
  const existingCols = await db.listCollections().toArray();
  for (const colInfo of existingCols) {
    await db.collection(colInfo.name).drop();
    console.log(`Dropped collection: ${colInfo.name}`);
  }

  console.log('Starting restoration...');
  const report: Array<{ collection: string; expected: number; restored: number; status: string }> = [];

  for (const colName of Object.keys(manifest)) {
    if (colName === 'test_users') continue; // Test users usually go to test db, but we can restore if needed.

    const filePath = path.join(backupDir, `${colName}.json`);
    if (!fs.existsSync(filePath)) {
      console.warn(`Backup file not found for collection: ${colName}`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const expectedCount = manifest[colName].count;

    console.log(`Restoring collection: ${colName} (Expected: ${expectedCount} docs)`);

    let restoredCount = 0;
    if (data.length > 0) {
      const collection = db.collection(colName);
      await collection.insertMany(data);
      restoredCount = await collection.countDocuments();
    } else {
      await db.createCollection(colName);
    }

    const status = restoredCount === expectedCount ? '✅ Success' : '❌ Failed';
    report.push({ collection: colName, expected: expectedCount, restored: restoredCount, status });
    console.log(`${status} for ${colName}: Restored ${restoredCount}/${expectedCount}`);
  }

  console.log('\n--- Verification Health Check ---');
  // Check Companies
  const companyCount = await db.collection('companies').countDocuments();
  console.log(`Companies count: ${companyCount}`);
  if (companyCount > 0) {
    const sample = await db.collection('companies').findOne();
    console.log(`Company search test sample name: ${sample?.name || 'N/A'}`);
  }

  // Check Candidates
  const candidateCount = await db.collection('candidates').countDocuments();
  console.log(`Candidates count: ${candidateCount}`);
  if (candidateCount > 0) {
    const sample = await db.collection('candidates').findOne();
    console.log(`Candidate search test sample name: ${sample?.name || 'N/A'}`);
  }

  // Check Requirements
  const requirementCount = await db.collection('requirements').countDocuments();
  console.log(`Requirements count: ${requirementCount}`);
  if (requirementCount > 0) {
    const sample = await db.collection('requirements').findOne();
    console.log(`Requirement search test sample title: ${sample?.jobTitle || 'N/A'}`);
  }

  // Check Users
  const userCount = await db.collection('users').countDocuments();
  console.log(`Users count: ${userCount}`);
  if (userCount > 0) {
    const sample = await db.collection('users').findOne();
    console.log(`User login test sample email: ${sample?.email || 'N/A'}`);
  }

  console.log('\n--- Migration Report Card ---');
  console.table(report);

  console.log('Disconnecting from database...');
  await mongoose.disconnect();
  console.log('🎉 MongoDB Atlas Restoration Validation Complete!');
}

runRestore().catch(err => {
  console.error('❌ Restoration failed:', err);
  process.exit(1);
});
