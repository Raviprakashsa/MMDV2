import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface FileInfo {
  name: string;
  fullPath: string;
  size: number;
  lastModified: string;
  sha256: string;
}

function getSha256(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function processDirectory(dir: string, baseDir: string, fileList: FileInfo[] = []): FileInfo[] {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath, baseDir, fileList);
    } else {
      const relPath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      fileList.push({
        name: relPath,
        fullPath: fullPath.replace(/\\/g, '/'),
        size: stat.size,
        lastModified: stat.mtime.toISOString(),
        sha256: getSha256(fullPath)
      });
    }
  }
  return fileList;
}

// Target files:
// - scratch/backups/cosmos/*
// - postgres_backup.dump (which is inside scratch/backups/postgres_backup.dump)
// - containerapp_secrets.json (which is inside scratch/backups/containerapp_secrets.json)
// - resource_group_template.json (which is inside scratch/backups/resource_group_template.json)

const backupsDir = 'c:/Ravi/MY WORKS/MMD V2/scratch/backups';
const results: FileInfo[] = [];

// Get individual files directly
const targetFiles = [
  'postgres_backup.dump',
  'containerapp_secrets.json',
  'resource_group_template.json'
];

for (const tf of targetFiles) {
  const filePath = path.join(backupsDir, tf);
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    results.push({
      name: tf,
      fullPath: filePath.replace(/\\/g, '/'),
      size: stat.size,
      lastModified: stat.mtime.toISOString(),
      sha256: getSha256(filePath)
    });
  } else {
    console.log(`Missing file: ${filePath}`);
  }
}

// Get cosmos backups
const cosmosDir = path.join(backupsDir, 'cosmos');
if (fs.existsSync(cosmosDir)) {
  processDirectory(cosmosDir, cosmosDir, results);
} else {
  console.log('Cosmos backups directory not found!');
}

console.log(JSON.stringify(results, null, 2));
