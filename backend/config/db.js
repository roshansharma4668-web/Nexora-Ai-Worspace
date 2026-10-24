const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    if (!env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable defined nahi hai.');
    }

    const conn = await mongoose.connect(env.MONGO_URI);
    console.log(`🚀 MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;