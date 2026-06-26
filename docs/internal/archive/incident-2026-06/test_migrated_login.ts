process.env.DATABASE_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>';
process.env.POSTGRES_DATABASE_URL = '<REDACTED_AZURE_POSTGRES_CONNECTION_STRING>';

import { loginAction } from '../lib/actions/module1-auth';

async function main() {
  console.log('=== Testing Login for Migrated Users ===');
  
  // Test 1: admin_limited@magnuscopo.com
  console.log('Testing login for admin_limited@magnuscopo.com...');
  const res1 = await loginAction({ email: 'admin_limited@magnuscopo.com', password: 'Admin123!' });
  console.log('Result 1:', res1);

  // Test 2: scraper@magnuscopo.com
  console.log('Testing login for scraper@magnuscopo.com...');
  const res2 = await loginAction({ email: 'scraper@magnuscopo.com', password: 'Scraper123!' });
  console.log('Result 2:', res2);
}

main().catch(console.error).finally(() => process.exit());
