import twilio from 'twilio';

let client = null;

// Initialize Twilio with your credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();

if (accountSid && authToken && accountSid !== 'your-twilio-account-sid') {
  client = twilio(accountSid, authToken);
  console.log('✅ Twilio SMS service configured');
} else {
  console.log('⚠️ Twilio not configured - SMS will use test mode');
}

function normalizePhoneNumber(input, defaultCountryCode = '+91') {
  if (!input) {
    return null;
  }

  let value = String(input).trim();

  // Reject masked placeholders such as +918636137XXXX early.
  if (/[a-zA-Z]/.test(value)) {
    return null;
  }

  value = value.replace(/[\s\-().]/g, '');

  if (value.startsWith('00')) {
    value = `+${value.slice(2)}`;
  }

  if (value.startsWith('+')) {
    value = `+${value.slice(1).replace(/\D/g, '')}`;
  } else {
    const digits = value.replace(/\D/g, '');

    if (digits.length === 10) {
      const countryDigits = String(defaultCountryCode).replace(/\D/g, '');
      value = `+${countryDigits}${digits}`;
    } else if (digits.length >= 8 && digits.length <= 15) {
      value = `+${digits}`;
    } else {
      return null;
    }
  }

  if (!/^\+[1-9]\d{7,14}$/.test(value)) {
    return null;
  }

  return value;
}

export const sendVerificationSMS = async (phoneNumber, otp) => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  const fromPhone = process.env.TWILIO_PHONE_NUMBER?.trim();

  if (!normalizedPhone) {
    return {
      success: false,
      code: 'INVALID_PHONE',
      error: 'Invalid phone number format. Use E.164 format, e.g. +918636137000'
    };
  }

  if (!client) {
    console.log(`[TEST MODE] SMS would be sent to ${normalizedPhone} with OTP: ${otp}`);
    return { success: true, testMode: true, otp };
  }

  try {
    const message = await client.messages.create({
      body: `🔐 PAYSHIELD: Your verification code is ${otp}. Valid for 10 minutes. Do not share this code.`,
      from: fromPhone,
      to: normalizedPhone,
    });
    console.log(`✅ SMS sent to ${normalizedPhone}: ${message.sid}`);
    return { success: true, messageId: message.sid, to: normalizedPhone };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, code: error.code, error: error.message };
  }
};