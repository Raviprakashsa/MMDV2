import mongoose from 'mongoose';

const MONGO_URL = '<REDACTED_AZURE_COSMOS_CONNECTION_STRING>';

async function main() {
  await mongoose.connect(MONGO_URL);
  
  // Define User schema mimicking production model
  const UserSchema = new mongoose.Schema({
    email: String,
    isActive: Boolean,
    deletedAt: Date,
    createdAt: Date,
  }, { collection: 'users' });
  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  const query = { deletedAt: null };
  console.log('Executing query:', JSON.stringify(query));
  console.log('Sorting by: { createdAt: -1 }');

  try {
    const res = await User.find(query).sort({ createdAt: -1 }).lean();
    console.log('Query succeeded. Total records:', res.length);
  } catch (err: any) {
    console.log('\n--- EXCEPTION THROWN ---');
    console.log('Name:', err.name);
    console.log('Message:', err.message);
    console.log('Code:', err.code);
    console.log('CodeName:', err.codeName);
    console.log('ErrorResponse:', JSON.stringify(err.errorResponse, null, 2));
    console.log('\n--- STACK TRACE ---');
    console.log(err.stack);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
