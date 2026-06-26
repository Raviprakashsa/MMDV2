const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const files = [
  'postgres_backup.dump',
  'containerapp_secrets.json',
  'resource_group_template.json'
];
const dir = 'c:/Ravi/MY WORKS/MMD V2/scratch/backups';

const results = [];
for (const f of files) {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    const hash = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
    results.push({
      name: f,
      path: p.replace(/\\/g, '/'),
      size: stat.size,
      lastModified: stat.mtime.toISOString(),
      sha256: hash
    });
  } else {
    results.push({
      name: f,
      error: 'File not found'
    });
  }
}

console.log(JSON.stringify(results, null, 2));
