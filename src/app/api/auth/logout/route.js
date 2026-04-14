import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';

export async function POST(request) {
  try {
    const auth = await requireSession(request, undefined, { requireVerified: false });
    if (!auth.ok) {
      return auth.response;
    }

    await prisma.session.update({
      where: { id: auth.session.id },
      data: { revokedAt: new Date() }
    });

    await prisma.securityEvent.create({
      data: {
        userId: auth.session.userId,
        type: 'LOGOUT',
        metadata: {
          sessionId: auth.session.id
        }
      }
    });

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: 'Unable to logout.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
