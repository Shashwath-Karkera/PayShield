import crypto from 'crypto';

export function verifyChallengeSignature({ challenge, signatureBase64, publicKeyPem }) {
  try {
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(challenge);
    verifier.end();

    return verifier.verify(publicKeyPem, Buffer.from(signatureBase64, 'base64'));
  } catch {
    return false;
  }
}

export function generateChallengeToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export function generateSessionToken() {
  return crypto.randomBytes(48).toString('base64url');
}
