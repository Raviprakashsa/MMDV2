const fs = require('fs');
const path = require('path');

const cosmosDir = 'c:/Ravi/MY WORKS/MMD V2/scratch/backups/cosmos';
const files = fs.readdirSync(cosmosDir);

const manifest = JSON.parse(fs.readFileSync(path.join(cosmosDir, 'manifest.json'), 'utf8'));

const results = [];
let totalCollections = 0;
let totalDocs = 0;
let totalSize = 0;

for (const f of files) {
  if (f === 'manifest.json' || !f.endsWith('.json')) continue;
  const colName = f.replace('.json', '');
  const filePath = path.join(cosmosDir, f);
  const stat = fs.statSync(filePath);
  
  let docs = [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    docs = JSON.parse(content);
  } catch (err) {
    console.error(`Error parsing ${f}:`, err.message);
  }

  const docCount = Array.isArray(docs) ? docs.length : 0;
  const sampleIds = Array.isArray(docs) ? docs.slice(0, 3).map(d => d._id || d.id || JSON.stringify(d)) : [];

  results.push({
    collection: colName,
    count: docCount,
    sizeBytes: stat.size,
    samples: sampleIds
  });

  totalCollections++;
  totalDocs += docCount;
  totalSize += stat.size;
}

console.log('RESULTS:');
console.log(JSON.stringify({
  collections: results,
  aggregates: {
    totalCollections,
    totalDocs,
    totalSize,
    manifestMatch: (totalDocs === Object.values(manifest).reduce((sum, item) => sum + (item.count || 0), 0))
  }
}, null, 2));
