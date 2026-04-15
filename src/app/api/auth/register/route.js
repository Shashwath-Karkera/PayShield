import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { hashPassword } from '@/lib/auth/utils';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      email, 
      name, 
      phone, 
      password, 
      motherNickname, 
      firstPetName,
      deviceDna,
      ipAddress,
      locationCountry,
      locationCity,
      browserSignature,
      screenResolution,
      openingBalance 
    } = body;
    
    console.log('Registration request:', { email, name, phone });
    
    // Check if user exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email} OR phone = ${phone}
    `;
    
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Hash security answers
    const hashedMotherNickname = motherNickname ? await hashPassword(motherNickname.toLowerCase()) : '';
    const hashedFirstPetName = firstPetName ? await hashPassword(firstPetName.toLowerCase()) : '';
    
    // Create user
    const result = await sql`
      INSERT INTO users (
        full_name, email, phone, password, mother_nickname, first_pet_name,
        device_id, location, system_info, gsm_info, 
        is_email_verified, is_phone_verified, balance, created_at
      ) VALUES (
        ${name || ''}, ${email}, ${phone}, ${hashedPassword}, 
        ${hashedMotherNickname}, ${hashedFirstPetName}, 
        ${deviceDna || ''}, ${locationCountry || ''}, 
        ${JSON.stringify({ browserSignature, screenResolution, ipAddress, locationCity })} || '{}',
        '{}'::jsonb,
        false, false, ${openingBalance || 0}, NOW()
      ) RETURNING id, email, phone, full_name, balance, created_at
    `;
    
    const user = result[0];
    
    // Generate OTPs
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const smsOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`Generated OTPs - Email: ${emailOtp}, SMS: ${smsOtp}`);
    
    // Store OTPs
    await sql`
      INSERT INTO otp_codes (identifier, otp, type, expires_at, created_at)
      VALUES 
        (${email}, ${emailOtp}, 'email', NOW() + INTERVAL '10 minutes', NOW()),
        (${phone}, ${smsOtp}, 'phone', NOW() + INTERVAL '10 minutes', NOW())
    `;
    
    // Send OTPs
    try {
      const { sendVerificationEmail } = await import('@/lib/services/emailService');
      const { sendVerificationSMS } = await import('@/lib/services/smsService');
      
      await sendVerificationEmail(email, emailOtp, name);
      await sendVerificationSMS(phone, smsOtp);
      console.log('OTPs sent successfully');
    } catch (err) {
      console.log('OTP sending note:', err.message);
    }
    
    // Return response with verification required
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        phone: user.phone,
        balance: user.balance || 0,
        createdAt: user.created_at
      },
      verificationRequired: true,
      verificationId: Date.now(),
      verification: {
        id: Date.now(),
        riskScore: 0,
        riskReasons: ['New registration verification'],
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        devEmailOtp: process.env.NODE_ENV === 'production' ? undefined : emailOtp,
        devSmsOtp: process.env.NODE_ENV === 'production' ? undefined : smsOtp
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      error: 'Failed to register user.', 
      detail: error.message 
    }, { status: 500 });
  }
}