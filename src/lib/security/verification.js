import argon2 from 'argon2';
import { encryptValue, decryptValue } from '@/lib/security/crypto';

export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function encryptOtp(otp) {
  return encryptValue(String(otp));
}

export function matchesOtp(rawOtp, encryptedOtp) {
  try {
    const resolved = decryptValue(encryptedOtp);
    return String(rawOtp).trim() === String(resolved).trim();
  } catch {
    return false;
  }
}

export async function hashPayShieldPin(pin) {
  return argon2.hash(String(pin), {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  });
}

export async function verifyPayShieldPin(pin, hash) {
  if (!hash) {
    return false;
  }

  try {
    return await argon2.verify(hash, String(pin));
  } catch {
    return false;
  }
}
