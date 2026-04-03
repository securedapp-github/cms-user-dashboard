require('dotenv').config();
const fs = require('fs');

function envBool(name, defaultValue = false) {
  const v = process.env[name];
  if (v == null || v === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
}

/**
 * MySQL SSL for Sequelize / mysql2.
 * Production uses TLS by default. If the server uses a self-signed or private-CA chain, set
 * DB_SSL_REJECT_UNAUTHORIZED=false or provide DB_SSL_CA (e.g. RDS combined CA bundle).
 */
function getMysqlDialectOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  const useSsl = isProd || envBool('DB_USE_SSL', false);
  if (!useSsl) return {};

  const ssl = { require: true };
  const caPath = String(process.env.DB_SSL_CA || '').trim();
  if (caPath) {
    try {
      ssl.ca = fs.readFileSync(caPath, 'utf8');
    } catch (e) {
      const err = new Error(`DB_SSL_CA file not readable: ${caPath} (${e.message})`);
      err.cause = e;
      throw err;
    }
  }

  if (process.env.DB_SSL_REJECT_UNAUTHORIZED !== undefined && process.env.DB_SSL_REJECT_UNAUTHORIZED !== '') {
    ssl.rejectUnauthorized = envBool('DB_SSL_REJECT_UNAUTHORIZED', true);
  } else {
    ssl.rejectUnauthorized = true;
  }

  return { ssl };
}

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'securedapp_cms',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  },
  getMysqlDialectOptions,
};
