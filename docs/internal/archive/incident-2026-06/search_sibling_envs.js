const fs = require('fs');
const path = require('path');

const parentDir = 'c:/Ravi/MY WORKS';
const dirs = fs.readdirSync(parentDir);

for (const d of dirs) {
  const fullPath = path.join(parentDir, d);
  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    // Check for .env file
    const envPath = path.join(fullPath, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      if (content.includes('mongodb+srv')) {
        console.log(`Found mongodb+srv in ${envPath}:`);
        const matches = content.match(/mongodb\+srv:\/\/[^\s"']+/g);
        console.log(matches);
      }
    }
    const envLocalPath = path.join(fullPath, '.env.local');
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, 'utf8');
      if (content.includes('mongodb+srv')) {
        console.log(`Found mongodb+srv in ${envLocalPath}:`);
        const matches = content.match(/mongodb\+srv:\/\/[^\s"']+/g);
        console.log(matches);
      }
    }
  }
}
console.log('Search in siblings complete.');
