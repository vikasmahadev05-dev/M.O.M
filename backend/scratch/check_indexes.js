const mongoose = require('mongoose');
require('dotenv').config();

async function checkIndexes() {
  const MONGODB_URI = process.env.mongo_uri || process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found');
    return;
  }
  
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const collection of collections) {
    const indexes = await mongoose.connection.db.collection(collection.name).indexes();
    console.log(`Indexes for collection: ${collection.name}`);
    console.log(JSON.stringify(indexes, null, 2));
  }
  
  await mongoose.disconnect();
}

checkIndexes();
