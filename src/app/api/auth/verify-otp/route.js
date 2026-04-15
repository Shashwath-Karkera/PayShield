import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateToken, generateRefreshToken } from '@/lib/auth/utils';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const { identifier, otp, type } = await request.json();
    
    console.log('Verify OTP request:', { identifier, otp, type });
    
    if (!identifier || !otp || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Find the OTP in database
    const result = await sql`
      SELECT * FROM otp_codes 
      WHERE identifier = ${identifier} 
        AND type = ${type}
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'OTP not found or expired. Please request a new code.' }, { status: 400 });
    }
    
    const otpRecord = result[0];
    
    if (otpRecord.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP. Please try again.' }, { status: 400 });
    }
    
    // Delete used OTP
    await sql`
      DELETE FROM otp_codes WHERE id = ${otpRecord.id}
    `;
    
    // Update user verification status
    if (type === 'email') {
      await sql`
        UPDATE users SET is_email_verified = true WHERE email = ${identifier}
      `;
    } else if (type === 'phone') {
      await sql`
        UPDATE users SET is_phone_verified = true WHERE phone = ${identifier}
      `;
    }
    
    // Check if both are verified
    const userResult = await sql`
      SELECT id, email, phone, full_name, is_email_verified, is_phone_verified FROM users 
      WHERE ${type === 'email' ? 'email' : 'phone'} = ${identifier}
    `;
    
    const user = userResult[0];
    const isFullyVerified = user?.is_email_verified && user?.is_phone_verified;
    
    console.log(`✅ OTP verified for ${identifier}`);
    console.log(`isFullyVerified: ${isFullyVerified}`);
    
    // If both are verified, generate tokens
    let token = null;
    let refreshToken = null;
    
    if (isFullyVerified && user) {
      token = generateToken(user.id, user.email);
      refreshToken = generateRefreshToken(user.id);
      
      // Create session
      await sql`
        INSERT INTO user_sessions (user_id, session_token, is_active, expires_at, created_at)
        VALUES (${user.id}, ${refreshToken}, true, NOW() + INTERVAL '7 days', NOW())
      `;
      
      console.log(`Tokens generated for user: ${user.email}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully',
      isFullyVerified: isFullyVerified || false,
      token: token || null,
      refreshToken: refreshToken || null,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.full_name,
        phone: user.phone
      } : null
    });
    
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json({ error: 'Verification failed: ' + error.message }, { status: 500 });
  }
}