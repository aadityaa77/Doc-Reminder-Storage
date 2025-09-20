const dotenv = require('dotenv');
dotenv.config();

function required(name) {
  if (!process.env[name]) throw new Error(`Missing env var ${name}`);
  return process.env[name];
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: required('MONGODB_URI'),
  accessTokenSecret: required('ACCESS_TOKEN_SECRET'),
  refreshTokenSecret: required('REFRESH_TOKEN_SECRET'),
  jwtIssuer: process.env.JWT_ISSUER || 'doc.app',
  jwtAudience: process.env.JWT_AUDIENCE || 'doc.app.web',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  cryptoMasterKey: Buffer.from(required('CRYPTO_MASTER_KEY_BASE64'), 'base64')
};
