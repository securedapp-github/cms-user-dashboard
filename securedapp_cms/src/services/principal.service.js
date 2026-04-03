const { Principal } = require('../models');
const { computePrincipalGlobalKey } = require('../utils/pseudonymizeUserIdentifier');

/**
 * Resolve or create a Principal row for the given email+phone (global key, not tenant-scoped).
 */
async function getOrCreatePrincipal(email, phone) {
  const global_key = computePrincipalGlobalKey(email, phone);
  const [row] = await Principal.findOrCreate({
    where: { global_key },
    defaults: { global_key },
  });
  return row;
}

module.exports = {
  getOrCreatePrincipal,
};
