// Configure environment variables for production BEFORE importing any services
process.env.DATABASE_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>';
process.env.POSTGRES_DATABASE_URL = '<REDACTED_AZURE_POSTGRES_CONNECTION_STRING>';

import { UserService } from '../lib/services/user.service';
import connectDB from '../lib/db/mongodb';

const adminContext = { id: 'admin-id', role: 'SUPER_ADMIN', tenantId: 'test-tenant' };

async function main() {
  await connectDB();
  const allUsers = await UserService.getAll(adminContext);
  console.log('Production Users Count:', allUsers.length);
  
  const bhavyashree = allUsers.find(u => u.email.toLowerCase() === 'bhavyashree@magnuscopo.com');
  console.log('Bhavyashree in production getAll:', bhavyashree);
  
  console.log('Production Users Emails:');
  allUsers.forEach(u => console.log(` - ${u.email} | role: ${u.role} | isActive: ${u.isActive}`));
}

main().catch(console.error).finally(() => process.exit());
