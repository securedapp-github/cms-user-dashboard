const logger = require('../config/logger');

// SMS configuration (placeholders for Twilio/SNS etc.)
const smsAccountSid = process.env.SMS_ACCOUNT_SID;
const smsAuthToken = process.env.SMS_AUTH_TOKEN;
const smsFromNumber = process.env.SMS_FROM_NUMBER;

function isSmsConfigured() {
  return Boolean(smsAccountSid && smsAuthToken && smsFromNumber);
}

/**
 * Send SMS OTP. 
 * For now, this is a placeholder/mock that logs to console if not configured.
 */
async function sendOtpSms(to, otpCode) {
  if (!isSmsConfigured()) {
    logger.info(`[SMS SIMULATION] To: ${to}, Message: Your OTP for consent verification is ${otpCode}`);
    return { sent: false, reason: 'sms_not_configured', simulated: true };
  }

  try {
    // Example Twilio integration (uncomment and install 'twilio' if needed)
    /*
    const twilio = require('twilio');
    const client = twilio(smsAccountSid, smsAuthToken);
    await client.messages.create({
      body: `Your OTP for consent verification is ${otpCode}. It is valid for 10 minutes.`,
      from: smsFromNumber,
      to: to
    });
    */
    logger.info(`SMS sent to ${to}`);
    return { sent: true };
  } catch (err) {
    logger.error(`Error sending SMS to ${to}: ${err.message}`);
    return { sent: false, reason: 'error', error: err.message };
  }
}

module.exports = {
  isSmsConfigured,
  sendOtpSms,
};
