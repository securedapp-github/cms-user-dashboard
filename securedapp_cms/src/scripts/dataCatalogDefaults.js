/**
 * Platform-wide data catalog defaults (DPDP-oriented). Used by db:sync, server startup, and db:seed-catalog.
 */
const DATA_CATALOG_DEFAULT_ENTRIES = [
  { data_id: 'AADHAAR_NUMBER', category: 'identity', description: 'Aadhaar number (UIDAI)', sensitivity: 'HIGH', max_validity_days: 90, status: 'active' },
  { data_id: 'AADHAAR_ADDRESS', category: 'address', description: 'Address as per Aadhaar', sensitivity: 'HIGH', max_validity_days: 90, status: 'active' },
  { data_id: 'PAN_NUMBER', category: 'identity', description: 'Permanent Account Number (IT)', sensitivity: 'HIGH', max_validity_days: 365, status: 'active' },
  { data_id: 'PAN_ADDRESS', category: 'address', description: 'Address as per PAN records', sensitivity: 'HIGH', max_validity_days: 365, status: 'active' },
  { data_id: 'VOTER_ID', category: 'identity', description: 'Voter ID (EPIC number)', sensitivity: 'HIGH', max_validity_days: 365, status: 'active' },
  { data_id: 'DRIVING_LICENCE_NUMBER', category: 'identity', description: 'Driving licence number', sensitivity: 'HIGH', max_validity_days: 365, status: 'active' },
  { data_id: 'PASSPORT_NUMBER', category: 'identity', description: 'Indian passport number', sensitivity: 'HIGH', max_validity_days: 365, status: 'active' },
  { data_id: 'FULL_NAME', category: 'identity', description: 'Full name as per official ID', sensitivity: 'MEDIUM', max_validity_days: 730, status: 'active' },
  { data_id: 'DATE_OF_BIRTH', category: 'identity', description: 'Date of birth', sensitivity: 'HIGH', max_validity_days: 730, status: 'active' },
  { data_id: 'GENDER', category: 'demographic', description: 'Gender', sensitivity: 'LOW', max_validity_days: 730, status: 'active' },
  { data_id: 'PHOTO', category: 'identity', description: 'Photograph (e.g. for KYC)', sensitivity: 'HIGH', max_validity_days: 365, status: 'active' },
  { data_id: 'SIGNATURE', category: 'identity', description: 'Signature image or specimen', sensitivity: 'HIGH', max_validity_days: 365, status: 'active' },
  { data_id: 'CURRENT_ADDRESS', category: 'address', description: 'Current residential address', sensitivity: 'MEDIUM', max_validity_days: 365, status: 'active' },
  { data_id: 'PERMANENT_ADDRESS', category: 'address', description: 'Permanent address', sensitivity: 'MEDIUM', max_validity_days: 730, status: 'active' },
  { data_id: 'OFFICE_ADDRESS', category: 'address', description: 'Office or work address', sensitivity: 'MEDIUM', max_validity_days: 365, status: 'active' },
  { data_id: 'MOBILE_NUMBER', category: 'contact', description: 'Indian mobile number (10 digits)', sensitivity: 'MEDIUM', max_validity_days: 365, status: 'active' },
  { data_id: 'EMAIL', category: 'contact', description: 'Email address', sensitivity: 'MEDIUM', max_validity_days: 730, status: 'active' },
  { data_id: 'LANDLINE_NUMBER', category: 'contact', description: 'Landline / STD number', sensitivity: 'LOW', max_validity_days: 365, status: 'active' },
  { data_id: 'BANK_ACCOUNT_NUMBER', category: 'financial', description: 'Bank account number', sensitivity: 'HIGH', max_validity_days: 90, status: 'active' },
  { data_id: 'IFSC_CODE', category: 'financial', description: 'IFSC code of bank branch', sensitivity: 'MEDIUM', max_validity_days: 365, status: 'active' },
  { data_id: 'UPI_ID', category: 'financial', description: 'UPI ID (VPA)', sensitivity: 'MEDIUM', max_validity_days: 90, status: 'active' },
  { data_id: 'INCOME_SALARY', category: 'financial', description: 'Income or salary information', sensitivity: 'HIGH', max_validity_days: 365, status: 'active' },
  { data_id: 'HEALTH_RECORDS', category: 'health', description: 'Health or medical records', sensitivity: 'HIGH', max_validity_days: 365, status: 'active' },
  { data_id: 'BIOMETRIC_FINGERPRINT', category: 'biometric', description: 'Fingerprint biometric', sensitivity: 'HIGH', max_validity_days: 90, status: 'active' },
  { data_id: 'CASTE_CERTIFICATE_NUMBER', category: 'identity', description: 'Caste / category certificate number (if applicable)', sensitivity: 'HIGH', max_validity_days: 365, status: 'active' },
];

async function ensureDataCatalogSeeded() {
  const { DataCatalog } = require('../models');
  for (const row of DATA_CATALOG_DEFAULT_ENTRIES) {
    const [instance, created] = await DataCatalog.findOrCreate({
      where: { data_id: row.data_id },
      defaults: row,
    });
    if (!created) {
      await instance.update(row);
    }
  }
}

module.exports = {
  DATA_CATALOG_DEFAULT_ENTRIES,
  ensureDataCatalogSeeded,
};
