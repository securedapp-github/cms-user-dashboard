const redirectConsentService = require('../services/redirectConsent.service');
const getClientIp = require('../utils/getClientIp');

function renderRedirectConsentPage(token, session = {}) {
  // Format dates from session data
  const sessionStart = session.created_at ? new Date(session.created_at) : new Date();
  const requestedAtTime = sessionStart.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Use the first purpose's validity_days to show consent validity
  const firstPurpose = (session.purposes || [])[0];
  const validityDays = firstPurpose?.validity_days;
  const validityDisplay = validityDays ? `${validityDays} days` : 'N/A';

  const sessionPurposesJson = JSON.stringify(session.purposes || []);

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>SecureDApp Consent Verification</title>
  <style>
    :root {
      --slate-50: #f8fafc;
      --slate-100: #f1f5f9;
      --slate-200: #e2e8f0;
      --slate-300: #cbd5e1;
      --slate-400: #94a3b8;
      --slate-600: #475569;
      --slate-800: #1e293b;
      --slate-900: #0f172a;
      --indigo-50: #eef2ff;
      --indigo-500: #6366f1;
      --indigo-600: #4f46e5;
      --indigo-700: #4338ca;
      --emerald-50: #ecfdf5;
      --emerald-700: #047857;
      --red-50: #fef2f2;
      --red-700: #b91c1c;
      --glass-bg: rgba(255, 255, 255, 0.7);
      --glass-border: rgba(255, 255, 255, 0.5);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, var(--indigo-50) 0%, var(--slate-100) 100%);
      color: var(--slate-900);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .wrap {
      width: 100%;
      max-width: 520px;
    }
    .top-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
    }
    .lang-select {
      min-width: 220px;
      height: 36px;
      border: 1px solid var(--slate-300);
      border-radius: 10px;
      background: #fff;
      color: var(--slate-800);
      font-weight: 600;
      padding: 0 10px;
    }
    .lang-select:focus-visible,
    .btn:focus-visible,
    .input:focus-visible,
    a:focus-visible,
    input[type="radio"]:focus-visible + span {
      outline: 3px solid #1d4ed8;
      outline-offset: 2px;
    }
    .brand {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    .logo {
      min-width: 132px;
      height: 56px;
      border-radius: 16px;
      background: #000;
      color: #fff;
      display: grid;
      place-items: center;
      padding: 0 18px;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: 0.01em;
      box-shadow: 0 10px 24px rgba(2, 6, 23, 0.35);
      text-transform: uppercase;
    }
    .title {
      margin: 0;
      text-align: center;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--slate-900);
    }
    .subtitle {
      margin: 8px 0 0;
      text-align: center;
      color: var(--slate-600);
      font-size: 15px;
    }
    .card {
      margin-top: 24px;
      background: var(--glass-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--glass-border);
      border-radius: 24px;
      padding: 32px;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
    }
    .summary-section {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
      border: 1px solid var(--slate-200);
      font-size: 14px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .summary-title {
      font-size: 12px;
      font-weight: 800;
      color: var(--indigo-600);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 0;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .summary-title::before {
      content: '🔒';
      font-size: 14px;
    }
    .summary-row {
      display: flex;
      flex-direction: column;
      margin-bottom: 12px;
    }
    .summary-row:last-child {
      margin-bottom: 0;
    }
    .summary-label {
      color: var(--slate-500);
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 4px;
    }
    .summary-value {
      color: var(--slate-800);
      font-weight: 600;
    }
    .summary-list {
      margin: 4px 0 0 0;
      padding-left: 20px;
      color: var(--slate-800);
      font-weight: 500;
    }
    .summary-list li {
      margin-bottom: 2px;
    }
    .purpose-card {
      border: 1px solid var(--slate-200);
      border-radius: 12px;
      padding: 10px;
      margin-top: 8px;
      background: #fff;
    }
    .purpose-card label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: var(--slate-800);
    }
    .data-items {
      margin-top: 8px;
      padding-left: 26px;
      display: grid;
      gap: 4px;
    }
    .data-items label {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--slate-700);
      font-weight: 500;
    }
    .rights-section {
      background: rgba(255, 255, 255, 0.9);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
      border: 1px solid var(--slate-200);
      font-size: 14px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .rights-title {
      font-size: 16px;
      font-weight: 800;
      margin: 0 0 8px;
      color: var(--slate-900);
    }
    .rights-subtitle {
      margin: 0 0 12px;
      color: var(--slate-600);
    }
    .rights-heading {
      margin: 12px 0 6px;
      font-size: 13px;
      font-weight: 700;
      color: var(--slate-700);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .rights-list {
      margin: 0;
      padding-left: 20px;
      color: var(--slate-800);
    }
    .rights-list li {
      margin-bottom: 4px;
    }
    .rights-link {
      display: inline-block;
      margin-top: 8px;
      color: var(--indigo-700);
      font-weight: 700;
      text-decoration: none;
    }
    .rights-link:hover {
      text-decoration: underline;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 12px;
    }
    hr {
      border: none;
      border-top: 1px dashed var(--slate-300);
      margin: 16px 0;
    }
    .label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: var(--slate-700);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 10px;
    }
    .otp-mode {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-bottom: 20px;
    }
    .otp-mode label {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 50px;
      padding: 10px 8px;
      background: #fff;
      border: 1px solid var(--slate-200);
      border-radius: 12px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      color: var(--slate-600);
      transition: all 0.2s ease;
      min-width: 0;
      overflow: hidden;
    }
    .otp-mode label span {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .otp-mode input[type="radio"] {
      display: none;
    }
    .otp-mode input[type="radio"]:checked + span {
      color: var(--indigo-700);
    }
    .otp-mode label:has(input[type="radio"]:checked) {
      border-color: var(--indigo-500);
      background: var(--indigo-50);
      box-shadow: 0 0 0 1px var(--indigo-500);
    }
    .input {
      width: 100%;
      height: 48px;
      padding: 0 16px;
      border: 1px solid var(--slate-300);
      border-radius: 14px;
      background: #fff;
      font-size: 16px;
      font-weight: 600;
      color: var(--slate-900);
      outline: none;
      transition: all .2s ease;
      text-align: center;
      letter-spacing: 0.5em;
    }
    .input::placeholder {
      letter-spacing: normal;
      font-weight: 400;
      color: var(--slate-400);
    }
    .input:focus {
      border-color: var(--indigo-500);
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
    }
    .actions {
      display: grid;
      gap: 12px;
      margin-top: 20px;
    }
    .btn {
      height: 48px;
      border: none;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all .15s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn:active { transform: scale(0.98); }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn-primary { background: linear-gradient(135deg, var(--indigo-600), var(--indigo-700)); color: #fff; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .btn-primary:hover:not(:disabled) { box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4); }
    .btn-secondary { background: #fff; color: var(--slate-700); border: 1px solid var(--slate-300); }
    .btn-secondary:hover:not(:disabled) { background: var(--slate-50); border-color: var(--slate-400); }
    .btn-loading {
      opacity: 0.8;
      pointer-events: none;
    }
    .status {
      margin-top: 16px;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      border: 1px solid var(--slate-200);
      background: rgba(255, 255, 255, 0.8);
      color: var(--slate-600);
      text-align: center;
      font-weight: 500;
    }
    .status.success { background: var(--emerald-50); color: var(--emerald-700); border-color: #a7f3d0; }
    .status.error { background: var(--red-50); color: var(--red-700); border-color: #fecaca; }
    .hint {
      margin-top: 20px;
      font-size: 13px;
      color: var(--slate-400);
      text-align: center;
      font-weight: 500;
    }
    #verifySection {
      opacity: 0.5;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    #verifySection.active {
      opacity: 1;
      pointer-events: auto;
    }
    @media (max-width: 480px) {
      .otp-mode {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <main class="wrap">
    <div class="top-row">
      <label for="languageSelect" style="display:flex;align-items:center;gap:8px;">
        <span id="langLabel" style="font-size:12px;color:var(--slate-700);font-weight:700;">Language</span>
        <select id="languageSelect" class="lang-select" aria-label="Language selector">
          <option value="en">English</option>
          <option value="as">Assamese</option>
          <option value="bn">Bengali</option>
          <option value="bodo">Bodo</option>
          <option value="dogri">Dogri</option>
          <option value="gu">Gujarati</option>
          <option value="hi">Hindi</option>
          <option value="kn">Kannada</option>
          <option value="ks">Kashmiri</option>
          <option value="kok">Konkani</option>
          <option value="mai">Maithili</option>
          <option value="ml">Malayalam</option>
          <option value="mni">Manipuri</option>
          <option value="mr">Marathi</option>
          <option value="ne">Nepali</option>
          <option value="or">Odia</option>
          <option value="pa">Punjabi</option>
          <option value="sa">Sanskrit</option>
          <option value="sat">Santali</option>
          <option value="sd">Sindhi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="ur">Urdu</option>
        </select>
      </label>
    </div>
    <div class="brand"><div class="logo">Secure CMS</div></div>
    <h2 class="title" id="titleText">Consent Verification</h2>
    <p class="subtitle" id="subtitleText">Review details and verify to proceed</p>

    <section class="card">
      <div class="summary-section">
        <h3 class="summary-title" id="consentDetailsTitle">Consent Details</h3>
        
        <div class="grid-2">
          <div class="summary-row">
            <span class="summary-label" id="fiduciaryLabel">Fiduciary</span>
            <span class="summary-value">${escapeHtml(session.fiduciary || 'SecureDApp Pvt Ltd')}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label" id="applicationLabel">Application</span>
            <span class="summary-value">${escapeHtml(session.app_name || 'Consent Portal')}</span>
          </div>
        </div>
        <div class="summary-row" style="margin-top: 4px;">
          <span class="summary-label" id="principalLabel">Data Principal</span>
          <span class="summary-value" id="principalValue">${escapeHtml(session.email || 'N/A')} | ${escapeHtml(session.phone_number || 'N/A')}</span>
        </div>

        <hr />

        <div class="summary-row">
          <span class="summary-label" id="requestedDataLabel">Requested Data</span>
          <ul class="summary-list" id="requestedDataList"></ul>
        </div>

        <div class="summary-row" style="margin-top: 12px;">
          <span class="summary-label" id="purposeProcessingLabel">Purpose of Processing</span>
          <div id="purposeSelectionContainer"></div>
        </div>

        <hr />

        <div class="grid-2">
          <div class="summary-row">
            <span class="summary-label" id="validityLabel">Validity</span>
            <span class="summary-value" style="font-size: 12px;">${validityDisplay}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label" id="requestedAtLabel">Requested At</span>
            <span class="summary-value" style="font-size: 12px;">${requestedAtTime}</span>
          </div>
        </div>
      </div>

      <div class="rights-section">
        <h3 class="rights-title" id="privacyRightsTitle">Your Privacy & Rights</h3>
        <p class="rights-subtitle" id="privacyRightsSubtitle">By continuing, you agree to the use of your data as described.</p>

        <p class="rights-heading" id="rightsHeading">Your Rights (under DPDP Act)</p>
        <ul class="rights-list">
          <li id="right1">Access your personal data</li>
          <li id="right2">Correct or update your data</li>
          <li id="right3">Withdraw consent anytime</li>
          <li id="right4">Request deletion of your data</li>
        </ul>

        <p class="rights-heading" id="retentionHeading">Data Retention & Withdrawal</p>
        <ul class="rights-list">
          <li id="retention1">Your data is stored only as long as necessary for the stated purpose</li>
          <li id="retention2">You can withdraw consent anytime - processing will stop thereafter</li>
        </ul>

        <p class="rights-heading" id="manageHeading">Manage Your Preferences</p>
        <p class="rights-subtitle" id="manageText" style="margin-bottom: 6px;">
          You can log in to our Consent Portal to review or revoke consent, raise a Data Subject Request (DSR), and track your data usage.
        </p>
        <a class="rights-link" id="visitPortalLink" href="https://cms-user.securedapp.io" target="_blank" rel="noopener noreferrer">Visit: cms-user.securedapp.io</a>
      </div>

      <div class="otp-selection-section">
        <label class="label" id="deliveryMethodLabel">Select Delivery Method</label>
        <fieldset class="otp-mode" style="border:none;padding:0;margin:0 0 20px;">
          <legend style="position:absolute;left:-9999px;">Delivery Method</legend>
          <label>
            <input type="checkbox" name="otp_mode_all" id="otp_mode_all" />
            <span id="otpAllLabel">🔄 All options</span>
          </label>
          <label>
            <input type="checkbox" name="otp_mode" value="mobile" checked />
            <span id="otpMobileLabel">📱 Mobile</span>
          </label>
          <label>
            <input type="checkbox" name="otp_mode" value="email" />
            <span id="otpEmailLabel">✉️ Email</span>
          </label>
          <label>
            <input type="checkbox" name="otp_mode" value="whatsapp" />
            <span id="otpWhatsappLabel">💬 WhatsApp</span>
          </label>
        </fieldset>
        <button id="sendBtn" class="btn btn-secondary" type="button" style="width: 100%;"><span id="sendBtnText">Send Code</span></button>
      </div>

      <div id="verifySection" style="margin-top: 24px;">
        <label for="otp" class="label" id="verificationCodeLabel">Verification Code</label>
        <input id="otp" class="input" placeholder="000000" maxlength="6" inputmode="numeric" />
        <div class="actions">
          <button id="verifyBtn" class="btn btn-primary" type="button"><span id="verifyBtnText">Verify & Grant Consent</span></button>
        </div>
      </div>

      <div id="msg" class="status" role="status" aria-live="polite">Review the details, select a method, and click "Send Code".</div>
      <p class="hint" id="poweredByText">Powered by SecureDApp CMS</p>
    </section>
  </main>

  <div id="busyOverlay" style="display:none;position:fixed;inset:0;background:rgba(15,23,42,.3);backdrop-filter:blur(2px);z-index:50;"></div>

  <script>
    const token = ${JSON.stringify(token)};
    const msg = document.getElementById('msg');
    const sendBtn = document.getElementById('sendBtn');
    const verifyBtn = document.getElementById('verifyBtn');
    const otpInput = document.getElementById('otp');
    const busyOverlay = document.getElementById('busyOverlay');
    const verifySection = document.getElementById('verifySection');
    const languageSelect = document.getElementById('languageSelect');
    const otpModeAll = document.getElementById('otp_mode_all');
    const otpModeItems = Array.from(document.querySelectorAll('input[name="otp_mode"]'));
    const sessionPurposes = ${sessionPurposesJson};
    let selectedPurposeIds = [];
    let hasSentOtp = false;
    const i18n = {
      en: {
        language: 'Language',
        title: 'Consent Verification',
        subtitle: 'Review details and verify to proceed',
        consentDetails: 'Consent Details',
        fiduciary: 'Fiduciary',
        application: 'Application',
        principal: 'Data Principal',
        requestedData: 'Requested Data',
        purposeProcessing: 'Purpose of Processing',
        validity: 'Validity',
        requestedAt: 'Requested At',
        privacyRightsTitle: 'Your Privacy & Rights',
        privacyRightsSubtitle: 'By continuing, you agree to the use of your data as described.',
        rightsHeading: 'Your Rights (under DPDP Act)',
        right1: 'Access your personal data',
        right2: 'Correct or update your data',
        right3: 'Withdraw consent anytime',
        right4: 'Request deletion of your data',
        retentionHeading: 'Data Retention & Withdrawal',
        retention1: 'Your data is stored only as long as necessary for the stated purpose',
        retention2: 'You can withdraw consent anytime - processing will stop thereafter',
        manageHeading: 'Manage Your Preferences',
        manageText: 'You can log in to our Consent Portal to review or revoke consent, raise a Data Subject Request (DSR), and track your data usage.',
        visitPortal: 'Visit: cms-user.securedapp.io',
        deliveryMethod: 'Select Delivery Method',
        otpMobile: '📱 Mobile',
        otpEmail: '✉️ Email',
        otpWhatsapp: '💬 WhatsApp',
        otpAll: '🔄 All options',
        sendCode: 'Send Code',
        resendCode: 'Resend Code',
        verificationCode: 'Verification Code',
        verifyGrant: 'Verify & Grant Consent',
        poweredBy: 'Powered by SecureDApp CMS',
      },
      // Remaining language mappings (partial localized labels + English fallback).
      as: {
        language: 'ভাষা',
        title: 'সন্মতি যাচাইকৰণ',
        subtitle: 'দয়া কৰি বিৱৰণ চাওক আৰু আগবাঢ়িবলৈ যাচাই কৰক',
        deliveryMethod: 'ডেলিভাৰী পদ্ধতি বাছনি কৰক',
        sendCode: 'কোড পঠাওক',
        resendCode: 'কোড পুনৰ পঠাওক',
        verificationCode: 'যাচাইকৰণ কোড',
        verifyGrant: 'যাচাই কৰি সন্মতি দিয়ক',
      },
      bodo: {
        language: 'राव',
        title: 'सम्मति नायजागोन',
        subtitle: 'गुबुन बिबुंथि नायहरो आरो आगोनायनि थाखाय नायजागोन',
        deliveryMethod: 'डेलिभारि मेथड बासिख',
        sendCode: 'कोड दं',
        resendCode: 'कोड फिन दं',
        verificationCode: 'नायजागोन कोड',
        verifyGrant: 'नायजागोन आरो सम्मति हो',
      },
      dogri: {
        language: 'भाषा',
        title: 'सहमति सत्यापन',
        subtitle: 'कृपा करके विवरण देखो ते अग्गे वधन लेई सत्यापित करो',
        deliveryMethod: 'डिलीवरी तरीका चुनो',
        sendCode: 'कोड भेजो',
        resendCode: 'कोड दोबारा भेजो',
        verificationCode: 'सत्यापन कोड',
        verifyGrant: 'सत्यापित करो ते सहमति दो',
      },
      kn: {
        language: 'ಭಾಷೆ',
        title: 'ಸಮ್ಮತಿ ಪರಿಶೀಲನೆ',
        subtitle: 'ದಯವಿಟ್ಟು ವಿವರಗಳನ್ನು ನೋಡಿ ಮುಂದುವರಿಸಲು ಪರಿಶೀಲಿಸಿ',
        deliveryMethod: 'ವಿತರಣಾ ವಿಧಾನವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
        sendCode: 'ಕೋಡ್ ಕಳುಹಿಸಿ',
        resendCode: 'ಕೋಡ್ ಮರುಕಳುಹಿಸಿ',
        verificationCode: 'ಪರಿಶೀಲನೆ ಕೋಡ್',
        verifyGrant: 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸಮ್ಮತಿ ನೀಡಿ',
      },
      ks: {
        language: 'زبان',
        title: 'رضامندی تصدیق',
        subtitle: 'تفصیل وچھِو تئ آگے بڑھنہ خٲطرٕ تصدیق کرو',
        deliveryMethod: 'ترسیل طریقہٕ ژٲرٕ',
        sendCode: 'کوڈ بھیجو',
        resendCode: 'کوڈ دوبارہ بھیجو',
        verificationCode: 'تصدیق کوڈ',
        verifyGrant: 'تصدیق کرو تئ رضامندی دیو',
      },
      kok: {
        language: 'भास',
        title: 'संमती पडताळणी',
        subtitle: 'कृपया तपशील पळयात आनी फुडें वचपाक पडताळणी करात',
        deliveryMethod: 'डिलिवरी पद्धत वेचात',
        sendCode: 'कोड धाडात',
        resendCode: 'कोड परत धाडात',
        verificationCode: 'पडताळणी कोड',
        verifyGrant: 'पडताळा आनी संमती दियात',
      },
      mai: {
        language: 'भाषा',
        title: 'सहमति सत्यापन',
        subtitle: 'कृपया विवरण देखू आओर आगाँ बढ़बा लेल सत्यापन करू',
        deliveryMethod: 'डिलिवरी तरीका चुनू',
        sendCode: 'कोड भेजू',
        resendCode: 'कोड फेर भेजू',
        verificationCode: 'सत्यापन कोड',
        verifyGrant: 'सत्यापित करू आ सहमति दिअ',
      },
      ml: {
        language: 'ഭാഷ',
        title: 'സമ്മത പരിശോധന',
        subtitle: 'ദയവായി വിവരങ്ങൾ പരിശോധിച്ച് തുടരാൻ സ്ഥിരീകരിക്കുക',
        deliveryMethod: 'ഡെലിവറി മാർഗം തിരഞ്ഞെടുക്കുക',
        sendCode: 'കോഡ് അയയ്ക്കുക',
        resendCode: 'കോഡ് വീണ്ടും അയയ്ക്കുക',
        verificationCode: 'പരിശോധന കോഡ്',
        verifyGrant: 'പരിശോധിച്ച് സമ്മതി നൽകുക',
      },
      mni: {
        language: 'ꯂꯣꯟ',
        title: 'ꯀꯣꯟꯁꯦꯟ ꯚꯦꯔꯤꯐꯤꯀꯦꯁꯟ',
        subtitle: 'ꯑꯣꯏꯕ ꯑꯁꯤ ꯑꯃꯨꯛ ꯌꯥꯝꯅ ꯄꯨꯡꯁꯤꯟꯕꯥꯅ ꯚꯦꯔꯤꯐꯥꯏ ꯇꯧꯕꯤꯌꯨ',
        deliveryMethod: 'ꯗꯤꯂꯤꯚꯔꯤ ꯃꯦꯊꯣꯗ ꯈꯟꯕꯤꯌꯨ',
        sendCode: 'ꯀꯣꯗ ꯊꯥꯕꯤꯌꯨ',
        resendCode: 'ꯀꯣꯗ ꯑꯃꯨꯛ ꯊꯥꯕꯤꯌꯨ',
        verificationCode: 'ꯚꯦꯔꯤꯐꯤꯀꯦꯁꯟ ꯀꯣꯗ',
        verifyGrant: 'ꯚꯦꯔꯤꯐꯥꯏ ꯇꯧꯕꯤ ꯑꯃꯁꯨꯡ ꯀꯣꯟꯁꯦꯟ ꯄꯤꯕꯤꯌꯨ',
      },
      ne: {
        language: 'भाषा',
        title: 'सहमति प्रमाणीकरण',
        subtitle: 'कृपया विवरण हेर्नुहोस् र अगाडि बढ्न प्रमाणीकरण गर्नुहोस्',
        deliveryMethod: 'डेलिभरी विधि छान्नुहोस्',
        sendCode: 'कोड पठाउनुहोस्',
        resendCode: 'कोड पुनः पठाउनुहोस्',
        verificationCode: 'प्रमाणीकरण कोड',
        verifyGrant: 'प्रमाणित गर्नुहोस् र सहमति दिनुहोस्',
      },
      or: {
        language: 'ଭାଷା',
        title: 'ସମ୍ମତି ସତ୍ୟାପନ',
        subtitle: 'ଦୟାକରି ବିବରଣୀ ଦେଖନ୍ତୁ ଏବଂ ଆଗକୁ ବଢିବା ପାଇଁ ସତ୍ୟାପନ କରନ୍ତୁ',
        deliveryMethod: 'ଡେଲିଭେରି ପ୍ରକ୍ରିୟା ବାଛନ୍ତୁ',
        sendCode: 'କୋଡ୍ ପଠାନ୍ତୁ',
        resendCode: 'କୋଡ୍ ପୁନଃ ପଠାନ୍ତୁ',
        verificationCode: 'ସତ୍ୟାପନ କୋଡ୍',
        verifyGrant: 'ସତ୍ୟାପନ କରି ସମ୍ମତି ଦିଅନ୍ତୁ',
      },
      pa: {
        language: 'ਭਾਸ਼ਾ',
        title: 'ਸਹਿਮਤੀ ਪ੍ਰਮਾਣਿਕਤਾ',
        subtitle: 'ਕਿਰਪਾ ਕਰਕੇ ਵੇਰਵਾ ਵੇਖੋ ਅਤੇ ਅੱਗੇ ਵੱਧਣ ਲਈ ਪ੍ਰਮਾਣਿਤ ਕਰੋ',
        deliveryMethod: 'ਡਿਲਿਵਰੀ ਢੰਗ ਚੁਣੋ',
        sendCode: 'ਕੋਡ ਭੇਜੋ',
        resendCode: 'ਕੋਡ ਮੁੜ ਭੇਜੋ',
        verificationCode: 'ਪ੍ਰਮਾਣਿਕਤਾ ਕੋਡ',
        verifyGrant: 'ਪ੍ਰਮਾਣਿਤ ਕਰੋ ਅਤੇ ਸਹਿਮਤੀ ਦਿਓ',
      },
      sa: {
        language: 'भाषा',
        title: 'सम्मति सत्यापनम्',
        subtitle: 'कृपया विवरणानि पश्यन्तु, अग्रे गन्तुं सत्यापनं कुरुत',
        deliveryMethod: 'वितरण-विधिं चिनोतु',
        sendCode: 'संकेताङ्कं प्रेषयतु',
        resendCode: 'संकेताङ्कं पुनः प्रेषयतु',
        verificationCode: 'सत्यापन संकेताङ्कः',
        verifyGrant: 'सत्यापयित्वा सम्मतिं ददातु',
      },
      sat: {
        language: 'ᱵᱷᱟᱥᱟ',
        title: 'ᱥᱚᱢᱢᱚᱛᱤ ᱡᱟᱸᱪ',
        subtitle: 'ᱵᱤᱵᱚᱨᱚᱱ ᱫᱮᱠᱷ ᱟᱨ ᱟᱜᱮ ᱡᱟᱣ ᱞᱟᱹᱜᱤᱫ ᱡᱟᱸᱪ ᱠᱚᱨᱚ',
        deliveryMethod: 'ᱰᱮᱞᱤᱵᱟᱨᱤ ᱫᱟᱹᱨᱤ ᱵᱟᱪᱷᱟ',
        sendCode: 'ᱠᱳᱰ ᱥᱮᱱᱰ ᱠᱚᱨᱚ',
        resendCode: 'ᱠᱳᱰ ᱟᱨᱦᱚᱸ ᱥᱮᱱᱰ ᱠᱚᱨᱚ',
        verificationCode: 'ᱡᱟᱸᱪ ᱠᱳᱰ',
        verifyGrant: 'ᱡᱟᱸᱪ ᱠᱚᱨᱚ ᱟᱨ ᱥᱚᱢᱢᱚᱛᱤ ᱫᱚ',
      },
      sd: {
        language: 'ٻولي',
        title: 'رضامندي جي تصديق',
        subtitle: 'مهرباني ڪري تفصيل ڏسو ۽ اڳتي وڌڻ لاءِ تصديق ڪريو',
        deliveryMethod: 'پهچائڻ جو طريقو چونڊيو',
        sendCode: 'ڪوڊ موڪليو',
        resendCode: 'ڪوڊ ٻيهر موڪليو',
        verificationCode: 'تصديق ڪوڊ',
        verifyGrant: 'تصديق ڪريو ۽ رضامندي ڏيو',
      },
      ur: {
        language: 'زبان',
        title: 'رضامندی کی تصدیق',
        subtitle: 'براہِ کرم تفصیلات دیکھیں اور آگے بڑھنے کے لیے تصدیق کریں',
        deliveryMethod: 'ترسیل کا طریقہ منتخب کریں',
        sendCode: 'کوڈ بھیجیں',
        resendCode: 'کوڈ دوبارہ بھیجیں',
        verificationCode: 'تصدیقی کوڈ',
        verifyGrant: 'تصدیق کریں اور رضامندی دیں',
      },
      hi: {
        language: 'भाषा',
        title: 'सहमति सत्यापन',
        subtitle: 'कृपया विवरण देखें और आगे बढ़ने के लिए सत्यापित करें',
        consentDetails: 'सहमति विवरण',
        fiduciary: 'डेटा फिड्युशियरी',
        application: 'एप्लिकेशन',
        principal: 'डेटा प्रिंसिपल',
        requestedData: 'अनुरोधित डेटा',
        purposeProcessing: 'प्रोसेसिंग का उद्देश्य',
        validity: 'वैधता',
        requestedAt: 'अनुरोध समय',
        privacyRightsTitle: 'आपकी गोपनीयता और अधिकार',
        privacyRightsSubtitle: 'आगे बढ़कर, आप वर्णित तरीके से अपने डेटा के उपयोग से सहमत होते हैं।',
        rightsHeading: 'आपके अधिकार (DPDP अधिनियम के तहत)',
        right1: 'अपने व्यक्तिगत डेटा तक पहुंच',
        right2: 'अपने डेटा को सही या अपडेट करें',
        right3: 'कभी भी सहमति वापस लें',
        right4: 'अपने डेटा को हटाने का अनुरोध करें',
        retentionHeading: 'डेटा संरक्षण और वापसी',
        retention1: 'आपका डेटा केवल बताए गए उद्देश्य के लिए आवश्यक अवधि तक ही संग्रहीत किया जाता है',
        retention2: 'आप कभी भी सहमति वापस ले सकते हैं - उसके बाद प्रोसेसिंग बंद हो जाएगी',
        manageHeading: 'अपनी प्राथमिकताएं प्रबंधित करें',
        manageText: 'आप हमारी सहमति पोर्टल में लॉगिन करके सहमति की समीक्षा/वापसी, DSR अनुरोध और अपने डेटा उपयोग को ट्रैक कर सकते हैं।',
        visitPortal: 'देखें: cms-user.securedapp.io',
        deliveryMethod: 'डिलीवरी विधि चुनें',
        otpMobile: '📱 मोबाइल',
        otpEmail: '✉️ ईमेल',
        otpWhatsapp: '💬 व्हाट्सऐप',
        otpAll: '🔄 सभी विकल्प',
        sendCode: 'कोड भेजें',
        resendCode: 'कोड पुनः भेजें',
        verificationCode: 'सत्यापन कोड',
        verifyGrant: 'सत्यापित करें और सहमति दें',
        poweredBy: 'संचालित द्वारा SecureDApp CMS',
      },
      bn: {
        language: 'ভাষা',
        title: 'সম্মতি যাচাইকরণ',
        subtitle: 'অনুগ্রহ করে বিবরণ দেখুন এবং এগোতে যাচাই করুন',
        consentDetails: 'সম্মতির বিবরণ',
        fiduciary: 'ডেটা ফিডিউশিয়ারি',
        application: 'অ্যাপ্লিকেশন',
        principal: 'ডেটা প্রিন্সিপাল',
        requestedData: 'অনুরোধ করা ডেটা',
        purposeProcessing: 'প্রসেসিংয়ের উদ্দেশ্য',
        validity: 'মেয়াদ',
        requestedAt: 'অনুরোধের সময়',
        privacyRightsTitle: 'আপনার গোপনীয়তা ও অধিকার',
        privacyRightsSubtitle: 'চালিয়ে গেলে, বর্ণিতভাবে আপনার ডেটা ব্যবহারে আপনি সম্মত হচ্ছেন।',
        rightsHeading: 'আপনার অধিকার (DPDP আইনের অধীনে)',
        right1: 'আপনার ব্যক্তিগত ডেটা অ্যাক্সেস করুন',
        right2: 'আপনার ডেটা সংশোধন বা আপডেট করুন',
        right3: 'যেকোনো সময় সম্মতি প্রত্যাহার করুন',
        right4: 'আপনার ডেটা মুছে ফেলার অনুরোধ করুন',
        retentionHeading: 'ডেটা সংরক্ষণ ও প্রত্যাহার',
        retention1: 'উল্লিখিত উদ্দেশ্যের জন্য যতদিন প্রয়োজন ততদিনই আপনার ডেটা রাখা হয়',
        retention2: 'আপনি যেকোনো সময় সম্মতি প্রত্যাহার করতে পারেন - এরপর প্রসেসিং বন্ধ হবে',
        manageHeading: 'আপনার পছন্দ পরিচালনা করুন',
        manageText: 'আপনি আমাদের কনসেন্ট পোর্টালে লগইন করে সম্মতি পর্যালোচনা/প্রত্যাহার, DSR রিকোয়েস্ট এবং ডেটা ব্যবহারের ট্র্যাক করতে পারবেন।',
        visitPortal: 'ভিজিট করুন: cms-user.securedapp.io',
        deliveryMethod: 'ডেলিভারি পদ্ধতি নির্বাচন করুন',
        otpMobile: '📱 মোবাইল',
        otpEmail: '✉️ ইমেইল',
        otpWhatsapp: '💬 হোয়াটসঅ্যাপ',
        otpAll: '🔄 সব বিকল্প',
        sendCode: 'কোড পাঠান',
        resendCode: 'পুনরায় কোড পাঠান',
        verificationCode: 'যাচাইকরণ কোড',
        verifyGrant: 'যাচাই করুন ও সম্মতি দিন',
        poweredBy: 'চালিত SecureDApp CMS দ্বারা',
      },
      gu: {
        language: 'ભાષા',
        title: 'સંમતિ ચકાસણી',
        subtitle: 'કૃપા કરીને વિગતો જુઓ અને આગળ વધવા માટે ચકાસો',
        consentDetails: 'સંમતિ વિગતો',
        fiduciary: 'ડેટા ફિડ્યુશિયરી',
        application: 'એપ્લિકેશન',
        principal: 'ડેટા પ્રિન્સિપલ',
        requestedData: 'વિનંતી કરાયેલ ડેટા',
        purposeProcessing: 'પ્રોસેસિંગનો હેતુ',
        validity: 'માન્યતા',
        requestedAt: 'વિનંતી સમય',
        privacyRightsTitle: 'તમારી ગોપનીયતા અને અધિકારો',
        privacyRightsSubtitle: 'આગળ વધીને, તમે વર્ણવ્યા મુજબ તમારા ડેટાના ઉપયોગ માટે સંમત થાઓ છો.',
        rightsHeading: 'તમારા અધિકારો (DPDP અધિનિયમ હેઠળ)',
        right1: 'તમારા વ્યક્તિગત ડેટાને ઍક્સેસ કરો',
        right2: 'તમારો ડેટા સુધારો અથવા અપડેટ કરો',
        right3: 'ક્યારેય પણ સંમતિ પાછી ખેંચો',
        right4: 'તમારો ડેટા કાઢી નાખવાની વિનંતી કરો',
        retentionHeading: 'ડેટા જાળવણી અને પરત ખેંચવું',
        retention1: 'તમારો ડેટા માત્ર જણાવેલા હેતુ માટે જરૂરી જેટલો સમય જ સંગ્રહિત થાય છે',
        retention2: 'તમે ક્યારેય પણ સંમતિ પાછી ખેંચી શકો છો - ત્યારબાદ પ્રોસેસિંગ બંધ થશે',
        manageHeading: 'તમારી પસંદગીઓ મેનેજ કરો',
        manageText: 'તમે અમારી કન્સેન્ટ પોર્ટલમાં લોગિન કરીને સંમતિની સમીક્ષા/રદ, DSR વિનંતી અને ડેટા ઉપયોગ ટ્રેક કરી શકો છો.',
        visitPortal: 'મુલાકાત લો: cms-user.securedapp.io',
        deliveryMethod: 'ડિલિવરી પદ્ધતિ પસંદ કરો',
        otpMobile: '📱 મોબાઇલ',
        otpEmail: '✉️ ઇમેઇલ',
        otpWhatsapp: '💬 વોટ્સએપ',
        otpAll: '🔄 બધા વિકલ્પો',
        sendCode: 'કોડ મોકલો',
        resendCode: 'કોડ ફરી મોકલો',
        verificationCode: 'ચકાસણી કોડ',
        verifyGrant: 'ચકાસો અને સંમતિ આપો',
        poweredBy: 'SecureDApp CMS દ્વારા સંચાલિત',
      },
      mr: {
        language: 'भाषा',
        title: 'संमती पडताळणी',
        subtitle: 'कृपया तपशील पहा आणि पुढे जाण्यासाठी पडताळणी करा',
        consentDetails: 'संमती तपशील',
        fiduciary: 'डेटा फिड्युशियरी',
        application: 'अॅप्लिकेशन',
        principal: 'डेटा प्रिन्सिपल',
        requestedData: 'विनंती केलेला डेटा',
        purposeProcessing: 'प्रक्रियेचा उद्देश',
        validity: 'वैधता',
        requestedAt: 'विनंतीची वेळ',
        privacyRightsTitle: 'तुमची गोपनीयता आणि हक्क',
        privacyRightsSubtitle: 'पुढे जाऊन, तुम्ही वर्णन केल्याप्रमाणे तुमच्या डेटाच्या वापरास सहमती देता.',
        rightsHeading: 'तुमचे हक्क (DPDP कायद्यानुसार)',
        right1: 'तुमच्या वैयक्तिक डेटाला प्रवेश',
        right2: 'तुमचा डेटा दुरुस्त किंवा अद्ययावत करा',
        right3: 'कधीही संमती मागे घ्या',
        right4: 'तुमचा डेटा हटविण्याची विनंती करा',
        retentionHeading: 'डेटा जतन आणि माघार',
        retention1: 'तुमचा डेटा फक्त सांगितलेल्या उद्देशासाठी आवश्यक तेवढाच कालावधी ठेवला जातो',
        retention2: 'तुम्ही कधीही संमती मागे घेऊ शकता - त्यानंतर प्रक्रिया थांबवली जाईल',
        manageHeading: 'तुमच्या पसंती व्यवस्थापित करा',
        manageText: 'तुम्ही आमच्या Consent Portal मध्ये लॉगिन करून संमती पुनरावलोकन/रद्द, DSR विनंती आणि डेटा वापर ट्रॅक करू शकता.',
        visitPortal: 'भेट द्या: cms-user.securedapp.io',
        deliveryMethod: 'डिलिव्हरी पद्धत निवडा',
        otpMobile: '📱 मोबाइल',
        otpEmail: '✉️ ईमेल',
        otpWhatsapp: '💬 व्हॉट्सअॅप',
        otpAll: '🔄 सर्व पर्याय',
        sendCode: 'कोड पाठवा',
        resendCode: 'कोड पुन्हा पाठवा',
        verificationCode: 'पडताळणी कोड',
        verifyGrant: 'पडताळा आणि संमती द्या',
        poweredBy: 'SecureDApp CMS द्वारे समर्थित',
      },
      ta: {
        language: 'மொழி',
        title: 'ஒப்புதல் சரிபார்ப்பு',
        subtitle: 'விவரங்களை பார்த்து தொடர சரிபார்க்கவும்',
        consentDetails: 'ஒப்புதல் விவரங்கள்',
        fiduciary: 'தரவு நம்பிக்கையாளர்',
        application: 'பயன்பாடு',
        principal: 'டேட்டா பிரின்சிபல்',
        requestedData: 'கோரப்பட்ட தரவு',
        purposeProcessing: 'செயலாக்க நோக்கம்',
        validity: 'செல்லுபடியாகும் காலம்',
        requestedAt: 'கோரிய நேரம்',
        privacyRightsTitle: 'உங்கள் தனியுரிமை & உரிமைகள்',
        privacyRightsSubtitle: 'தொடர்வதன் மூலம், விளக்கப்பட்டபடி உங்கள் தரவு பயன்பாட்டிற்கு நீங்கள் ஒப்புக்கொள்கிறீர்கள்.',
        rightsHeading: 'உங்கள் உரிமைகள் (DPDP சட்டத்தின் கீழ்)',
        right1: 'உங்கள் தனிப்பட்ட தரவை அணுகுதல்',
        right2: 'உங்கள் தரவை திருத்துதல் அல்லது புதுப்பித்தல்',
        right3: 'எப்போது வேண்டுமானாலும் ஒப்புதலை திரும்பப் பெறுதல்',
        right4: 'உங்கள் தரவை அழிக்க கோருதல்',
        retentionHeading: 'தரவு சேமிப்பு & வாபஸ் பெறுதல்',
        retention1: 'கூறப்பட்ட நோக்கத்திற்குத் தேவையான அளவு நேரம் மட்டுமே உங்கள் தரவு சேமிக்கப்படும்',
        retention2: 'நீங்கள் எப்போது வேண்டுமானாலும் ஒப்புதலை திரும்பப் பெறலாம் - அதன் பிறகு செயலாக்கம் நிறுத்தப்படும்',
        manageHeading: 'உங்கள் விருப்பங்களை நிர்வகிக்கவும்',
        manageText: 'எங்கள் Consent Portal-ல் உள்நுழைந்து ஒப்புதலை பரிசீலிக்க/ரத்து செய்ய, DSR கோரிக்கை எழுப்ப, மற்றும் தரவு பயன்பாட்டை கண்காணிக்கலாம்.',
        visitPortal: 'பார்வையிட: cms-user.securedapp.io',
        deliveryMethod: 'டெலிவரி முறையை தேர்ந்தெடுக்கவும்',
        otpMobile: '📱 மொபைல்',
        otpEmail: '✉️ மின்னஞ்சல்',
        otpWhatsapp: '💬 வாட்ஸ்அப்',
        otpAll: '🔄 அனைத்து விருப்பங்களும்',
        sendCode: 'குறியீட்டை அனுப்பு',
        resendCode: 'குறியீட்டை மீண்டும் அனுப்பு',
        verificationCode: 'சரிபார்ப்பு குறியீடு',
        verifyGrant: 'சரிபார்த்து ஒப்புதல் வழங்கு',
        poweredBy: 'SecureDApp CMS மூலம் இயக்கப்படுகிறது',
      },
      te: {
        language: 'భాష',
        title: 'సమ్మతి ధృవీకరణ',
        subtitle: 'దయచేసి వివరాలు చూసి కొనసాగడానికి ధృవీకరించండి',
        consentDetails: 'సమ్మతి వివరాలు',
        fiduciary: 'డేటా ఫిడ్యూషియరీ',
        application: 'అప్లికేషన్',
        principal: 'డేటా ప్రిన్సిపల్',
        requestedData: 'అభ్యర్థించిన డేటా',
        purposeProcessing: 'ప్రాసెసింగ్ ఉద్దేశ్యం',
        validity: 'చెల్లుబాటు',
        requestedAt: 'అభ్యర్థన సమయం',
        privacyRightsTitle: 'మీ గోప్యత & హక్కులు',
        privacyRightsSubtitle: 'కొనసాగడం ద్వారా, వివరించినట్లుగా మీ డేటా వినియోగానికి మీరు అంగీకరిస్తున్నారు.',
        rightsHeading: 'మీ హక్కులు (DPDP చట్టం ప్రకారం)',
        right1: 'మీ వ్యక్తిగత డేటాను ప్రాప్తి చేయండి',
        right2: 'మీ డేటాను సరిచేయండి లేదా నవీకరించండి',
        right3: 'ఎప్పుడైనా సమ్మతిని ఉపసంహరించుకోండి',
        right4: 'మీ డేటా తొలగింపును అభ్యర్థించండి',
        retentionHeading: 'డేటా నిల్వ & ఉపసంహరణ',
        retention1: 'పేర్కొన్న ఉద్దేశానికి అవసరమైనంత కాలం మాత్రమే మీ డేటా నిల్వ చేయబడుతుంది',
        retention2: 'మీరు ఎప్పుడైనా సమ్మతిని ఉపసంహరించుకోవచ్చు - తరువాత ప్రాసెసింగ్ ఆగిపోతుంది',
        manageHeading: 'మీ ప్రాధాన్యతలను నిర్వహించండి',
        manageText: 'మా Consent Portal లో లాగిన్ అయి సమ్మతి సమీక్ష/రద్దు, DSR అభ్యర్థన మరియు డేటా వినియోగాన్ని ట్రాక్ చేయవచ్చు.',
        visitPortal: 'సందర్శించండి: cms-user.securedapp.io',
        deliveryMethod: 'డెలివరీ విధానాన్ని ఎంచుకోండి',
        otpMobile: '📱 మొబైల్',
        otpEmail: '✉️ ఇమెయిల్',
        otpWhatsapp: '💬 వాట్సాప్',
        otpAll: '🔄 అన్ని ఎంపికలు',
        sendCode: 'కోడ్ పంపండి',
        resendCode: 'కోడ్ మళ్లీ పంపండి',
        verificationCode: 'ధృవీకరణ కోడ్',
        verifyGrant: 'ధృవీకరించి సమ్మతి ఇవ్వండి',
        poweredBy: 'SecureDApp CMS ద్వారా నడపబడుతుంది',
      },
    };
    Object.keys(i18n).forEach((k) => {
      if (k !== 'en') i18n[k] = { ...i18n.en, ...i18n[k] };
    });

    function applyLanguage(lang) {
      const t = i18n[lang] || i18n.en;
      document.documentElement.lang = lang;
      document.getElementById('langLabel').textContent = t.language;
      document.getElementById('titleText').textContent = t.title;
      document.getElementById('subtitleText').textContent = t.subtitle;
      document.getElementById('consentDetailsTitle').textContent = t.consentDetails;
      document.getElementById('fiduciaryLabel').textContent = t.fiduciary;
      document.getElementById('applicationLabel').textContent = t.application;
      document.getElementById('principalLabel').textContent = t.principal;
      document.getElementById('requestedDataLabel').textContent = t.requestedData;
      document.getElementById('purposeProcessingLabel').textContent = t.purposeProcessing;
      document.getElementById('validityLabel').textContent = t.validity;
      document.getElementById('requestedAtLabel').textContent = t.requestedAt;
      document.getElementById('privacyRightsTitle').textContent = t.privacyRightsTitle;
      document.getElementById('privacyRightsSubtitle').textContent = t.privacyRightsSubtitle;
      document.getElementById('rightsHeading').textContent = t.rightsHeading;
      document.getElementById('right1').textContent = t.right1;
      document.getElementById('right2').textContent = t.right2;
      document.getElementById('right3').textContent = t.right3;
      document.getElementById('right4').textContent = t.right4;
      document.getElementById('retentionHeading').textContent = t.retentionHeading;
      document.getElementById('retention1').textContent = t.retention1;
      document.getElementById('retention2').textContent = t.retention2;
      document.getElementById('manageHeading').textContent = t.manageHeading;
      document.getElementById('manageText').textContent = t.manageText;
      document.getElementById('visitPortalLink').textContent = t.visitPortal;
      document.getElementById('deliveryMethodLabel').textContent = t.deliveryMethod;
      document.getElementById('otpMobileLabel').textContent = t.otpMobile;
      document.getElementById('otpEmailLabel').textContent = t.otpEmail;
      document.getElementById('otpWhatsappLabel').textContent = t.otpWhatsapp;
      document.getElementById('otpAllLabel').textContent = t.otpAll;
      document.getElementById('verificationCodeLabel').textContent = t.verificationCode;
      document.getElementById('verifyBtnText').textContent = t.verifyGrant;
      document.getElementById('poweredByText').textContent = t.poweredBy;
      if (sendBtn.textContent.trim().toLowerCase().includes('resend')) {
        document.getElementById('sendBtnText').textContent = t.resendCode;
      } else {
        document.getElementById('sendBtnText').textContent = t.sendCode;
      }
    }
    languageSelect.addEventListener('change', (e) => applyLanguage(e.target.value));
    applyLanguage('en');

    function renderPurposeAndDataSelection() {
      const container = document.getElementById('purposeSelectionContainer');
      const requestedDataList = document.getElementById('requestedDataList');
      container.innerHTML = '';
      requestedDataList.innerHTML = '';

      if (!Array.isArray(sessionPurposes) || sessionPurposes.length === 0) {
        container.innerHTML = '<ul class="summary-list"><li>General Processing</li></ul>';
        return;
      }

      const aggregateData = new Set();
      sessionPurposes.forEach((purpose) => {
        const pid = purpose.id;
        const checked = selectedPurposeIds.includes(pid);
        const card = document.createElement('div');
        card.className = 'purpose-card';
        const dataItems = Array.isArray(purpose.required_data) ? purpose.required_data : [];
        const dataItemsHtml = dataItems.map((dp) => {
          if (checked) aggregateData.add(dp);
          const isChecked = checked ? 'checked' : '';
          return '<label><input type="checkbox" disabled ' + isChecked + '><span>' + dp + '</span></label>';
        }).join('');
        card.innerHTML = ''
          + '<label>'
          +   '<input type="checkbox" data-purpose-id="' + pid + '" ' + (checked ? 'checked' : '') + '>'
          +   '<span>' + (purpose.name || 'Purpose') + '</span>'
          + '</label>'
          + (dataItems.length > 0 ? '<div class="data-items">' + dataItemsHtml + '</div>' : '');
        container.appendChild(card);
      });

      if (aggregateData.size === 0) {
        requestedDataList.innerHTML = '<li>No data selected.</li>';
      } else {
        requestedDataList.innerHTML = Array.from(aggregateData).map((dp) => '<li>' + dp + '</li>').join('');
      }

      const purposeToggles = container.querySelectorAll('input[data-purpose-id]');
      purposeToggles.forEach((el) => {
        el.addEventListener('change', () => {
          const pid = el.getAttribute('data-purpose-id');
          if (el.checked) {
            if (!selectedPurposeIds.includes(pid)) selectedPurposeIds.push(pid);
          } else {
            selectedPurposeIds = selectedPurposeIds.filter((x) => x !== pid);
          }
          renderPurposeAndDataSelection();
        });
      });
    }
    renderPurposeAndDataSelection();

    function getSelectedOtpModes() {
      return otpModeItems.filter((el) => el.checked).map((el) => el.value);
    }

    function syncAllCheckboxFromItems() {
      const selectedCount = getSelectedOtpModes().length;
      otpModeAll.checked = selectedCount === otpModeItems.length;
      otpModeAll.indeterminate = selectedCount > 0 && selectedCount < otpModeItems.length;
    }
    otpModeAll.addEventListener('change', () => {
      otpModeItems.forEach((el) => { el.checked = otpModeAll.checked; });
      syncAllCheckboxFromItems();
    });
    otpModeItems.forEach((el) => {
      el.addEventListener('change', () => {
        syncAllCheckboxFromItems();
      });
    });
    syncAllCheckboxFromItems();

    function setBusy(isBusy) {
      sendBtn.disabled = isBusy;
      verifyBtn.disabled = isBusy;
      otpInput.disabled = isBusy;
      busyOverlay.style.display = isBusy ? 'block' : 'none';
      
      otpModeAll.disabled = isBusy;
      otpModeItems.forEach((r) => { r.disabled = isBusy; });
    }

    function setMsg(text, tone) {
      msg.textContent = text;
      msg.classList.remove('success', 'error');
      if (tone === 'success') msg.classList.add('success');
      if (tone === 'error') msg.classList.add('error');
    }

    function setSendOtpLoading(isLoading) {
      sendBtn.classList.toggle('btn-loading', isLoading);
      sendBtn.disabled = isLoading;
      document.getElementById('sendBtnText').textContent = isLoading
        ? 'Sending...'
        : ((i18n[languageSelect.value] || i18n.en)[hasSentOtp ? 'resendCode' : 'sendCode']);
    }

    sendBtn.onclick = async () => {
      setBusy(true);
      setSendOtpLoading(true);
      setMsg('Sending verification code...');
      try {
        const otp_modes = getSelectedOtpModes();
        if (otp_modes.length === 0) throw new Error('Select at least one delivery method');
        const res = await fetch('/public/consent/redirect/' + encodeURIComponent(token) + '/send-otp', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp_modes })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send verification code');
        
        setMsg(
          data.dev_otp
            ? ('Code sent. (Dev mode: ' + data.dev_otp + ')')
            : 'Verification code sent successfully.',
          'success'
        );
        
        // Enable verify section
        verifySection.classList.add('active');
        otpInput.focus();
        hasSentOtp = true;
        document.getElementById('sendBtnText').textContent = (i18n[languageSelect.value] || i18n.en).resendCode;

      } catch (e) {
        setMsg(e.message || 'Failed to send verification code', 'error');
      } finally {
        setBusy(false);
        setSendOtpLoading(false);
      }
    };

    verifyBtn.onclick = async () => {
      const otp = (otpInput.value || '').trim();
      if (!/^\\d{6}$/.test(otp)) {
        setMsg('Please enter a valid 6-digit code.', 'error');
        return;
      }
      setBusy(true);
      setMsg('Verifying and granting consent...');
      try {
        const res = await fetch('/public/consent/redirect/' + encodeURIComponent(token) + '/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otp, purpose_ids: selectedPurposeIds }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to verify code');
        
        if (data.already_consented) {
          setMsg('Consent was already granted.', 'success');
          setTimeout(() => { window.close(); }, 5000);
        } else {
          setMsg('Success! Consent has been securely granted. This window will close in 5 seconds.', 'success');
          verifySection.classList.remove('active');
          sendBtn.disabled = true;
          otpModeAll.disabled = true;
          otpModeItems.forEach((r) => { r.disabled = true; });
          setTimeout(() => { window.close(); }, 5000);
        }
      } catch (e) {
        setMsg(e.message || 'Verification failed. Please try again.', 'error');
      } finally {
        setBusy(false);
      }
    };
  </script>
</body>
</html>`;
}

// Helper to escape HTML for safety
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function createRequest(req, res, next) {
  try {
    const appId = req.appId || req.params.appId;
    const payload = await redirectConsentService.createRedirectConsentRequest(req, req.tenant.id, appId, req.body);
    res.status(201).json(payload);
  } catch (err) {
    next(err);
  }
}

async function getHostedPage(req, res, next) {
  try {
    const session = await redirectConsentService.getRedirectSessionByToken(req.params.token, true);
    // This page renders inline CSS/JS; allow them on this route even when Helmet CSP is enabled in production.
    res.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    res.type('html').send(renderRedirectConsentPage(req.params.token, session));
  } catch (err) {
    next(err);
  }
}

async function sendOtp(req, res, next) {
  try {
    const otpModes = Array.isArray(req.body.otp_modes) ? req.body.otp_modes : null;
    const otpMode = otpModes && otpModes.length > 0 ? otpModes : (req.body.otp_mode || 'mobile');
    const payload = await redirectConsentService.sendOtp(req.params.token, otpMode);
    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const payload = await redirectConsentService.verifyOtpAndGrantConsent(
      req.params.token,
      req.body.otp,
      getClientIp(req),
      req.body.purpose_ids
    );
    res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRequest,
  getHostedPage,
  sendOtp,
  verifyOtp,
};
