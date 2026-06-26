// audit_query.js
// Simple Node script to fetch AuditLog entries around a timestamp.
const path = require('path');
const projectRoot = path.resolve(__dirname, '..');
const connectDB = require(path.join(projectRoot, 'lib', 'db', 'mongodb')).default;
const AuditLog = require(path.join(projectRoot, 'lib', 'db', 'models', 'AuditLog')).default;

async function main() {
  await connectDB();
  const target = new Date('2026-06-09T08:04:51.757Z');
  const start = new Date(target.getTime() - 60000); // 1 minute before
  const end = new Date(target.getTime() + 60000); // 1 minute after
  const logs = await AuditLog.find({ createdAt: { $gte: start, $lte: end } })
    .sort({ createdAt: 1 })
    .lean();
  console.log(JSON.stringify(logs, null, 2));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
