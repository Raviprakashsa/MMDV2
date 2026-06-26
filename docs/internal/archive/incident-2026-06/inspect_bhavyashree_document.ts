import mongoose from 'mongoose'

const MONGO_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>'

async function main() {
  console.log('Connecting to MongoDB...')
  await mongoose.connect(MONGO_URL)
  console.log('Connected.')

  const db = mongoose.connection.db
  const coll = db.collection('users')
  
  // Find bhavyashree
  const doc = await coll.findOne({ email: /bhavyashree/i })
  console.log('bhavyashree document:', doc)

  // Find all documents where email = bhavyashree to see if there are multiple or if there is another collection
  const allDocs = await coll.find({}).toArray()
  console.log('\nTotal documents in collection users:', allDocs.length)
  
  const found = allDocs.find(d => d.email && d.email.toLowerCase() === 'bhavyashree@magnuscopo.com')
  console.log('Found Bhavyashree in allDocs by exact match:', found)
  
  // Print keys of bhavyashree document if found
  if (found) {
    console.log('Keys:', Object.keys(found))
    for (const key of Object.keys(found)) {
      console.log(`  - ${key}: ${JSON.stringify(found[key])} (${typeof found[key]})`)
    }
  }

  await mongoose.disconnect()
}

main().catch(console.error).finally(() => process.exit());
