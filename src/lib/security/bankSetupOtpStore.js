import { prisma } from '@/lib/prisma';

const EMAIL_TYPE = 'bank_setup_email';
const PHONE_TYPE = 'bank_setup_phone';

function isMissingCanonicalOtpTableError(error) {
  if (!error) {
    return false;
  }

  if (error.code === 'P2021') {
    return true;
  }

  const message = String(error.message || '').toLowerCase();
  return message.includes('otpcode') && message.includes('does not exist');
}

export async function storeBankSetupOtps({ userId, email, phone, emailOtpEnc, smsOtpEnc, expiresAt }) {
  try {
    await prisma.$transaction([
      prisma.otpCode.deleteMany({
        where: {
          userId,
          type: EMAIL_TYPE
        }
      }),
      prisma.otpCode.deleteMany({
        where: {
          userId,
          type: PHONE_TYPE
        }
      }),
      prisma.otpCode.create({
        data: {
          userId,
          identifier: email,
          type: EMAIL_TYPE,
          otpEnc: emailOtpEnc,
          expiresAt
        }
      }),
      prisma.otpCode.create({
        data: {
          userId,
          identifier: phone,
          type: PHONE_TYPE,
          otpEnc: smsOtpEnc,
          expiresAt
        }
      })
    ]);
    return;
  } catch (error) {
    if (!isMissingCanonicalOtpTableError(error)) {
      throw error;
    }
  }

  await prisma.$transaction([
    prisma.$executeRaw`
      DELETE FROM otp_codes
      WHERE (identifier = ${email} AND type = ${EMAIL_TYPE})
         OR (identifier = ${phone} AND type = ${PHONE_TYPE})
    `,
    prisma.$executeRaw`
      INSERT INTO otp_codes (identifier, otp, type, expires_at)
      VALUES
        (${email}, ${emailOtpEnc}, ${EMAIL_TYPE}, ${expiresAt}),
        (${phone}, ${smsOtpEnc}, ${PHONE_TYPE}, ${expiresAt})
    `
  ]);
}

export async function getLatestBankSetupOtp({ userId, identifier, type }) {
  try {
    return await prisma.otpCode.findFirst({
      where: {
        userId,
        identifier,
        type,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    if (!isMissingCanonicalOtpTableError(error)) {
      throw error;
    }
  }

  const rows = await prisma.$queryRaw`
    SELECT
      id::text AS id,
      identifier,
      otp AS "otpEnc",
      type,
      expires_at AS "expiresAt",
      created_at AS "createdAt"
    FROM otp_codes
    WHERE identifier = ${identifier}
      AND type = ${type}
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `;

  return rows[0] || null;
}

export async function clearBankSetupOtps({ userId, email, phone }) {
  try {
    await prisma.otpCode.deleteMany({
      where: {
        userId,
        type: {
          in: [EMAIL_TYPE, PHONE_TYPE]
        }
      }
    });
    return;
  } catch (error) {
    if (!isMissingCanonicalOtpTableError(error)) {
      throw error;
    }
  }

  await prisma.$executeRaw`
    DELETE FROM otp_codes
    WHERE (identifier = ${email} AND type = ${EMAIL_TYPE})
       OR (identifier = ${phone} AND type = ${PHONE_TYPE})
  `;
}
