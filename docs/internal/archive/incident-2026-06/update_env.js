const fs = require('fs');
const path = require('path');

const connStr = process.argv[2];
if (!connStr) {
  console.error('❌ Error: Please provide the connection string.');
  process.exit(1);
}

const envPath = 'c:/Ravi/MY WORKS/MMD V2/.env';
if (!fs.existsSync(envPath)) {
  console.error(`❌ Error: .env file not found at ${envPath}`);
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

// Replace DATABASE_URL lines
envContent = envContent.replace(/DATABASE_URL=.*?\n/g, `DATABASE_URL="${connStr}"\n`);
envContent = envContent.replace(/DATABASE_URL\s*=\s*".*?"/g, `DATABASE_URL="${connStr}"`);

fs.writeFileSync(envPath, envContent, 'utf8');
console.log('✅ Updated DATABASE_URL in .env file successfully.');

console.log('\nTo update Azure Container App secret, run this command:');
console.log(`az containerapp secret set --name mmd-recruit-crm --resource-group mmd-recruit-india-rg --secrets "database-url=${connStr}"`);
