const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const requiredEnvs = ['PORT', 'MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];

for (const env of requiredEnvs) {
  if (!process.env[env]) {
    console.error(`❌ FATAL ERROR: Environment variable ${env} is missing in backend/.env`);
    process.exit(1);
  }
}

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};
