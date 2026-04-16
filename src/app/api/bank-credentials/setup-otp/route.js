import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { generateOtpCode } from '@/lib/security/verification';
import { storeBankSetupOtps } from '@/lib/security/bankSetupOtpStore';
import { sendVerificationEmail } from '@/lib/services/emailService';
import { sendVerificationSMS } from '@/lib/services/smsService';

const schema = z.object({
  userId: z.string().min(1)
});

export async function POST(request) {
  try {
    const data = schema.parse(await request.json());

    const auth = await requireSession(request, data.userId);
    if (!auth.ok) {
      return auth.response;
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        bankOnboardingCompleted: true
      }
    });

    if (!user) {
      return Response.json({ error: 'User not found.' }, { status: 404 });
    }

    if (!user.email || !user.phone) {
      return Response.json(
        { error: 'Email and phone are required to complete bank account setup.' },
        { status: 400 }
      );
    }

    if (user.bankOnboardingCompleted) {
      return Response.json(
        { error: 'Bank account setup is already completed for this user.' },
        { status: 409 }
      );
    }

    const emailOtp = generateOtpCode();
    const smsOtp = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await storeBankSetupOtps({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      emailOtpEnc: emailOtp,
      smsOtpEnc: smsOtp,
      expiresAt
    });

    const [emailResult, smsResult] = await Promise.all([
      sendVerificationEmail(user.email, emailOtp, user.name),
      sendVerificationSMS(user.phone, smsOtp)
    ]);

    if (!emailResult?.success) {
      throw new Error(emailResult?.error || 'Failed to send bank setup email OTP.');
    }

    if (!smsResult?.success) {
      throw new Error(smsResult?.error || 'Failed to send bank setup SMS OTP.');
    }

    return Response.json(
      {
        success: true,
        expiresAt,
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
      { error: 'Failed to send bank setup OTP.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
