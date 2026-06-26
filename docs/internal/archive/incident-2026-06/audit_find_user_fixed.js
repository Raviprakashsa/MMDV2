// Script to query AuditLog around the soft-delete timestamp for user 6a2692db17e6f1f82b69cd62
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import connectDB and AuditLog using relative paths
import connectDB from path.join(__dirname, 'lib', 'db', 'mongodb.js');
import AuditLog from path.join(__dirname, 'lib', 'db', 'models', 'AuditLog.js');

async function main() {
  await connectDB();
  const target = new Date('2026-06-09T08:04:51.757Z');
  const start = new Date(target.getTime() - 10000); // 10 seconds before
  const end = new Date(target.getTime() + 10000); // 10 seconds after
  const logs = await AuditLog.find({ createdAt: { $gte: start, $lte: end } }).lean();
  console.log('Audit logs near soft-delete:', JSON.stringify(logs, null, 2));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
