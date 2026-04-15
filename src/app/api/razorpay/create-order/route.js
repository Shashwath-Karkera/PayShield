import { z } from 'zod';
import { requireSession } from '@/lib/auth/session';

const schema = z.object({
  userId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3).default('INR'),
  receipt: z.string().min(3).max(40).optional(),
  notes: z.record(z.string(), z.string()).optional()
});

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required.');
  }

  return { keyId, keySecret };
}

export async function POST(request) {
  try {
    const data = schema.parse(await request.json());

    const auth = await requireSession(request, data.userId);
    if (!auth.ok) {
      return auth.response;
    }

    const { keyId, keySecret } = getRazorpayConfig();

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(data.amount * 100),
        currency: data.currency,
        receipt: data.receipt || `ps_${Date.now()}`,
        notes: {
          userId: data.userId,
          ...(data.notes || {})
        }
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: 'Failed to create Razorpay order.', detail: payload },
        { status: response.status }
      );
    }

    return Response.json(
      {
        orderId: payload.id,
        amount: payload.amount,
        currency: payload.currency,
        receipt: payload.receipt,
        razorpayKeyId: keyId,
        status: payload.status
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Validation failed.', issues: error.issues }, { status: 400 });
    }

    return Response.json(
      { error: 'Unable to create Razorpay order.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
