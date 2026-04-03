/**
 * Serve the Redirect Consent test page on port 5501.
 * Run: node src/scripts/serve-redirect-consent-demo.js
 * Then open: http://localhost:5501
 *
 * Keep the API running on port 3000. It requires valid API keys and App IDs.
 */
const path = require('path');
const express = require('express');

const app = express();
const PORT = 5501;
const ROOT = path.resolve(__dirname, '../..');
const DEMO_APPS = path.join(ROOT, 'demo-apps');

app.use(express.static(DEMO_APPS, { index: false }));

app.get('/', (req, res) => {
  res.sendFile(path.join(DEMO_APPS, 'redirect-consent-demo.html'));
});

app.listen(PORT, () => {
  console.log(`Redirect Consent test page running at: http://localhost:${PORT}`);
  console.log(`(Make sure the backend API is running on http://localhost:3000)`);
});
