import crypto from 'crypto';
import bcrypt from 'bcryptjs';

function getPepper() {
  const pepper = process.env.SPICE_PEPPER_KEY;
  if (!pepper) {
    throw new Error('SPICE_PEPPER_KEY is required for password operations.');
  }

  return pepper;
}

export function generateSpiceSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function buildSpicedInput(password, spiceSalt) {
  const pepper = getPepper();
  return `${password}:${spiceSalt}:${pepper}`;
}

export async function createSpicePasswordHash(password) {
  const spiceSalt = generateSpiceSalt();
  const spicedInput = buildSpicedInput(password, spiceSalt);
  const passwordHash = await bcrypt.hash(spicedInput, 12);

  return { passwordHash, spiceSalt };
}

export async function verifySpicePassword(password, spiceSalt, storedHash) {
  const spicedInput = buildSpicedInput(password, spiceSalt);
  return bcrypt.compare(spicedInput, storedHash);
}
