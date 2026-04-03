import crypto from 'crypto';

const DEFAULT_ALGO = 'aes-256-gcm';

function getEncryptionKey() {
  const secret = process.env.APP_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error('APP_ENCRYPTION_KEY is required for encryption operations.');
  }

  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptValue(plainText) {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(DEFAULT_ALGO, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(String(plainText), 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();
  return `${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

export function decryptValue(payload) {
  const [ivBase64, tagBase64, encryptedBase64] = String(payload).split(':');
  if (!ivBase64 || !tagBase64 || !encryptedBase64) {
    throw new Error('Invalid encrypted payload format.');
  }

  const iv = Buffer.from(ivBase64, 'base64');
  const tag = Buffer.from(tagBase64, 'base64');
  const encrypted = Buffer.from(encryptedBase64, 'base64');
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(DEFAULT_ALGO, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
