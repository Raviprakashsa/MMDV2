const mongoose = require('mongoose');
const connStr = process.env.DATABASE_URL;
if (!connStr) {
  throw new Error('DATABASE_URL must be set');
}

async function run() {
  console.log("Connecting to Cosmos DB...");
  await mongoose.connect(connStr);
  console.log("Connected!");

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log("Collections in DB:", collections.map(c => c.name));

  const indexesToCreate = [
    { collection: 'auditlogs', index: { createdAt: -1 } },
    { collection: 'companies', index: { updatedAt: -1 } },
    { collection: 'companies', index: { mouEndDate: 1 } },
    { collection: 'candidates', index: { offeredAt: 1 } },
    { collection: 'requirements', index: { updatedAt: -1 } },
    { collection: 'activities', index: { nextFollowUpDate: 1 } },
    { collection: 'apikeys', index: { createdAt: -1 } },
    { collection: 'candidates', index: { createdAt: -1 } },
    { collection: 'companies', index: { createdAt: -1 } },
    { collection: 'documents', index: { createdAt: -1 } },
    { collection: 'exportjobs', index: { createdAt: -1 } },
    { collection: 'invoices', index: { invoiceNumber: -1 } },
    { collection: 'invoices', index: { createdAt: -1 } },
    { collection: 'leads', index: { createdAt: -1 } },
    { collection: 'notifications', index: { createdAt: -1 } },
    { collection: 'placements', index: { createdAt: -1 } },
    { collection: 'reportschedules', index: { createdAt: -1 } },
    { collection: 'requirements', index: { createdAt: -1 } },
    { collection: 'templates', index: { updatedAt: -1 } },
    { collection: 'timesheets', index: { date: 1 } },
    { collection: 'timesheets', index: { date: -1 } },
    { collection: 'webhooks', index: { createdAt: 1 } },
    { collection: 'webhooks', index: { createdAt: -1 } },
  ];

  for (const item of indexesToCreate) {
    console.log(`Creating index in ${item.collection} for`, item.index);
    try {
      const coll = db.collection(item.collection);
      await coll.createIndex(item.index);
      console.log(`  Successfully created index for ${item.collection}`);
    } catch (err) {
      console.error(`  Error creating index for ${item.collection}:`, err.message);
    }
  }

  console.log("\nListing indexes of key collections to verify:\n");
  for (const collName of ['auditlogs', 'companies', 'candidates', 'requirements', 'activities']) {
    try {
      const coll = db.collection(collName);
      const indexes = await coll.indexes();
      console.log(`Indexes for ${collName}:`, JSON.stringify(indexes, null, 2));
    } catch (err) {
      console.error(`Error listing indexes for ${collName}:`, err.message);
    }
  }

  await mongoose.disconnect();
  console.log("Disconnected!");
}

run().catch(console.error);
