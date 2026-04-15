import crypto from 'crypto';
import argon2 from 'argon2';

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
  const passwordHash = await argon2.hash(spicedInput, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1
  });

  return { passwordHash, spiceSalt };
}

export async function verifySpicePassword(password, spiceSalt, storedHash) {
  const spicedInput = buildSpicedInput(password, spiceSalt);
  try {
    return await argon2.verify(storedHash, spicedInput);
  } catch {
    return false;
  }
}
