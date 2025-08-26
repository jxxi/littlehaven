'use client';

import { useCallback, useEffect, useState } from 'react';

import { clientLogger } from '@/libs/ClientLogger';
import {
  decryptMessage,
  type EncryptionKey,
  encryptMessage,
  exportKeyToBytes,
  generateChannelKey,
  importKeyFromBytes,
  isKeyInGracePeriod,
  shouldRotateKey,
} from '@/utils/encryption';
import { getSocket } from '@/utils/socket';

// Key storage via API with Redis
export function useEncryption(channelId?: string) {
  const [channelKey, setChannelKey] = useState<EncryptionKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsRotation, setNeedsRotation] = useState(false);

  const socket = getSocket();

  // Load key from API
  const loadChannelKey = useCallback(async (targetChannelId: string) => {
    try {
      const response = await fetch(
        `/api/encryption?channelId=${targetChannelId}`,
      );

      if (response.status === 404) {
        // No key exists yet - this is normal for new channels
        clientLogger.info(
          'No encryption key found for channel:',
          targetChannelId,
        );
        return null;
      }

      if (response.ok) {
        const { keyData } = await response.json();
        const key = await importKeyFromBytes(
          new Uint8Array(keyData.keyBytes).buffer,
          keyData.keyId,
          256,
          keyData.createdAt ? new Date(keyData.createdAt) : undefined,
          keyData.expiresAt ? new Date(keyData.expiresAt) : undefined,
        );
        setChannelKey(key);

        // Check if key needs rotation
        if (shouldRotateKey(key)) {
          setNeedsRotation(true);
        }

        return key;
      }

      // Handle other error statuses
      clientLogger.error(
        'Failed to load channel key:',
        response.status,
        response.statusText,
      );
      return null;
    } catch (err) {
      clientLogger.error('Error loading channel key:', err);
      return null;
    }
  }, []); // No dependencies needed since it's a pure function

  // Generate and store new key
  const generateNewKey = useCallback(async (targetChannelId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const newKey = await generateChannelKey();
      const keyBytes = await exportKeyToBytes(newKey);

      // Store key via API
      const keyData = {
        keyBytes: Array.from(new Uint8Array(keyBytes)),
        keyId: newKey.id,
        keyLength: newKey.keyLength,
        createdAt: newKey.createdAt.toISOString(),
        expiresAt: newKey.expiresAt?.toISOString(),
      };

      const response = await fetch('/api/encryption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: targetChannelId, keyData }),
      });

      if (!response.ok) {
        throw new Error('Failed to store encryption key');
      }

      setChannelKey(newKey);
      setNeedsRotation(false);
      return newKey;
    } catch (err) {
      setError('Failed to generate encryption key');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies needed since it's a pure function

  // Encrypt message with rotation check
  const encrypt = useCallback(
    async (
      content: string,
    ): Promise<{
      encryptedContent: string;
      keyId: string;
      iv: string;
    } | null> => {
      if (!channelKey) {
        throw new Error('No encryption key available');
      }

      // Check if key needs rotation
      if (shouldRotateKey(channelKey)) {
        setNeedsRotation(true);
        throw new Error('Key has expired and needs rotation');
      }

      // Check if key is in grace period
      if (isKeyInGracePeriod(channelKey)) {
        clientLogger.warn('Using key in grace period - consider rotating soon');
      }

      try {
        return await encryptMessage(content, channelKey);
      } catch (err) {
        setError('Failed to encrypt message');
        throw err;
      }
    },
    [channelKey],
  );

  // Decrypt message
  const decrypt = useCallback(
    async (encryptedContent: string, iv: string): Promise<string | null> => {
      if (!channelKey) {
        throw new Error('No encryption key available');
      }

      try {
        return await decryptMessage(encryptedContent, channelKey, iv);
      } catch (err) {
        setError('Failed to decrypt message');
        throw err;
      }
    },
    [channelKey],
  );

  // Share key with other users (for E2EE)
  const shareKey = useCallback(async (): Promise<{
    keyBytes: number[];
    keyId: string;
    keyLength: number;
    createdAt: string;
    expiresAt: string;
  } | null> => {
    if (!channelKey) {
      throw new Error('No encryption key available');
    }

    try {
      const keyBytes = await exportKeyToBytes(channelKey);
      return {
        keyBytes: Array.from(new Uint8Array(keyBytes)),
        keyId: channelKey.id,
        keyLength: channelKey.keyLength,
        createdAt: channelKey.createdAt.toISOString(),
        expiresAt: channelKey.expiresAt?.toISOString() || '',
      };
    } catch (err) {
      setError('Failed to export key');
      throw err;
    }
  }, [channelKey]);

  // Rotate key automatically
  const rotateKey = useCallback(
    async (targetChannelId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Notify other users that key rotation is starting
        socket.emit('keyRotationStarted', {
          channelId: targetChannelId,
          userId: 'current-user', // You'll need to pass actual userId
        });

        // Generate new key
        const newKey = await generateNewKey(targetChannelId);

        // Share new key with other users
        const keyData = await shareKey();
        if (keyData) {
          socket.emit('shareEncryptionKey', {
            channelId: targetChannelId,
            userId: 'current-user', // You'll need to pass actual userId
            keyData,
          });
        }

        // Notify completion
        socket.emit('keyRotationCompleted', {
          channelId: targetChannelId,
          userId: 'current-user', // You'll need to pass actual userId
          newKeyId: newKey.id,
          messagesReEncrypted: 0, // You can track this if needed
        });

        clientLogger.info('Key rotated successfully:', newKey.id);

        return newKey;
      } catch (err) {
        setError('Failed to rotate key');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [generateNewKey, shareKey, socket],
  );

  // Initialize encryption for channel
  const initializeEncryption = useCallback(
    async (targetChannelId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to load existing key first
        let key = await loadChannelKey(targetChannelId);

        if (!key) {
          // No key exists yet - generate a new one
          clientLogger.info(
            'No existing key found, generating new key for channel:',
            targetChannelId,
          );
          key = await generateNewKey(targetChannelId);
        } else if (shouldRotateKey(key)) {
          // Auto-rotate if key is expired
          clientLogger.info('Auto-rotating expired key');
          key = await rotateKey(targetChannelId);
        }

        setChannelKey(key);
        return key;
      } catch (err) {
        clientLogger.error('Failed to initialize encryption:', err);
        setError('Failed to initialize encryption');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loadChannelKey, generateNewKey, rotateKey],
  );

  // Listen for key sharing events
  useEffect(() => {
    if (!channelId) return;

    const handleKeyShared = async (data: any) => {
      if (data.channelId === channelId) {
        clientLogger.info('Received shared encryption key');

        try {
          // Import the shared key
          const sharedKey = await importKeyFromBytes(
            new Uint8Array(data.keyData.keyBytes).buffer,
            data.keyData.keyId,
            data.keyData.keyLength || 256,
            data.keyData.createdAt
              ? new Date(data.keyData.createdAt)
              : undefined,
            data.keyData.expiresAt
              ? new Date(data.keyData.expiresAt)
              : undefined,
          );

          // Update local key if it's newer
          if (!channelKey || sharedKey.createdAt > channelKey.createdAt) {
            setChannelKey(sharedKey);
            setNeedsRotation(false);
            clientLogger.info(
              'Updated to shared encryption key:',
              sharedKey.id,
            );
          }
        } catch (err) {
          clientLogger.error('Failed to import shared key:', err);
        }
      }
    };

    const handleKeyRotation = (data: any) => {
      if (data.channelId === channelId) {
        clientLogger.info('Key rotation notification:', data.message);
        // Show notification to user
        setNeedsRotation(true);
      }
    };

    const handleRotationComplete = async (data: any) => {
      if (data.channelId === channelId) {
        clientLogger.info('Key rotation completed by:', data.completedBy);

        // Refresh the key from server
        try {
          await loadChannelKey(channelId);
        } catch (err) {
          clientLogger.error('Failed to refresh key after rotation:', err);
        }
      }
    };

    socket.on('encryptionKeyShared', handleKeyShared);
    socket.on('keyRotationNotification', handleKeyRotation);
    socket.on('keyRotationComplete', handleRotationComplete);

    // eslint-disable-next-line
    return () => {
      socket.off('encryptionKeyShared', handleKeyShared);
      socket.off('keyRotationNotification', handleKeyRotation);
      socket.off('keyRotationComplete', handleRotationComplete);
    };
  }, [channelId, socket, channelKey, loadChannelKey]);

  // Load key when channelId changes
  useEffect(() => {
    if (channelId) {
      initializeEncryption(channelId);
    }
  }, [channelId, initializeEncryption]);

  return {
    channelKey,
    isLoading,
    error,
    needsRotation,
    encrypt,
    decrypt,
    shareKey,
    generateNewKey,
    rotateKey,
    initializeEncryption,
  };
}
