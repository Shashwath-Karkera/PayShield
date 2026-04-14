import nodemailer from 'nodemailer';

function getSmtpConfig() {
  const provider = (process.env.EMAIL_OTP_PROVIDER || 'smtp').toLowerCase();

  if (provider !== 'smtp') {
    return { provider, enabled: false, reason: 'EMAIL_OTP_PROVIDER is not smtp' };
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.OTP_FROM_EMAIL;

  if (!host || !port || !user || !pass || !from) {
    return {
      provider,
      enabled: false,
      reason: 'Missing SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/OTP_FROM_EMAIL'
    };
  }

  return {
    provider,
    enabled: true,
    host,
    port,
    secure,
    user,
    pass,
    from
  };
}

async function sendOtpMail({ toEmail, subject, html }) {
  const cfg = getSmtpConfig();

  if (!cfg.enabled) {
    return { sent: false, provider: cfg.provider, error: cfg.reason };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: {
        user: cfg.user,
        pass: cfg.pass
      }
    });

    await transporter.sendMail({
      from: cfg.from,
      to: toEmail,
      subject,
      html
    });

    return { sent: true, provider: 'smtp' };
  } catch (error) {
    return { sent: false, provider: 'smtp', error: String(error.message || error) };
  }
}

export async function sendEmailOtp({ toEmail, otpCode }) {
  return sendOtpMail({
    toEmail,
    subject: 'PayShield Verification OTP',
    html: `<p>Your PayShield email OTP is <strong>${otpCode}</strong>.</p><p>It expires in 10 minutes.</p>`
  });
}

export async function sendSmsOtp({ toEmail, otpCode }) {
  return sendOtpMail({
    toEmail,
    subject: 'PayShield SMS OTP (Email Delivery)',
    html: `<p>Your PayShield SMS OTP (email delivery mode) is <strong>${otpCode}</strong>.</p><p>It expires in 10 minutes.</p>`
  });
}
