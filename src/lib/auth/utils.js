import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET =
  process.env.PAYSHIELD_JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  '';
const JWT_REFRESH_SECRET =
  process.env.PAYSHIELD_JWT_REFRESH_SECRET ||
  process.env.JWT_REFRESH_SECRET ||
  '';

function assertJwtSecrets() {
  if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error(
      'PAYSHIELD_JWT_ACCESS_SECRET and PAYSHIELD_JWT_REFRESH_SECRET (or legacy JWT_SECRET/JWT_REFRESH_SECRET) are required.'
    );
  }
}

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId, email) => {
  assertJwtSecrets();
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '1h' });
};

export const generateRefreshToken = (userId) => {
  assertJwtSecrets();
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  try {
    assertJwtSecrets();
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const generateDeviceId = () => {
  return crypto.randomBytes(32).toString('hex');
};