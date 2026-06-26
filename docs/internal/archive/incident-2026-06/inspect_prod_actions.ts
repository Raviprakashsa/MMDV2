import mongoose from 'mongoose';
import { Client } from 'pg';

const PROD_MONGO_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>';
const PROD_POSTGRES_URL = '<REDACTED_AZURE_POSTGRES_CONNECTION_STRING>';

async function main() {
  // Force override process.env to ensure any subsequent import or call uses production
  process.env.DATABASE_URL = PROD_MONGO_URL;
  process.env.POSTGRES_DATABASE_URL = PROD_POSTGRES_URL;

  // Now import the service and database helper
  const { UserService } = await import('../lib/services/user.service');
  const connectDB = (await import('../lib/db/mongodb')).default;

  await connectDB();
  
  const adminContext = { id: 'admin-id', role: 'SUPER_ADMIN', tenantId: 'test-tenant' };
  
  // Let's call UserService.getAll
  const serviceUsers = await UserService.getAll(adminContext);
  console.log('Production Users from service:', serviceUsers.length);
  serviceUsers.forEach((u, i) => {
    console.log(`${i+1}. Email: ${u.email} | role: ${u.role} | isActive: ${u.isActive}`);
  });

  const bhavyashree = serviceUsers.find(u => u.email.toLowerCase() === 'bhavyashree@magnuscopo.com');
  console.log('\nBhavyashree in service list:', bhavyashree);
}

main().catch(console.error).finally(() => process.exit());
