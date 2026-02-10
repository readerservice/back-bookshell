const dotenv = require('dotenv');

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: envFile });

const envConfig = {
  port: process.env.PORT || 3100,
  smtp: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  email: {
    fromName: process.env.EMAIL_FROM_NAME,
    supportName: process.env.SUPPORT_FROM_NAME
  },
  appUrl: process.env.APP_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  refreshSecret: process.env.REFRESH_SECRET,
  refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || '14d',
  mongoURL: process.env.MONGO_URI,
  cohereApiKey: process.env.COHEREAI_API_KEY,
  revenueSecretApiKey: process.env.REVENUECAT_SECRET_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY
};

module.exports = envConfig