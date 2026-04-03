require('dotenv').config();
const logger = require('./config/logger');

/**
 * `npm run dev` only: run the same logic as `npm run db:sync` before listening.
 * Skip with SKIP_DB_SYNC=true. `npm start` never auto-syncs.
 */
async function maybeSyncDatabaseForDev() {
  const isNpmDev = process.env.npm_lifecycle_event === 'dev';
  const skip = process.env.SKIP_DB_SYNC === 'true' || process.env.SKIP_DB_SYNC === '1';
  if (!isNpmDev || skip) return;
  const { syncDatabase } = require('./scripts/syncDb');
  await syncDatabase();
  logger.info('Database synced (npm run dev auto-sync).');
}

/**
 * Production `npm start`: catalog must exist for purpose forms. Dev gets this inside syncDatabase().
 * Idempotent upserts. Skip with SKIP_CATALOG_SEED=true.
 */
async function maybeSeedDataCatalogOnStart() {
  const skip = process.env.SKIP_CATALOG_SEED === 'true' || process.env.SKIP_CATALOG_SEED === '1';
  if (skip) return;
  const isNpmDev = process.env.npm_lifecycle_event === 'dev';
  if (isNpmDev) return;
  const { ensureDataCatalogSeeded } = require('./scripts/dataCatalogDefaults');
  await ensureDataCatalogSeeded();
  logger.info('Data catalog defaults ensured (production start).');
}

(async () => {
  try {
    await maybeSyncDatabaseForDev();
  } catch (err) {
    logger.error('Database sync failed — fix DB config or run `npm run db:sync` manually.', err);
    process.exit(1);
  }
  try {
    await maybeSeedDataCatalogOnStart();
  } catch (err) {
    logger.error('Data catalog seed failed — check DB and run `npm run db:seed-catalog` manually.', err);
    process.exit(1);
  }

  const app = require('./app');
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    if (process.env.NODE_ENV === 'production' && !String(process.env.CORS_ORIGIN || '').trim()) {
      logger.warn(
        'NODE_ENV=production but CORS_ORIGIN is unset — only built-in localhost origins are allowed. ' +
          'Set CORS_ORIGIN to your SPA URL(s), comma-separated (e.g. https://app.example.com), or browser requests from production will fail CORS.'
      );
    }
  });
})();
