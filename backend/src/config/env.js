require('dotenv').config();

const required = ['DATABASE_URL', 'DIRECT_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientOrigin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/+$/, ''),
};
