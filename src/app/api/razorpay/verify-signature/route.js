import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';

const schema = z.object({
  userId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(10)
});

function getSecret() {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error('RAZORPAY_KEY_SECRET is required.');
  }

  return secret;
}

export async function POST(request) {
  try {
    const data = schema.parse(await request.json());

    const auth = await requireSession(request, data.userId);
    if (!auth.ok) {
      return auth.response;
    }

    const generated = crypto
      .createHmac('sha256', getSecret())
      .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
      .digest('hex');

    const verified = generated === data.razorpaySignature;

    await prisma.securityEvent.create({
      data: {
        userId: data.userId,
        type: verified ? 'RAZORPAY_SIGNATURE_VERIFIED' : 'RAZORPAY_SIGNATURE_FAILED',
        metadata: {
          razorpayOrderId: data.razorpayOrderId,
          razorpayPaymentId: data.razorpayPaymentId
        }
      }
    });

    if (!verified) {
      return Response.json({ verified: false, error: 'Invalid Razorpay signature.' }, { status: 400 });
    }

    return Response.json({ verified: true }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Unable to verify Razorpay signature.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
