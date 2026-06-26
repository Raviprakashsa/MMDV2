import { UserService } from '../lib/services/user.service';
import connectDB from '../lib/db/mongodb';

const adminContext = { id: 'admin-id', role: 'SUPER_ADMIN', tenantId: 'test-tenant' };

async function main() {
  await connectDB();
  const allUsers = await UserService.getAll(adminContext);
  console.log('All Users Count:', allUsers.length);
  const bhavyashree = allUsers.find(u => u.email.toLowerCase() === 'bhavyashree@magnuscopo.com');
  console.log('Found Bhavyashree in getAll result:', bhavyashree);
}

main().catch(console.error).finally(() => process.exit());
