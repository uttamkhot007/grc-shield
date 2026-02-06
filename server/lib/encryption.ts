import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const masterKey = process.env.CREDENTIAL_ENCRYPTION_KEY || process.env.SESSION_SECRET;
  if (!masterKey) {
    throw new Error('CREDENTIAL_ENCRYPTION_KEY or SESSION_SECRET must be set for credential encryption');
  }
  return crypto.scryptSync(masterKey, 'grc-shield-vault', 32);
}

export function encryptCredential(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptCredential(encryptedData: string): string {
  const key = getEncryptionKey();
  const parts = encryptedData.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function generateEncryptionKeyId(): string {
  return `key_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

export function maskCredential(value: string): string {
  if (value.length <= 8) {
    return '********';
  }
  return value.substring(0, 4) + '****' + value.substring(value.length - 4);
}
