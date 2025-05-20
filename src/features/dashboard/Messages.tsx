import React, { useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FixedSizeList as List } from 'react-window';
import { io } from 'socket.io-client';

import ChatUser from '@/components/ChatUser';
import Loader from '@/components/Loader';
import { formatDate } from '@/utils/Helpers';

import type { Message } from '../../types/message';
import { ReactionPicker } from './ReactionPicker';

const socket = io('http://localhost:3000'); // or wherever your server runs

const PAGE_SIZE = 50;

const Messages = (props: {
  messages: Message[];
  currentUserId: string;
  onDelete?: (id: string) => void;
  onReply?: (msg: Message) => void;
  replyLookup?: Map<string, Message>;
  onEdit?: (msg: Message, newContent: string) => Promise<void>;
  currentChannelId: string;
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
  const [pickerOpenFor, setPickerOpenFor] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setAllMessages(messages);
  }, [messages]);

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
    await fetch('/api/messages/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, userId: currentUserId, emoji }),
    });
    socket.emit('addReaction', {
      messageId,
      emoji,
      userId: currentUserId,
      channelId: currentChannelId,
    });
    setPickerOpenFor(null);
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
  };

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    await fetch('/api/messages/reactions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, userId: currentUserId, emoji }),
    });
    socket.emit('removeReaction', {
      messageId,
      emoji,
      userId: currentUserId,
      channelId: currentChannelId,
    });
    setReactions((prev) => {
      const msgReactions = prev[messageId] || [];
      const idx = msgReactions.findIndex((r) => r.emoji === emoji);
      if (idx !== -1 && msgReactions[idx]) {
        msgReactions[idx].userIds = (msgReactions[idx].userIds || []).filter(
          (id) => id !== currentUserId,
        );
        if (msgReactions[idx].userIds.length === 0) msgReactions.splice(idx, 1);
      }
      return { ...prev, [messageId]: [...msgReactions] };
    });
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
      // If it's a temp message (starts with temp-), just remove from UI
      if (id.startsWith('temp-') || id.includes('-')) {
        // UUID check
        setAllMessages((prev) => prev.filter((msg) => msg.id !== id));
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
        socket.emit('deleteMessage', {
          messageId: id,
          channelId: currentChannelId,
        });
        if (onDelete) onDelete(id);
      }
    } catch (error) {
      // Do nothing
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
    if (!el) return undefined;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
    if (isAtBottom) {
      el.scrollTop = el.scrollHeight;
      setShowScrollToBottom(false);
      setUnreadCount(0);
    } else {
      setShowScrollToBottom(true);
      setUnreadCount((c) => c + 1);
    }
    return undefined;
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
    return (
      <div style={style}>
        <div className="group flex flex-col items-start rounded-lg bg-white p-3 shadow-md">
          <div className="flex w-full flex-col">
            {replyMsg && (
              <div className="mb-1 rounded border-l-4 border-blue-400 bg-gray-100 px-2 py-1 text-xs text-gray-600">
                <span className="font-semibold">
                  Replying to {replyMsg.user?.username || 'user'}:
                </span>{' '}
                {replyMsg.content}
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
                <div className="ml-auto flex opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {message.userId === currentUserId && (
                    <button
                      className="ml-2 text-red-500 hover:text-red-700"
                      title="Delete message"
                      type="button"
                      aria-label="Delete message"
                      onClick={() => handleDelete(message.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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
                  )}
                  {message.userId === currentUserId && !message.mediaUrl && (
                    <button
                      className="ml-2 text-gray-400 hover:text-gray-700"
                      title="Edit message"
                      type="button"
                      aria-label="Edit message"
                      onClick={() => handleEditStart(message)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm-6 6h6v-6H3v6z"
                        />
                      </svg>
                    </button>
                  )}
                  {onReply && (
                    <button
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      title="Reply"
                      type="button"
                      aria-label="Reply"
                      onClick={() => onReply(message)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10v4a1 1 0 001 1h3m10-5V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2h6a2 2 0 002-2v-3"
                        />
                      </svg>
                    </button>
                  )}
                  {/* Reaction button */}
                  <button
                    className="z-[100] ml-2 text-gray-500 hover:text-gray-700"
                    title="Add Reaction"
                    type="button"
                    aria-label="Add Reaction"
                    onClick={() => setPickerOpenFor(message.id)}
                  >
                    {pickerOpenFor === message.id && (
                      <div>
                        <ReactionPicker
                          onSelect={(emoji) =>
                            handleAddReaction(message.id, emoji)
                          }
                        />
                        <button
                          className="mt-1 text-xs text-gray-500 hover:text-gray-700"
                          type="button"
                          onClick={() => setPickerOpenFor(null)}
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </button>
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
              <span className="mt-1 text-gray-800">{message.content}</span>
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
        loader={<Loader />}
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
