import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateOtpCode } from '@/lib/security/verification';
import { sendVerificationEmail } from '@/lib/services/emailService';
import { sendVerificationSMS } from '@/lib/services/smsService';

const schema = z.object({
  identifier: z.string().min(3),
  type: z.enum(['email', 'phone'])
});

export async function POST(request) {
  try {
    const data = schema.parse(await request.json());
    const identifier = data.identifier.trim();

    const user = await prisma.user.findFirst({
      where:
        data.type === 'email'
          ? { email: identifier.toLowerCase() }
          : { phone: identifier }
    });

    if (!user) {
      return Response.json({ error: 'User not found for the given identifier.' }, { status: 404 });
    }

    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.$transaction([
      prisma.otpCode.deleteMany({
        where: {
          identifier,
          type: data.type
        }
      }),
      prisma.otpCode.create({
        data: {
          userId: user.id,
          identifier,
          type: data.type,
          otpEnc: otpCode,
          expiresAt
        }
      })
    ]);

    if (data.type === 'email') {
      const emailResult = await sendVerificationEmail(user.email, otpCode, user.name);
      if (!emailResult?.success) {
        throw new Error(emailResult?.error || 'Failed to send verification email.');
      }
    } else {
      await sendVerificationSMS(user.phone || identifier, otpCode);
    }

    return Response.json(
      {
        success: true,
        message: data.type === 'email' ? 'Verification code sent to email.' : 'Verification code sent to phone.',
        testOtp: process.env.NODE_ENV === 'production' ? undefined : otpCode
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Failed to send OTP.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
