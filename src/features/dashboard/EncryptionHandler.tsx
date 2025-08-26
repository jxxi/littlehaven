'use client';

import { useEncryptionContext } from '@/contexts/EncryptionContext';

interface EncryptionHandlerProps {
  children: (
    encryption: ReturnType<typeof useEncryptionContext>,
  ) => React.ReactNode;
}

export function EncryptionHandler({ children }: EncryptionHandlerProps) {
  const encryption = useEncryptionContext();
  return <>{children(encryption)}</>;
}
