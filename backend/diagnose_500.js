const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = "mongodb+srv://vikas:vikas_mahadev@cluster0.tf5yhre.mongodb.net/MOM?appName=Cluster0";

async function testCreate() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to DB");
  
  const User = mongoose.model('User', new mongoose.Schema({ name: String }));
  const user = await User.findOne();
  if (!user) throw new Error("No user found");
  
  const Task = require('./models/Task');
  const ActivityLog = require('./models/ActivityLog');

  console.log("Attempting to save task for user:", user._id);

  try {
    const taskData = {
      title: 'Debug Task 31 May',
      description: 'Testing 500 error',
      priority: 'Medium',
      category: 'Work',
      dueDate: new Date('2026-05-31'),
      user: user._id
    };

    const task = new Task(taskData);
    const saved = await task.save();
    console.log("Task Saved:", saved._id);

    const log = new ActivityLog({
      user: user._id,
      task: saved._id,
      actionType: 'created'
    });
    await log.save();
    console.log("Log Saved");

  } catch (err) {
    console.error("CRITICAL ERROR FOUND:");
    console.error(err);
  }

  process.exit(0);
}

testCreate();
