const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/gramaai',
  jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  aiEngineUrl: process.env.AI_ENGINE_URL || 'http://localhost:8000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
  groqApiKey: process.env.GROQ_API_KEY || '',
};

// Validate required env vars
const required = ['jwtSecret', 'jwtRefreshSecret'];
for (const key of required) {
  if (!env[key] || env[key].startsWith('dev-')) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`FATAL: ${key} environment variable is not set or is using default value`);
      process.exit(1);
    }
  }
}

module.exports = env;
