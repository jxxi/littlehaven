import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { useEncryptionContext } from '@/contexts/EncryptionContext';
import { clientLogger } from '@/libs/ClientLogger';

export function SearchSidebar({ members, messages, onMemberClick, onClose }) {
  const [search, setSearch] = useState('');
  const [decryptedMessages, setDecryptedMessages] = useState<
    Record<string, string>
  >({});

  // Get encryption hook for decryption
  const { decrypt } = useEncryptionContext();

  // Decrypt encrypted messages
  const decryptMessage = useCallback(
    async (message) => {
      if (
        !message.isEncrypted ||
        !message.encryptedContent ||
        !message.encryptionIv ||
        !decrypt
      ) {
        return;
      }

      try {
        const decryptedContent = await decrypt(
          message.encryptedContent,
          message.encryptionIv,
        );
        if (decryptedContent) {
          setDecryptedMessages((prev) => ({
            ...prev,
            [message.id]: decryptedContent,
          }));
        }
      } catch (error) {
        clientLogger.error('Failed to decrypt message in search', error);
        setDecryptedMessages((prev) => ({
          ...prev,
          [message.id]: '[Decryption Failed]',
        }));
      }
    },
    [decrypt],
  );

  // Decrypt messages when they're loaded
  useEffect(() => {
    const encryptedMessages = messages.filter(
      (msg) => msg.isEncrypted && msg.encryptedContent && msg.encryptionIv,
    );
    encryptedMessages.forEach(decryptMessage);
  }, [messages, decryptMessage]);

  const filteredMembers = search
    ? members.filter((m) =>
        m.username.toLowerCase().includes(search.toLowerCase()),
      )
    : [];
  const filteredMessages = search
    ? messages.filter((msg) => {
        const contentToSearch =
          msg.isEncrypted && msg.encryptedContent && msg.encryptionIv
            ? decryptedMessages[msg.id] || '[Encrypted]'
            : msg.content;

        return (
          contentToSearch.toLowerCase().includes(search.toLowerCase()) ||
          (msg.user?.username?.toLowerCase().includes(search.toLowerCase()) ??
            false)
        );
      })
    : [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-y-auto p-6 pt-12">
        <input
          type="text"
          placeholder="Search messages or users..."
          className="w-full rounded border px-3 py-2 text-gray-800 caret-transparent focus:outline-none focus:ring"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="mt-4">
          {search && (
            <>
              <div className="mb-2 text-xs font-semibold text-gray-500">
                Members
              </div>
              <ul>
                {filteredMembers.length === 0 && (
                  <li className="text-gray-400">No members found</li>
                )}
                {filteredMembers.map((m) => (
                  <li key={m.userId}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded py-2 hover:bg-gray-100"
                      onClick={() => {
                        onClose();
                        onMemberClick?.(m.userId);
                      }}
                      aria-label={`View member ${m.username}`}
                    >
                      {m.imageUrl ? (
                        <Image
                          src={m.imageUrl}
                          alt={m.username}
                          width={28}
                          height={28}
                          className="size-7 rounded-full"
                          unoptimized
                        />
                      ) : (
                        <div className="size-7 rounded-full bg-gray-200" />
                      )}
                      <span className="text-gray-700">{m.username}</span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mb-2 mt-4 text-xs font-semibold text-gray-500">
                Messages
              </div>
              <ul>
                {filteredMessages.length === 0 && (
                  <li className="text-gray-400">No messages found</li>
                )}
                {filteredMessages.map((msg) => (
                  <li key={msg.id} className="py-1 text-gray-700">
                    <span className="font-semibold">
                      {msg.user?.username ?? 'Unknown'}:
                    </span>{' '}
                    {msg.isEncrypted && msg.encryptedContent && msg.encryptionIv
                      ? decryptedMessages[msg.id] || '[Encrypted]'
                      : msg.content}
                  </li>
                ))}
              </ul>
            </>
          )}
          {!search && (
            <div className="text-center text-gray-400">
              Type to search members or messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
