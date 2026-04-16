import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { matchesOtp } from '@/lib/security/verification';
import { generateSessionToken } from '@/lib/security/device';

const schema = z.object({
  identifier: z.string().min(3),
  otp: z.string().length(6),
  type: z.enum(['email', 'phone'])
});

export async function POST(request) {
  try {
    const data = schema.parse(await request.json());
    const identifier = data.identifier.trim();

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        identifier,
        type: data.type,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return Response.json({ error: 'OTP not found or expired. Please request a new code.' }, { status: 400 });
    }

    const otpOk = matchesOtp(data.otp, otpRecord.otpEnc);
    if (!otpOk) {
      return Response.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where:
        data.type === 'email'
          ? { email: identifier.toLowerCase() }
          : { phone: identifier }
    });

    if (!user) {
      return Response.json({ error: 'User not found for OTP identifier.' }, { status: 404 });
    }

    await prisma.otpCode.delete({ where: { id: otpRecord.id } });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data:
        data.type === 'email'
          ? { isEmailVerified: true }
          : { isPhoneVerified: true }
    });

    const isFullyVerified = Boolean(updatedUser.isEmailVerified && updatedUser.isPhoneVerified);

    let token = null;
    if (isFullyVerified) {
      token = generateSessionToken();
      await prisma.session.create({
        data: {
          token,
          userId: updatedUser.id,
          isVerified: true,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
    }

    return Response.json(
      {
        success: true,
        message: 'OTP verified successfully.',
        isFullyVerified,
        token,
        refreshToken: null,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone
        }
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Verification failed.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
