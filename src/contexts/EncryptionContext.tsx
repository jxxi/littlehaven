'use client';

import { createContext, type ReactNode, useContext } from 'react';

import { useEncryption } from '@/hooks/useEncryption';

type EncryptionContextType = ReturnType<typeof useEncryption>;

const EncryptionContext = createContext<EncryptionContextType | null>(null);

interface EncryptionProviderProps {
  children: ReactNode;
  channelId?: string;
}

export function EncryptionProvider({
  children,
  channelId,
}: EncryptionProviderProps) {
  const encryption = useEncryption(channelId);

  return (
    <EncryptionContext.Provider value={encryption}>
      {children}
    </EncryptionContext.Provider>
  );
}

export function useEncryptionContext() {
  const context = useContext(EncryptionContext);
  if (!context) {
    throw new Error(
      'useEncryptionContext must be used within an EncryptionProvider',
    );
  }
  return context;
}
