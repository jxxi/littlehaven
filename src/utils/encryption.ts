import { logError } from '@/utils/Logger';

// Key management
export interface EncryptionKey {
  id: string;
  key: CryptoKey;
  algorithm: 'AES-GCM';
  keyLength: 256;
  createdAt: Date;
  expiresAt?: Date;
}

// Key rotation settings
export const KEY_ROTATION_CONFIG = {
  MAX_AGE_DAYS: 30, // Rotate keys every 30 days
  GRACE_PERIOD_DAYS: 7, // Keep old keys for 7 days after rotation
  BATCH_SIZE: 100, // Number of messages to re-encrypt per batch
};

// Validate encryption key
export function validateEncryptionKey(key: EncryptionKey): boolean {
  return !!(
    key.key &&
    key.algorithm === 'AES-GCM' &&
    key.keyLength === 256 &&
    key.id &&
    key.createdAt instanceof Date
  );
}

// Generate a new encryption key for a channel
export async function generateChannelKey(): Promise<EncryptionKey> {
  try {
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt'],
    );

    const keyId = crypto.randomUUID();
    const createdAt = new Date();
    const expiresAt = new Date(
      createdAt.getTime() +
        KEY_ROTATION_CONFIG.MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    );

    return {
      id: keyId,
      key,
      algorithm: 'AES-GCM',
      keyLength: 256,
      createdAt,
      expiresAt,
    };
  } catch (error) {
    logError('Error generating channel key', error);
    throw new Error('Failed to generate encryption key');
  }
}

// Check if key needs rotation
export function shouldRotateKey(key: EncryptionKey): boolean {
  if (!key.expiresAt) return false;
  const now = new Date();
  return now >= key.expiresAt;
}

// Check if key is in grace period (can still decrypt but shouldn't encrypt)
export function isKeyInGracePeriod(key: EncryptionKey): boolean {
  if (!key.expiresAt) return false;
  const now = new Date();
  const gracePeriodEnd = new Date(
    key.expiresAt.getTime() +
      KEY_ROTATION_CONFIG.GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000,
  );
  return now >= key.expiresAt && now <= gracePeriodEnd;
}

// Encrypt message content with unique IV
export async function encryptMessage(
  content: string,
  key: EncryptionKey,
): Promise<{ encryptedContent: string; keyId: string; iv: string }> {
  try {
    // Validate key
    if (!validateEncryptionKey(key)) {
      throw new Error('Invalid encryption key');
    }

    // Check if key should be rotated
    if (shouldRotateKey(key)) {
      throw new Error('Key has expired and needs rotation');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(content);

    // Generate unique IV for each message (critical for AES-GCM security)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key.key,
      data,
    );

    // Convert to base64 for storage
    const encryptedContent = btoa(
      String.fromCharCode.apply(
        null,
        Array.from(new Uint8Array(encryptedData)),
      ),
    );

    // Convert IV to base64 for storage
    const ivString = btoa(String.fromCharCode.apply(null, Array.from(iv)));

    return {
      encryptedContent,
      keyId: key.id,
      iv: ivString,
    };
  } catch (error) {
    logError('Error encrypting message', error);
    throw new Error('Failed to encrypt message');
  }
}

// Decrypt message content with IV
export async function decryptMessage(
  encryptedContent: string,
  key: EncryptionKey,
  iv: string,
): Promise<string> {
  try {
    // Validate key
    if (!validateEncryptionKey(key)) {
      throw new Error('Invalid encryption key');
    }

    // Convert from base64
    const encryptedData = Uint8Array.from(atob(encryptedContent), (c) =>
      c.charCodeAt(0),
    );

    // Convert IV from base64
    const messageIv = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: messageIv,
      },
      key.key,
      encryptedData,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    logError('Error decrypting message', error);
    throw new Error('Failed to decrypt message');
  }
}

// Import key from raw bytes (for key sharing)
export async function importKeyFromBytes(
  keyBytes: ArrayBuffer,
  keyId: string,
  keyLength: 256,
  createdAt?: Date,
  expiresAt?: Date,
): Promise<EncryptionKey> {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      'AES-GCM',
      false,
      ['encrypt', 'decrypt'],
    );

    return {
      id: keyId,
      key,
      algorithm: 'AES-GCM',
      keyLength,
      createdAt: createdAt || new Date(),
      expiresAt,
    };
  } catch (error) {
    logError('Error importing key', error);
    throw new Error('Failed to import encryption key');
  }
}

// Export key to raw bytes (for key sharing)
export async function exportKeyToBytes(
  key: EncryptionKey,
): Promise<ArrayBuffer> {
  try {
    if (!validateEncryptionKey(key)) {
      throw new Error('Invalid encryption key');
    }
    return await crypto.subtle.exportKey('raw', key.key);
  } catch (error) {
    logError('Error exporting key', error);
    throw new Error('Failed to export encryption key');
  }
}

// Generate key fingerprint for verification
export async function generateKeyFingerprint(
  key: EncryptionKey,
): Promise<string> {
  try {
    if (!validateEncryptionKey(key)) {
      throw new Error('Invalid encryption key');
    }
    const keyBytes = await exportKeyToBytes(key);
    const hash = await crypto.subtle.digest('SHA-256', keyBytes);
    return btoa(
      String.fromCharCode.apply(null, Array.from(new Uint8Array(hash))),
    ).slice(0, 16);
  } catch (error) {
    logError('Error generating key fingerprint', error);
    throw new Error('Failed to generate key fingerprint');
  }
}

// Batch re-encrypt messages with new key
export async function reEncryptMessages(
  messages: Array<{ encryptedContent: string; keyId: string; iv: string }>,
  oldKey: EncryptionKey,
  newKey: EncryptionKey,
): Promise<Array<{ encryptedContent: string; keyId: string; iv: string }>> {
  try {
    if (!validateEncryptionKey(oldKey) || !validateEncryptionKey(newKey)) {
      throw new Error('Invalid encryption key');
    }

    const reEncryptionPromises = messages.map(async (message) => {
      if (message.keyId === oldKey.id) {
        // Decrypt with old key
        const decryptedContent = await decryptMessage(
          message.encryptedContent,
          oldKey,
          message.iv,
        );
        // Re-encrypt with new key
        const reEncrypted = await encryptMessage(decryptedContent, newKey);
        return reEncrypted;
      }
      // Keep message as is if it uses a different key
      return message;
    });

    return await Promise.all(reEncryptionPromises);
  } catch (error) {
    logError('Error re-encrypting messages', error);
    throw new Error('Failed to re-encrypt messages');
  }
}

// Utility function to convert base64 to base64url (URL-safe)
export function base64ToBase64Url(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Utility function to convert base64url to base64
export function base64UrlToBase64(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return base64;
}
