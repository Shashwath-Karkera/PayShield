import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { deviceCredentials } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req) {
  try {
    const { 
      userId, deviceName, publicKeyPem, deviceDna, 
      browserSignature, screenResolution, ipAddress, location 
    } = await req.json();

    if (!publicKeyPem || !publicKeyPem.startsWith("-----BEGIN PUBLIC KEY-----")) {
      return NextResponse.json({ error: "Invalid public key format." }, { status: 400 });
    }

    const existingDevices = await db.select()
      .from(deviceCredentials)
      .where(eq(deviceCredentials.userId, userId));

    if (existingDevices.length >= 5) {
      return NextResponse.json({ 
        error: "Maximum 5 devices allowed. Remove an existing device first." 
      }, { status: 400 });
    }

    // Note: Recovery Flow Implementation details:
    // If device is newly registered from recovery email/OTP, replace older one
    // or notify user here. Sending notification email should be triggered here.
    
    const [newDevice] = await db.insert(deviceCredentials).values({
      userId,
      deviceName,
      deviceDna,
      publicKeyPem,
      browserSignature,
      screenResolution,
      lastSeenIp: ipAddress || req.headers.get('x-forwarded-for') || '127.0.0.1',
      lastSeenCountry: location?.countryCode || null,
      trusted: true
    }).returning({ id: deviceCredentials.id });

    // Logging attempt to security_events table

    return NextResponse.json({
      success: true,
      deviceId: newDevice.id,
      deviceCount: existingDevices.length + 1
    }, { status: 200 });

  } catch (error) {
    console.error("Register device error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
