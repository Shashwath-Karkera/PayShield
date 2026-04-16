import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (email, otp, name = 'User') => {
  const provider = String(process.env.EMAIL_OTP_PROVIDER || 'smtp').toLowerCase();
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.OTP_FROM_EMAIL || smtpUser;

  if (provider !== 'smtp') {
    console.log(`[TEST MODE] OTP for ${email}: ${otp}`);
    return { success: true, testMode: true, otp };
  }

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !fromEmail) {
    return {
      success: false,
      error: 'Missing SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/OTP_FROM_EMAIL while EMAIL_OTP_PROVIDER=smtp'
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: `"PAYSHIELD Security" <${fromEmail}>`,
      to: email,
      subject: 'PAYSHIELD - Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4f46e5;">PAYSHIELD Verification</h2>
          <p>Hello ${name},</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 8px;">
            <span style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #4f46e5;">${otp}</span>
          </div>
          <p>This code expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">PAYSHIELD - Secure Payment Platform</p>
        </div>
      `
    });

    console.log(`✅ Email sent to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};