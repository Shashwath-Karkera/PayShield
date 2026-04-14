export function collectDeviceFingerprint() {
  if (typeof window === 'undefined') {
    return {
      deviceDna: 'server-unknown-device',
      browserSignature: 'server-runtime',
      screenResolution: '0x0'
    };
  }

  const ua = navigator.userAgent || '';
  const lang = navigator.language || 'en';
  const platform = navigator.platform || 'unknown';
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const resolution = `${window.screen.width}x${window.screen.height}`;
  const hardware = navigator.hardwareConcurrency || 0;
  const memory = navigator.deviceMemory || 0;

  const signature = [ua, lang, platform, tz, resolution, hardware, memory].join('|');
  const base = btoa(unescape(encodeURIComponent(signature))).replace(/=/g, '');

  return {
    deviceDna: base.slice(0, 48),
    browserSignature: `${platform} | ${ua.slice(0, 80)}`,
    screenResolution: resolution
  };
}

export async function getOrCreateDeviceKeyPair() {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('Web Crypto API is not available in this browser.');
  }

  const existingPrivateJwk = localStorage.getItem('ps_device_private_jwk');
  const existingPublicJwk = localStorage.getItem('ps_device_public_jwk');

  if (existingPrivateJwk && existingPublicJwk) {
    const privateKey = await window.crypto.subtle.importKey(
      'jwk',
      JSON.parse(existingPrivateJwk),
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256'
      },
      false,
      ['sign']
    );

    const publicPem = await exportJwkToPem(JSON.parse(existingPublicJwk));
    return { privateKey, publicPem };
  }

  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['sign', 'verify']
  );

  const privateJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
  const publicJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);

  localStorage.setItem('ps_device_private_jwk', JSON.stringify(privateJwk));
  localStorage.setItem('ps_device_public_jwk', JSON.stringify(publicJwk));

  const publicPem = await exportJwkToPem(publicJwk);

  return { privateKey: keyPair.privateKey, publicPem };
}

async function exportJwkToPem(jwk) {
  const publicKey = await window.crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    true,
    ['verify']
  );

  const spki = await window.crypto.subtle.exportKey('spki', publicKey);
  const bytes = new Uint8Array(spki);
  const b64 = btoa(String.fromCharCode(...bytes));
  const lines = b64.match(/.{1,64}/g) || [];

  return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
}

export async function signChallenge(privateKey, challenge) {
  const payload = new TextEncoder().encode(challenge);
  const signature = await window.crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, payload);
  const bytes = new Uint8Array(signature);
  return btoa(String.fromCharCode(...bytes));
}

export function getClientNetworkInfo() {
  return {
    locationCountry: 'IN',
    locationCity: 'Bengaluru',
    ipAddress: '127.0.0.1'
  };
}
