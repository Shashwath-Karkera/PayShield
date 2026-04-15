function checkCryptoSupport() {
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    throw new Error("Browser not supported. Please use Chrome, Firefox, Safari, or Edge.");
  }
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function generateDeviceKeyPair() {
  checkCryptoSupport();
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // extractable
    ["sign", "verify"]
  );

  const exportedPublicKey = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );
  
  const exportedPrivateKey = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );

  const b64PublicKey = arrayBufferToBase64(exportedPublicKey);
  const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${b64PublicKey.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;

  return { publicKeyPem, privateKey: exportedPrivateKey };
}

// Test Sign Flow:
// const sig = await signChallenge("test_challenge", privateKeyBuffer); // Should execute < 50ms
export async function signChallenge(challengeBase64, privateKeyBuffer) {
  checkCryptoSupport();
  
  const privateKey = await window.crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    { name: "RSA-PSS", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const challengeBuffer = base64ToArrayBuffer(challengeBase64);
  
  const signature = await window.crypto.subtle.sign(
    { name: "RSA-PSS", saltLength: 32 },
    privateKey,
    challengeBuffer
  );

  return arrayBufferToBase64(signature);
}

export async function encryptPrivateKey(privateKeyBuffer, password) {
  checkCryptoSupport();
  const enc = new TextEncoder();
  
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    privateKeyBuffer
  );

  return {
    encryptedPrivateKey: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt)
  };
}

export async function decryptPrivateKey(encryptedBase64, password, ivBase64, saltBase64) {
  checkCryptoSupport();
  const enc = new TextEncoder();
  
  const encrypted = base64ToArrayBuffer(encryptedBase64);
  const iv = base64ToArrayBuffer(ivBase64);
  const salt = base64ToArrayBuffer(saltBase64);

  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  const key = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encrypted
  );

  return decrypted;
}