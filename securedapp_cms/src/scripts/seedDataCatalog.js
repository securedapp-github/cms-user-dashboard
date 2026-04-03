/**
 * Seed platform-wide data catalog with default data IDs.
 * Run after db:sync. Idempotent (upserts by data_id).
 * Usage: npm run db:seed-catalog
 */
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { sequelize } = require('../models');
const { ensureDataCatalogSeeded } = require('./dataCatalogDefaults');

async function seedDataCatalog() {
  try {
    await sequelize.authenticate();
    await ensureDataCatalogSeeded();
    console.log('Data catalog seeded.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seedDataCatalog();
