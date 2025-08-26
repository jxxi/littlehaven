import React, { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FixedSizeList as List } from 'react-window';

import BrandLoader from '@/components/BrandLoader';
import ChatUser from '@/components/ChatUser';
import { useEncryption } from '@/hooks/useEncryption';
import { clientLogger } from '@/libs/ClientLogger';
import { formatDate } from '@/utils/Helpers';
import { getSocket } from '@/utils/socket';

import type { Message } from '../../types/message';
import { MessageActions } from './MessageActions';

const socket = getSocket();

const PAGE_SIZE = 50;

const Messages = (props: {
  messages: Message[];
  currentUserId: string;
  onDelete?: (id: string) => void;
  onReply?: (msg: Message) => void;
  replyLookup?: Map<string, Message>;
  onEdit?: (msg: Message, newContent: string) => Promise<void>;
  currentChannelId?: string;
}) => {
  const {
    messages,
    currentUserId,
    onDelete,
    onReply,
    replyLookup,
    onEdit,
    currentChannelId,
  } = props;
  const [allMessages, setAllMessages] = useState<Message[]>(messages);
  const [reactions, setReactions] = useState<
    Record<string, { emoji: string; userIds: string[] }[]>
  >({});
  const [hasMoreTop, setHasMoreTop] = useState(true);
  const [hasMoreBottom, setHasMoreBottom] = useState(true);
  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingBottom, setLoadingBottom] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get encryption hook for decryption
  const { decrypt } = useEncryption(currentChannelId);
  const [decryptedMessages, setDecryptedMessages] = useState<
    Record<string, string>
  >({});

  // Decrypt encrypted messages
  const decryptMessage = useCallback(
    async (message: Message) => {
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
        clientLogger.error('Failed to decrypt message', error);
        // Show encrypted indicator if decryption fails
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

  useEffect(() => {
    setAllMessages(messages);
    // Populate reactions from messages prop
    const initialReactions = {};
    for (const msg of messages) {
      if (msg.reactions) initialReactions[msg.id] = msg.reactions;
    }
    setReactions(initialReactions);
    setHasMoreTop(false);
    setHasMoreBottom(false);
    setLoadingTop(false);
    setLoadingBottom(false);
    setEditingId(null);
    setEditingValue('');
    setShowScrollToBottom(false);
    setUnreadCount(0);
  }, [currentChannelId, messages]);

  const handleEditStart = (msg: Message) => {
    setEditingId(msg.id);
    setEditingValue(msg.content);
  };

  const handleEditSave = async (msg: Message) => {
    if (!onEdit) return;
    await onEdit(msg, editingValue);
    setEditingId(null);
    setEditingValue('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await fetch('/api/messages/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, userId: currentUserId, emoji }),
      });
      if (currentChannelId) {
        socket.emit('addReaction', {
          messageId,
          emoji,
          userId: currentUserId,
          channelId: currentChannelId,
        });
      }
      setReactions((prev) => {
        const msgReactions = prev[messageId] || [];
        const existing = msgReactions.find((r) => r.emoji === emoji);
        if (existing) {
          if (!existing.userIds.includes(currentUserId))
            existing.userIds.push(currentUserId);
        } else {
          msgReactions.push({ emoji, userIds: [currentUserId] });
        }
        return { ...prev, [messageId]: [...msgReactions] };
      });
    } catch (error) {
      clientLogger.error('Error adding reaction', error);
    }
  };

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    try {
      await fetch('/api/messages/reactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, userId: currentUserId, emoji }),
      });
      if (currentChannelId) {
        socket.emit('removeReaction', {
          messageId,
          emoji,
          userId: currentUserId,
          channelId: currentChannelId,
        });
      }
      setReactions((prev) => {
        const msgReactions = prev[messageId] || [];
        const idx = msgReactions.findIndex((r) => r.emoji === emoji);
        if (idx !== -1 && msgReactions[idx]) {
          msgReactions[idx].userIds = (msgReactions[idx].userIds || []).filter(
            (id) => id !== currentUserId,
          );
          if (msgReactions[idx].userIds.length === 0)
            msgReactions.splice(idx, 1);
        }
        return { ...prev, [messageId]: [...msgReactions] };
      });
    } catch (error) {
      clientLogger.error('Error removing reaction', error);
    }
  };

  // Fetch older messages (top)
  const fetchMoreOlder = useCallback(async () => {
    if (loadingTop || !hasMoreTop || allMessages.length === 0) return;
    setLoadingTop(true);
    const oldest = allMessages[0];
    if (!oldest) return;
    const before = oldest.createdAt ? oldest.createdAt.toString() : '';
    const url = `/api/messages?circleId=${oldest.circleId}&channelId=${oldest.channelId}&before=${encodeURIComponent(before)}&limit=${PAGE_SIZE}`;
    const res = await fetch(url);
    if (!res.ok) {
      setLoadingTop(false);
      return;
    }
    const older = await res.json();
    if (!older.length) setHasMoreTop(false);
    else {
      setReactions((prev) => {
        const next = { ...prev };
        for (const msg of older) next[msg.id] = msg.reactions || [];
        return next;
      });
      setAllMessages((prev) => [...older, ...prev]);
    }
    setLoadingTop(false);
  }, [loadingTop, hasMoreTop, allMessages]);

  // Fetch newer messages (bottom)
  const fetchMoreNewer = useCallback(async () => {
    if (loadingBottom || !hasMoreBottom || allMessages.length === 0) return;
    setLoadingBottom(true);
    const newest = allMessages[allMessages.length - 1];
    if (!newest) return;
    const after = newest.createdAt ? newest.createdAt.toString() : '';
    // You need to implement the 'after' param in your API for this to work
    const url = `/api/messages?circleId=${newest.circleId}&channelId=${newest.channelId}&after=${encodeURIComponent(after)}&limit=${PAGE_SIZE}`;
    const res = await fetch(url);
    if (!res.ok) {
      setLoadingBottom(false);
      return;
    }
    const newer = await res.json();
    if (!newer.length) setHasMoreBottom(false);
    else {
      setReactions((prev) => {
        const next = { ...prev };
        for (const msg of newer) next[msg.id] = msg.reactions || [];
        return next;
      });
      setAllMessages((prev) => [...prev, ...newer]);
    }
    setLoadingBottom(false);
  }, [loadingBottom, hasMoreBottom, allMessages]);

  // Handler functions must be above Row
  const handleDelete = async (id: string) => {
    try {
      if (id.startsWith('temp-')) {
        // Tell the server to cancel this temp message
        await fetch('/api/messages/cancel-temp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tempId: id }),
        });
        setAllMessages((prevMsgs) => prevMsgs.filter((msg) => msg.id !== id));
        if (onDelete) onDelete(id);
        return;
      }

      const response = await fetch('/api/messages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: id, userId: currentUserId }),
      });

      if (response.ok) {
        setAllMessages((prev) => prev.filter((msg) => msg.id !== id));
        if (currentChannelId) {
          socket.emit('deleteMessage', {
            messageId: id,
            channelId: currentChannelId,
          });
        }
        if (onDelete) onDelete(id);
      }
    } catch (error) {
      clientLogger.error('Error deleting message', error);
    }
  };

  // Add socket listener for delete events
  useEffect(() => {
    socket.on('messageDeleted', (data: { messageId: string }) => {
      setAllMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
    });

    // Add this handler for new messages with DB IDs
    socket.on(
      'messageCreated',
      (data: { tempId: string; dbMessage: Message }) => {
        setAllMessages((prev) =>
          prev.map((msg) =>
            // Replace temporary message with DB version containing real ID
            msg.id === data.tempId ? data.dbMessage : msg,
          ),
        );
      },
    );

    return () => {
      socket.off('messageDeleted');
      socket.off('messageCreated');
    };
  }, []);

  // Auto-scroll to bottom if at bottom when new messages arrive
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    if (isAtBottom) {
      el.scrollTop = el.scrollHeight;
      setShowScrollToBottom(false);
      setUnreadCount(0);
    } else {
      setShowScrollToBottom(true);
      setUnreadCount((c) => c + 1);
    }
  }, [allMessages.length]);

  // Listen for scroll to toggle sticky button
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
      setShowScrollToBottom(!isAtBottom);
      if (isAtBottom) setUnreadCount(0);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Virtualized row renderer
  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const message = allMessages[index];

    if (!message) {
      return <div style={style} />;
    }
    const replyMsg =
      message.replyToMessageId && replyLookup?.get(message.replyToMessageId);
    const msgReactions = reactions[message.id] || [];
    const decryptedContent = decryptedMessages[message.id];
    const contentToDisplay = decryptedContent || message.content;

    return (
      <div style={style}>
        <div className="group flex flex-col items-start rounded-lg bg-white p-3 shadow-md">
          <div className="float-end flex w-full flex-col">
            {replyMsg && (
              <div className="mb-1 rounded border-l-4 border-blue-400 bg-gray-100 px-2 py-1 text-xs text-gray-600">
                <span className="font-semibold">
                  Replying to {replyMsg.user?.username || 'user'}:
                </span>{' '}
                {replyMsg.isEncrypted &&
                replyMsg.encryptedContent &&
                replyMsg.encryptionIv
                  ? decryptedMessages[replyMsg.id] || '[Encrypted]'
                  : replyMsg.content}
                {replyMsg.isEncrypted &&
                replyMsg.encryptedContent &&
                replyMsg.encryptionIv
                  ? decryptedMessages[replyMsg.id] || '[Encrypted]'
                  : replyMsg.content}
              </div>
            )}
            {message.user && (
              <div className="flex items-center space-x-2">
                <ChatUser
                  username={message.user?.username}
                  imageUrl={message.user?.imageUrl}
                />
                <span className="text-sm text-gray-500">
                  {formatDate(message.createdAt)}
                </span>
                <div className="ml-auto">
                  <MessageActions
                    message={message}
                    currentUserId={currentUserId}
                    onDelete={handleDelete}
                    onEditStart={handleEditStart}
                    onReply={onReply}
                    handleAddReaction={handleAddReaction}
                  />
                </div>
              </div>
            )}
            {editingId === message.id ? (
              <div className="mt-1 flex w-full items-center space-x-2">
                <input
                  className="w-full rounded border px-2 py-1 text-gray-800"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave(message);
                    if (e.key === 'Escape') handleEditCancel();
                  }}
                />
                <button
                  className="text-blue-500 hover:text-blue-700"
                  type="button"
                  onClick={() => handleEditSave(message)}
                >
                  Save
                </button>
                <button
                  className="text-gray-400 hover:text-gray-700"
                  type="button"
                  onClick={handleEditCancel}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <span className="mt-1 text-gray-800">{contentToDisplay}</span>
            )}
          </div>
          {/* Reactions display */}
          {Array.isArray(msgReactions) && msgReactions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {msgReactions.map((r) => {
                const reacted = r.userIds?.includes?.(currentUserId);
                return (
                  <button
                    key={r.emoji}
                    className={`rounded-full border px-2 py-0.5 text-sm ${reacted ? 'border-yellow-400 bg-yellow-100' : 'border-gray-300 bg-gray-100'}`}
                    type="button"
                    onClick={() =>
                      reacted
                        ? handleRemoveReaction(message.id, r.emoji)
                        : handleAddReaction(message.id, r.emoji)
                    }
                  >
                    {r.emoji} {r.userIds?.length ?? 0}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={scrollRef}
      id="messages-scrollable"
      style={{ height: 600, overflow: 'auto', position: 'relative' }}
    >
      <InfiniteScroll
        dataLength={allMessages.length}
        next={fetchMoreOlder}
        hasMore={hasMoreTop}
        inverse
        loader={<BrandLoader />}
        style={{ display: 'flex', flexDirection: 'column-reverse' }}
        scrollableTarget="messages-scrollable"
      >
        <List
          height={600}
          itemCount={allMessages.length}
          itemSize={120}
          width="100%"
        >
          {Row}
        </List>
        {hasMoreBottom && allMessages.length > 0 && (
          <div className="flex justify-center py-2">
            <button type="button" onClick={fetchMoreNewer}>
              Load newer
            </button>
          </div>
        )}
      </InfiniteScroll>
      {showScrollToBottom && (
        <button
          type="button"
          className="fixed bottom-24 right-8 z-50 rounded-full bg-blue-500 px-4 py-2 text-white shadow-lg hover:bg-blue-600"
          onClick={() => {
            const el = scrollRef.current;
            if (el) el.scrollTop = el.scrollHeight;
            setShowScrollToBottom(false);
            setUnreadCount(0);
          }}
        >
          {unreadCount > 0 ? `${unreadCount} new` : 'Scroll to latest'}
        </button>
      )}
      {unreadCount > 0 && !showScrollToBottom && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded bg-yellow-200 px-3 py-1 text-sm font-semibold text-yellow-900 shadow">
          {unreadCount} new message{unreadCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export { Messages };
