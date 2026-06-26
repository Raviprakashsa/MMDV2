import { PrismaClient } from '@prisma/client'
import mongoose from 'mongoose'

const prisma = new PrismaClient()

async function checkPostgres() {
  console.log('--- Checking PostgreSQL Data ---')
  try {
    const tenantCount = await prisma.tenant.count()
    console.log(`Tenants: ${tenantCount}`)
    
    const userCount = await prisma.user.count()
    console.log(`Users: ${userCount}`)
    
    const companyCount = await prisma.company.count()
    console.log(`Companies: ${companyCount}`)
    
    const contactCount = await prisma.contact.count()
    console.log(`Contacts: ${contactCount}`)
    
    const leadCount = await prisma.lead.count()
    console.log(`Leads: ${leadCount}`)
    
    if (leadCount > 0) {
      const leads = await prisma.lead.findMany()
      console.log('Leads Details:')
      console.log(JSON.stringify(leads, null, 2))
    }
    
    const jpCount = await prisma.jobPosting.count()
    console.log(`Job Postings: ${jpCount}`)
    
    const candCount = await prisma.candidate.count()
    console.log(`Candidates: ${candCount}`)
    
    const appCount = await prisma.application.count()
    console.log(`Applications: ${appCount}`)
    
    const intCount = await prisma.interview.count()
    console.log(`Interviews: ${intCount}`)
    
    if (intCount > 0) {
      const interviews = await prisma.interview.findMany()
      console.log('Interviews Details:')
      console.log(JSON.stringify(interviews, null, 2))
    }
  } catch (error) {
    console.error('Error querying PostgreSQL:', error)
  }
}

async function checkMongo() {
  console.log('--- Checking MongoDB Data ---')
  try {
    const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/mmdss'
    await mongoose.connect(mongoUrl)
    console.log('Connected to MongoDB')
    
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('Collections in database:')
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments()
      console.log(` - ${col.name}: ${count} docs`)
      if (count > 0 && ['leads', 'interviews', 'candidates', 'companies'].includes(col.name)) {
        const docs = await mongoose.connection.db.collection(col.name).find().limit(5).toArray()
        console.log(`   Sample docs from ${col.name}:`)
        console.log(JSON.stringify(docs, null, 2))
      }
    }
  } catch (error) {
    console.error('Error querying MongoDB:', error)
  } finally {
    await mongoose.disconnect()
  }
}

async function main() {
  await checkPostgres()
  await checkMongo()
  await prisma.$disconnect()
}

main()
