// audit_user_softdelete2.js
// Node script (CommonJS) using ts-node to load TypeScript source files via absolute paths.
require('ts-node').register({ transpileOnly: true });
require('dotenv').config();

const path = require('path');
const projectRoot = path.resolve(__dirname, '..'); // project root directory

const connectDB = require(path.join(projectRoot, 'lib', 'db', 'mongodb')).default;
const AuditLog = require(path.join(projectRoot, 'lib', 'db', 'models', 'AuditLog')).default;

async function main() {
  await connectDB();
  const target = new Date('2026-06-09T08:04:51.757Z');
  const start = new Date(target.getTime() - 15000); // 15 sec before
  const end = new Date(target.getTime() + 15000); // 15 sec after
  const logs = await AuditLog.find({ createdAt: { $gte: start, $lte: end } }).lean();
  console.log('Audit logs around soft-delete timestamp:');
  console.log(JSON.stringify(logs, null, 2));
}

main().catch(err => {
  console.error('Error executing audit query:', err);
  process.exit(1);
});
