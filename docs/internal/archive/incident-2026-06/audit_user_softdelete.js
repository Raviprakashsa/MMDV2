// audit_user_softdelete.js
require('ts-node').register({ transpileOnly: true });
require('dotenv').config();

const connectDB = require('./lib/db/mongodb').default;
const AuditLog = require('./lib/db/models/AuditLog').default;

async function main() {
  await connectDB();
  const target = new Date('2026-06-09T08:04:51.757Z');
  const start = new Date(target.getTime() - 30000); // 30 sec before
  const end = new Date(target.getTime() + 30000); // 30 sec after
  const logs = await AuditLog.find({ createdAt: { $gte: start, $lte: end } }).lean();
  console.log('Found audit logs:', JSON.stringify(logs, null, 2));
}

main().catch(err => {
  console.error('Error executing audit query:', err);
  process.exit(1);
});
