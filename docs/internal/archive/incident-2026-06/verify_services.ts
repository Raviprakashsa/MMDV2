import mongoose from 'mongoose';
import connectDB from '../lib/db/mongodb';
import Company from '../lib/db/models/Company';
import Candidate from '../lib/db/models/Candidate';
import Requirement from '../lib/db/models/Requirement';
import User from '../lib/db/models/User';

async function verify() {
  // Point DATABASE_URL env to Atlas connection
  process.env.DATABASE_URL = "<REDACTED_MONGODB_ATLAS_CONNECTION_STRING>";

  console.log('Connecting to target MongoDB Atlas database using connectDB()...');
  await connectDB();
  console.log('Connected successfully via connectDB!');

  console.log('\n=======================================');
  console.log('TEST 1: Companies (Atlas Direct)');
  console.log('=======================================');
  const companies = await Company.find({ deletedAt: null }).lean();
  console.log(`Companies count: ${companies.length}`);
  companies.forEach((c, idx) => {
    console.log(` [${idx+1}] ID: ${c._id}, Name: ${c.name}, Sector: ${c.sector}, MOU: ${c.mouStatus}`);
  });

  console.log('\n=======================================');
  console.log('TEST 2: Candidates (Atlas Direct)');
  console.log('=======================================');
  const candidates = await Candidate.find({ deletedAt: null }).lean();
  console.log(`Candidates count: ${candidates.length}`);
  candidates.forEach((c, idx) => {
    console.log(` [${idx+1}] ID: ${c._id}, Name: ${c.name}, Email: ${c.email}, Status: ${c.status}`);
  });

  console.log('\n=======================================');
  console.log('TEST 3: Requirements (Atlas Direct)');
  console.log('=======================================');
  const requirements = await Requirement.find({ deletedAt: null }).lean();
  console.log(`Requirements count: ${requirements.length}`);
  requirements.forEach((r, idx) => {
    console.log(` [${idx+1}] ID: ${r._id}, Job: ${r.jobTitle}, Group: ${r.group}, Status: ${r.status}`);
  });

  console.log('\n=======================================');
  console.log('TEST 4: Users / Login (Atlas Direct)');
  console.log('=======================================');
  const users = await User.find({ deletedAt: null }).lean();
  console.log(`Users count: ${users.length}`);
  users.forEach((u, idx) => {
    console.log(` [${idx+1}] ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
  });

  // Verify specific seeded admin details
  const admin = await User.findOne({ email: 'admin@magnuscopo.com' }).lean();
  if (admin) {
    console.log(`\n✅ Verified Super Admin user '${admin.name}' exists with email '${admin.email}' and role '${admin.role}'.`);
  } else {
    console.log('\n❌ Failed: Seeded Super Admin user admin@magnuscopo.com not found!');
  }

  await mongoose.disconnect();
  console.log('\n🎉 Atlas Verification Complete!');
}

verify().catch(console.error);
