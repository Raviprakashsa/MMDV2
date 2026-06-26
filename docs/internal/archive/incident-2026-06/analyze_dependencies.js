const fs = require('fs');
const path = require('path');

const projectDir = 'c:/Ravi/MY WORKS/MMD V2';
const targetDirs = ['app', 'lib', 'components'];

const results = [];

function scanDir(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (['node_modules', '.next', '.git', '.venv', 'scratch'].includes(item)) continue;
      scanDir(fullPath);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      
      let usesMongoose = false;
      let usesMongoModels = false;
      let dependencies = [];

      if (content.includes('mongoose')) {
        usesMongoose = true;
        dependencies.push('Mongoose');
      }
      if (content.includes('/db/models/') || content.includes('/db/mongodb')) {
        usesMongoModels = true;
        dependencies.push('Mongo Models / MongoDB Connection');
      }

      if (usesMongoose || usesMongoModels) {
        const relPath = path.relative(projectDir, fullPath).replace(/\\/g, '/');
        results.push({
          file: relPath,
          dependency: dependencies.join(', '),
          impact: 'Critical failure. The file directly queries Legacy MongoDB / Cosmos DB. Deleting Cosmos DB will result in runtime errors (e.g. connection timeouts or undefined model exceptions).'
        });
      }
    }
  }
}

for (const d of targetDirs) {
  const fullPath = path.join(projectDir, d);
  if (fs.existsSync(fullPath)) {
    scanDir(fullPath);
  }
}

fs.writeFileSync('scratch/dependencies.json', JSON.stringify(results, null, 2));
console.log(`Found ${results.length} files with MongoDB/Cosmos dependencies. Saved to scratch/dependencies.json.`);
