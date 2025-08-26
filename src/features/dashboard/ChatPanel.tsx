'use client';

import { UserButton } from '@clerk/nextjs';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import BrandLoader from '@/components/BrandLoader';
import { GifIcon } from '@/components/icons/GifIcon';
import { EncryptionProvider } from '@/contexts/EncryptionContext';
import { clientLogger } from '@/libs/ClientLogger';
import { logError } from '@/utils/Logger';
import { getSocket } from '@/utils/socket';

import type { CreateMessage, Message } from '../../types/message';
import { ChatHeader } from './ChatHeader';
import EmojiPicker from './EmojiPicker';
import { EncryptionHandler } from './EncryptionHandler';
import { GifPicker } from './GifPicker';
import { MembersSidebar } from './MembersSidebar';
import { Messages } from './Messages';
import { SearchSidebar } from './SearchSidebar';

const socket = getSocket();

const ChatPanel = ({
  userId,
  userName,
  userImage,
  currentCircleId,
  currentChannelId,
  setLoading: _setLoadingProp,
}: {
  userId: string;
  userName: string;
  userImage?: string;
  currentCircleId?: string;
  currentChannelId?: string;
  setLoading?: (loading: boolean) => void;
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [openPanel, setOpenPanel] = useState<'members' | 'search' | null>(null);
  const [loading, setLoading] = useState(false);

  const [members, setMembers] = useState<
    { id: string; nickname: string; username: string; imageUrl?: string }[]
  >([]);
  const [replyToMap, setReplyToMap] = useState<Record<string, Message | null>>(
    {},
  );
  const replyTo = currentChannelId
    ? (replyToMap[currentChannelId] ?? null)
    : null;

  useEffect(() => {
    // Join the channel room when component mounts
    if (currentChannelId) {
      socket.emit('joinChannel', currentChannelId);
    }

    const handleReceiveMessage = (newMessage) => {
      // Only add message if it belongs to the current channel
      if (newMessage.channelId === currentChannelId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      if (currentChannelId) {
        socket.emit('leaveChannel', currentChannelId);
      }
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [currentChannelId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        _setLoadingProp?.(true);
        if (!currentCircleId || !currentChannelId) return;
        setMessages([]); // Clear messages before fetching new ones
        const response = await fetch(
          `/api/messages?circleId=${currentCircleId}&channelId=${currentChannelId}`,
        );
        if (!response.ok) throw new Error('Failed to fetch messages');
        const circleMessages = await response.json();
        setMessages(
          circleMessages.map((msg) => ({
            ...msg,
            id: msg.id || msg.messageId,
          })),
        );
      } catch (error) {
        logError('Error in ChatPanel feature', error);
        // TODO: Show error notification to user
      } finally {
        setLoading(false);
        _setLoadingProp?.(false);
      }
    };
    fetchMessages();
  }, [currentCircleId, currentChannelId, userId, _setLoadingProp]);

  useEffect(() => {
    if (!currentCircleId) {
      setMembers([]);
      return;
    }
    const fetchMembers = async () => {
      const res = await fetch(
        `/api/circles/members?circleId=${currentCircleId}`,
      );
      if (res.ok) {
        setMembers(await res.json());
      } else {
        setMembers([]);
      }
    };
    fetchMembers();
  }, [currentCircleId]);

  useEffect(() => {
    setMessages([]);
  }, [currentChannelId]);

  const handleGifSelect = async (gif: { url: string; preview: string }) => {
    try {
      if (!currentCircleId || !currentChannelId) return;

      const newMessage: CreateMessage = {
        circleId: currentCircleId,
        channelId: currentChannelId,
        userId,
        content: '',
        mediaUrl: gif.url,
        mediaType: 'gif',
        thumbnailUrl: gif.preview,
        isTts: false,
      };

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      if (!response.ok) throw new Error('Failed to send GIF');
      setShowGifPicker(false);
    } catch (error) {
      logError('Error in ChatPanel feature', error);
      /* empty */
    }
  };

  // Build a lookup map for replies
  const replyLookup = new Map(messages.map((m) => [m.id, m]));

  const handleSetReplyTo = (msg: Message | null) => {
    if (!currentChannelId) return;
    setReplyToMap((prev) => ({ ...prev, [currentChannelId!]: msg }));
  };

  const handleEditMessage = async (msg: Message, newContent: string) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId: msg.id,
          userId,
          content: newContent,
        }),
      });

      if (!response.ok) throw new Error('Failed to edit message');

      setMessages((msgs) =>
        msgs.map((m) =>
          m.id === msg.id
            ? { ...m, content: newContent, editedAt: new Date() }
            : m,
        ),
      );
    } catch (error) {
      logError('Error in ChatPanel feature', error);
      // Handle error
    }
  };

  return (
    <EncryptionProvider channelId={currentChannelId}>
      <EncryptionHandler>
        {({ encrypt, needsRotation, rotateKey }) => {
          const handleSendMessage = async () => {
            if (!message.trim() || !currentCircleId || !currentChannelId) {
              // TODO: Show error notification to user
              return;
            }

            const tempId = uuidv4();

            // Encrypt message content if encryption is available
            let encryptedContent: string | undefined;
            let encryptionKeyId: string | undefined;
            let isEncrypted = false;

            if (encrypt) {
              try {
                const encrypted = await encrypt(message);
                if (encrypted) {
                  encryptedContent = encrypted.encryptedContent;
                  encryptionKeyId = encrypted.keyId;
                  isEncrypted = true;
                }
              } catch (error) {
                logError('Failed to encrypt message', error);

                // Check if it's a key rotation error
                if (
                  error instanceof Error &&
                  error.message.includes('needs rotation')
                ) {
                  try {
                    clientLogger.info('Attempting automatic key rotation...');
                    await rotateKey(currentChannelId!);

                    // Retry encryption with new key
                    const encrypted = await encrypt(message);
                    if (encrypted) {
                      encryptedContent = encrypted.encryptedContent;
                      encryptionKeyId = encrypted.keyId;
                      isEncrypted = true;
                    }
                  } catch (rotationError) {
                    logError('Failed to rotate key', rotationError);
                    // Continue with unencrypted message
                  }
                } else {
                  // Continue with unencrypted message
                }
              }
            }

            const tempMessage = {
              circleId: currentCircleId!,
              channelId: currentChannelId!,
              userId,
              content: isEncrypted ? '[Encrypted]' : message,
              encryptedContent,
              encryptionKeyId,
              isEncrypted,
              isTts: false,
              replyToMessageId: replyTo?.id,
              id: `temp-${tempId}`,
              createdAt: new Date(),
              user: {
                username: userName,
                imageUrl: userImage,
              },
            } as Message;

            // Optimistically add message to UI
            setMessages((prevMessages) => [...prevMessages, tempMessage]);

            try {
              const response = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tempMessage),
              });

              if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to send message');
              }

              const dbMessage = await response.json();

              // Update local state with DB message immediately
              setMessages((prev) =>
                prev.map((msg) => (msg.id === tempId ? dbMessage : msg)),
              );

              // Then emit socket for other clients
              socket.emit('messageCreated', {
                tempId,
                dbMessage,
                channelId: currentChannelId!,
              });

              setMessage('');
              if (currentChannelId)
                setReplyToMap((prev) => ({
                  ...prev,
                  [currentChannelId]: null,
                }));
            } catch (error) {
              logError('Error in ChatPanel feature', error);
              // TODO: Show error notification to user
            }
          };

          return (
            <div className="relative flex h-full flex-row rounded-md border-2 border-growth-green bg-cream p-4 pb-20 shadow-md">
              <div className="flex flex-1 flex-col transition-all duration-300">
                <ChatHeader
                  onToggleMembers={() =>
                    setOpenPanel(openPanel === 'members' ? null : 'members')
                  }
                  onToggleSearch={() =>
                    setOpenPanel(openPanel === 'search' ? null : 'search')
                  }
                />
                {loading ? (
                  <div className="flex flex-1 items-center justify-center">
                    <BrandLoader />
                  </div>
                ) : (
                  <Messages
                    messages={messages}
                    currentUserId={userId}
                    currentChannelId={currentChannelId}
                    onDelete={(id) =>
                      setMessages((msgs) => msgs.filter((m) => m.id !== id))
                    }
                    onReply={handleSetReplyTo}
                    replyLookup={replyLookup}
                    onEdit={handleEditMessage}
                  />
                )}
                <div className="flex flex-row">
                  <div className="relative flex grow flex-col">
                    {replyTo && (
                      <div className="mb-2 flex items-center rounded border-l-4 border-blue-400 bg-blue-50 px-2 py-1 text-xs text-blue-800">
                        <span className="mr-2 font-semibold">
                          Replying to {replyTo.user?.username || 'user'}:
                        </span>
                        <span className="max-w-xs truncate">
                          {replyTo.content}
                        </span>
                        <button
                          className="ml-2 text-gray-400 hover:text-gray-700"
                          type="button"
                          aria-label="Cancel reply"
                          onClick={() => handleSetReplyTo(null)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-row">
                  <div className="absolute inset-x-0 bottom-0 flex items-center space-x-2 rounded-md border-t-2 border-growth-green bg-white p-4">
                    <UserButton />

                    {/* Key rotation warning */}
                    {needsRotation && (
                      <div className="absolute inset-x-0 -top-12 mx-4 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
                        <div className="flex items-center justify-between">
                          <span>🔐 Encryption key needs rotation</span>
                          <button
                            type="button"
                            onClick={() => rotateKey(currentChannelId!)}
                            className="text-yellow-600 underline hover:text-yellow-800"
                          >
                            Rotate Now
                          </button>
                        </div>
                      </div>
                    )}

                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        replyTo
                          ? `Replying to ${replyTo.user?.username || 'user'}...`
                          : 'Message'
                      }
                      className="w-full rounded-md bg-gray-100 px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                    />

                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center space-x-2 text-gray-400">
                      <EmojiPicker message={message} setMessage={setMessage} />
                      <button
                        type="button"
                        aria-label="Send GIF"
                        className="p-1 hover:text-gray-600"
                        onClick={() => setShowGifPicker(!showGifPicker)}
                      >
                        <GifIcon size={20} />
                      </button>
                    </div>
                  </div>
                  {showGifPicker && (
                    <GifPicker
                      onSelect={handleGifSelect}
                      onClose={() => setShowGifPicker(false)}
                    />
                  )}
                </div>
              </div>
              {openPanel === 'members' && (
                <MembersSidebar
                  members={members}
                  onClose={() => setOpenPanel(null)}
                />
              )}
              {openPanel === 'search' && (
                <div className="z-10 flex h-full w-80 flex-col border-l bg-white shadow-lg">
                  <SearchSidebar
                    members={members.map((m) => ({
                      userId: m.id,
                      username: m.nickname ?? m.username,
                      imageUrl: m.imageUrl,
                    }))}
                    messages={messages}
                    onMemberClick={() => {
                      /* handle member click */
                    }}
                    onClose={() => setOpenPanel(null)}
                  />
                </div>
              )}
            </div>
          );
        }}
      </EncryptionHandler>
    </EncryptionProvider>
  );
};

export { ChatPanel };
