import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { comparePassword, generateToken, generateRefreshToken } from '@/lib/auth/utils';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const payload = await request.json();
    const { email, password, deviceDna, ipAddress, locationCountry, locationCity, browserSignature, screenResolution } = payload;
    
    // Find user
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    
    const user = users[0];
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }
    
    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }
    
    // Generate tokens
    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);
    
    // Update last login
    await sql`
      UPDATE users 
      SET last_login = NOW(), 
          device_id = ${deviceDna || user.device_id},
          location = ${locationCountry || user.location}
      WHERE id = ${user.id}
    `;
    
    return NextResponse.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        phone: user.phone,
        balance: user.balance
      },
      requiresAdditionalVerification: false,
      risk: { score: 0, reasons: [] },
      knownDevice: true,
      hasDeviceKey: false
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed.', detail: error.message }, { status: 500 });
  }
}
