import mongoose from 'mongoose'
process.env.DATABASE_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>';
process.env.POSTGRES_DATABASE_URL = '<REDACTED_AZURE_POSTGRES_CONNECTION_STRING>';

import { UserService } from '../lib/services/user.service';
import connectDB from '../lib/db/mongodb';
import UserModel from '../lib/db/models/User';

const adminContext = { id: 'admin-id', role: 'SUPER_ADMIN', tenantId: 'test-tenant' };

async function main() {
  await connectDB();
  
  const rawUsers = await mongoose.connection.db.collection('users').find({}).toArray();
  const mongooseUsers = await UserModel.find({ deletedAt: null }).lean();
  const serviceUsers = await UserService.getAll(adminContext);
  
  console.log('--- Raw MongoDB Users (15) ---');
  rawUsers.forEach((u, i) => {
    console.log(`${i+1}. Email: ${u.email} | role: ${u.role} | isActive: ${u.isActive} | deletedAt: ${u.deletedAt}`);
  });

  console.log('\n--- Mongoose model Users ---');
  mongooseUsers.forEach((u, i) => {
    console.log(`${i+1}. Email: ${u.email} | role: ${u.role} | isActive: ${u.isActive} | deletedAt: ${u.deletedAt}`);
  });

  console.log('\n--- Service Users (13) ---');
  serviceUsers.forEach((u, i) => {
    console.log(`${i+1}. Email: ${u.email} | role: ${u.role} | isActive: ${u.isActive}`);
  });

  console.log('\nDifference raw vs service:');
  const serviceEmails = new Set(serviceUsers.map(u => u.email.toLowerCase()));
  const missing = rawUsers.filter(u => !serviceEmails.has(u.email.toLowerCase()));
  missing.forEach(u => {
    console.log(`Missing user: ${u.email} | doc:`, u);
  });
}

main().catch(console.error).finally(() => process.exit());
