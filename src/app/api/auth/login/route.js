import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { comparePassword, generateToken, generateRefreshToken } from '@/lib/auth/utils';
import { calculateRisk } from '@/lib/behavior/riskCalculator';
import { db } from '@/lib/db';
import { behavioralEvents } from '@/lib/db/schema';

const sql = neon(process.env.DATABASE_URL);

export async function POST(request) {
  try {
    const payload = await request.json();
    const { email, password, deviceDna, ipAddress, locationCountry, locationCity, browserSignature, screenResolution, behaviorData } = payload;
    
    // Find user first so we can tie the threat log to their ID if it exists
    const users = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    const user = users[0];

    // Evaluate behavioral risk if metric exists
    let riskAnalysis = { score: 0, riskLevel: 'LOW', action: 'allow', triggeredRules: [], messages: [] };
    if (behaviorData) {
      riskAnalysis = calculateRisk(behaviorData);
      
      // Log to Threat Admin Database NOW (before any 403 blocks or 401 kicks)
      try {
           await db.insert(behavioralEvents).values({
               userId: user ? user.id : null, // Null if bot guessed random fake email
               eventType: 'login',
               riskScore: riskAnalysis.score,
               triggeredRules: riskAnalysis.triggeredRules,
               actionTaken: riskAnalysis.action,
               metrics: behaviorData
           });
       } catch (e) {
           console.error('Failed logging behavior event', e);
       }

      if (riskAnalysis.action === 'block') {
         return NextResponse.json({ error: 'Security systems triggered. Access denied.', messages: riskAnalysis.messages, _debug_blocked_reason: 'CRITICAL_RISK' }, { status: 403 });
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }
    
    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    if (riskAnalysis.action === 'require_otp') {
        // Enforce OTP challenge flow directly by telling UI 
        return NextResponse.json({ 
             success: true,
             requiresAdditionalVerification: true,
             verificationMethod: 'OTP',
             risk: { score: riskAnalysis.score, reasons: riskAnalysis.messages }
        });
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
      risk: { score: riskAnalysis.score, reasons: riskAnalysis.messages },
      knownDevice: true,
      hasDeviceKey: false
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed.', detail: error.message }, { status: 500 });
  }
}
