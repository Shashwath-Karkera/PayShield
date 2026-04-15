import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { encryptOtp, generateOtpCode } from '@/lib/security/verification';
import { sendEmailOtp, sendSmsOtp } from '@/lib/notifications/otp';

const schema = z.object({
  verificationId: z.string().min(1)
});

export async function POST(request) {
  try {
    const data = schema.parse(await request.json());

    const verification = await prisma.authVerification.findUnique({
      where: { id: data.verificationId },
      include: { user: true, session: true }
    });

    if (!verification) {
      return Response.json({ error: 'Verification session not found.' }, { status: 404 });
    }

    const auth = await requireSession(request, verification.userId, { requireVerified: false });
    if (!auth.ok) {
      return auth.response;
    }

    if (auth.session.id !== verification.sessionId) {
      return Response.json({ error: 'Verification session mismatch.' }, { status: 403 });
    }

    if (new Date(verification.expiresAt).getTime() < Date.now()) {
      return Response.json({ error: 'Verification expired. Please sign in again.' }, { status: 410 });
    }

    const emailOtp = generateOtpCode();
    const smsOtp = generateOtpCode();

    const [emailResult, smsResult] = await Promise.all([
      sendEmailOtp({ toEmail: verification.user.email, otpCode: emailOtp }),
      sendSmsOtp({ toPhone: verification.user.phone, toEmail: verification.user.email, otpCode: smsOtp })
    ]);

    await prisma.$transaction([
      prisma.authVerification.update({
        where: { id: verification.id },
        data: {
          emailOtpEnc: encryptOtp(emailOtp),
          smsOtpEnc: encryptOtp(smsOtp)
        }
      }),
      prisma.securityEvent.create({
        data: {
          userId: verification.userId,
          type: 'OTP_RESEND',
          ipAddress: verification.ipAddress,
          metadata: { emailResult, smsResult }
        }
      })
    ]);

    return Response.json(
      {
        resent: true,
        devEmailOtp: process.env.NODE_ENV === 'production' ? undefined : emailOtp,
        devSmsOtp: process.env.NODE_ENV === 'production' ? undefined : smsOtp
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Failed to resend OTP.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
