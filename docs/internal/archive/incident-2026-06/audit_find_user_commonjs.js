// Script to query AuditLog around soft-delete timestamp using ts-node/register and CommonJS require
require('ts-node').register();
require('dotenv').config();

const connectDB = require('./lib/db/mongodb').default;
const AuditLog = require('./lib/db/models/AuditLog').default;

async function main() {
  await connectDB();
  const target = new Date('2026-06-09T08:04:51.757Z');
  const start = new Date(target.getTime() - 10000); // 10 sec before
  const end = new Date(target.getTime() + 10000); // 10 sec after
  const logs = await AuditLog.find({ createdAt: { $gte: start, $lte: end } }).lean();
  console.log('Audit logs near soft-delete:', JSON.stringify(logs, null, 2));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
