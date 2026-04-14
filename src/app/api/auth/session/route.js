import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return Response.json({ error: 'token is required.' }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            balance: true,
            isFrozen: true,
            frozenReason: true
          }
        },
        deviceCredential: {
          select: {
            id: true,
            deviceDna: true,
            trusted: true
          }
        }
      }
    });

    if (!session || session.revokedAt || new Date(session.expiresAt).getTime() < Date.now()) {
      return Response.json({ error: 'Session is invalid or expired.' }, { status: 401 });
    }

    return Response.json(
      {
        session: {
          id: session.id,
          isVerified: session.isVerified,
          expiresAt: session.expiresAt,
          user: session.user,
          device: session.deviceCredential
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch session.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
