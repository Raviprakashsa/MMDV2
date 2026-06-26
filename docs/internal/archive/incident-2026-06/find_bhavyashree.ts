import { Client } from 'pg'
import mongoose from 'mongoose'

const POSTGRES_URL = '<REDACTED_AZURE_POSTGRES_CONNECTION_STRING>'
const MONGO_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>'

async function findInPostgres() {
  console.log('--- Querying PostgreSQL ---')
  const client = new Client({ connectionString: POSTGRES_URL })
  await client.connect()

  const query = `
    SELECT 
      u.id, 
      u.email, 
      u.status, 
      r.code as role, 
      u."tenantId", 
      u."deletedAt", 
      u."createdAt"
    FROM "User" u
    LEFT JOIN "Role" r ON u."roleId" = r.id
    WHERE LOWER(u.email) = LOWER($1)
  `
  const res = await client.query(query, ['bhavyashree@magnuscopo.com'])
  console.log('PostgreSQL Result:', res.rows)
  await client.end()
}

async function findInMongo() {
  console.log('--- Querying MongoDB ---')
  await mongoose.connect(MONGO_URL)
  
  const db = mongoose.connection.db
  const user = await db.collection('users').findOne({ email: /bhavyashree@magnuscopo.com/i })
  console.log('MongoDB Result:', user)
  await mongoose.disconnect()
}

async function main() {
  try {
    await findInPostgres()
    await findInMongo()
  } catch (err) {
    console.error('Error running search:', err)
  }
}

main()
