const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = "mongodb+srv://vikas:vikas_mahadev@cluster0.tf5yhre.mongodb.net/MOM?appName=Cluster0";

async function debugDB() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB");
  
  const Task = mongoose.model('Task', new mongoose.Schema({}, { strict: false }));
  const count = await Task.countDocuments({});
  console.log("Total Tasks in DB:", count);
  
  const lastTask = await Task.findOne().sort({ createdAt: -1 });
  console.log("Last Task Created:", lastTask);
  
  process.exit(0);
}

debugDB().catch(err => {
  console.error(err);
  process.exit(1);
});
