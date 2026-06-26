const mongoose = require('mongoose');

async function verify() {
  const connStr = 'mongodb://localhost:27017/mmd_restore_test';
  await mongoose.connect(connStr);
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  console.log('Collections in mmd_restore_test:');
  
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`- ${col.name}: ${count} docs`);
    
    if (count > 0 && ['users', 'candidates', 'companies', 'requirements'].includes(col.name)) {
      const sample = await db.collection(col.name).find().limit(1).toArray();
      console.log(`  Sample doc from ${col.name}:`);
      console.log(JSON.stringify(sample[0], null, 2));
    }
  }

  await mongoose.disconnect();
}

verify().catch(console.error);
