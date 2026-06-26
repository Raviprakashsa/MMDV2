// audit_find_user_ts.ts
import '@/lib/db/mongodb';
import AuditLog from '@/lib/db/models/AuditLog';

async function main() {
  const target = new Date('2026-06-09T08:04:51.757Z');
  const start = new Date(target.getTime() - 15000);
  const end = new Date(target.getTime() + 15000);
  const logs = await AuditLog.find({ createdAt: { $gte: start, $lte: end } }).lean();
  console.log(JSON.stringify(logs, null, 2));
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
