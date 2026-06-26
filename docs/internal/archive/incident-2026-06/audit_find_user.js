// Temporary script to fetch AuditLog entries around a timestamp
import connectDB from '@/lib/db/mongodb';
import AuditLog from '@/lib/db/models/AuditLog';

async function main() {
  await connectDB();
  const target = new Date('2026-06-09T08:04:51.757Z');
  // Search +/- 5 seconds
  const start = new Date(target.getTime() - 5000);
  const end = new Date(target.getTime() + 5000);
  const logs = await AuditLog.find({ createdAt: { $gte: start, $lte: end } }).lean();
  console.log('Audit logs around time:', logs);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
