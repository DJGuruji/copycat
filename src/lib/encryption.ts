import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-fallback-32-char-secret-key-!!'; // Should be 32 characters
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text: string): string {
  if (!text) return text;
  
  // Ensure we have a 32-byte key
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

const VALUE_TYPES = ['text', 'password', 'number', 'link'] as const;
export type ValueType = (typeof VALUE_TYPES)[number];

export function isValueType(value: unknown): value is ValueType {
  return typeof value === 'string' && (VALUE_TYPES as readonly string[]).includes(value);
}

/** Encrypt unless the caller explicitly opted out. Missing flag keeps legacy values encrypted. */
export function storeItemValue(value: string | undefined, encrypted: boolean | undefined): string {
  const text = value ?? '';
  if (encrypted === false) return text;
  return encrypt(text);
}

/** Decrypt unless the value was stored in plaintext. */
export function readItemValue(value: string | undefined, encrypted: boolean | undefined): string {
  const text = value ?? '';
  if (encrypted === false) return text;
  return decrypt(text);
}

export function decrypt(text: string): string {
  if (!text || !text.includes(':')) return text;
  
  try {
    const textParts = text.split(':');
    if (textParts.length < 2) return text;

    const ivHex = textParts.shift()!;
    const iv = Buffer.from(ivHex, 'hex');
    
    // AES IV must be 16 bytes. If it's not, this isn't our encrypted format.
    if (iv.length !== IV_LENGTH) {
      return text;
    }

    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    // If decryption fails for any reason (wrong key, bad data), 
    // we log it and return the original text to prevent app crashes.
    console.error('Decryption failed for value:', text.substring(0, 20) + '...', error);
    return text;
  }
}
