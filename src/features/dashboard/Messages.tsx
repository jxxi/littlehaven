import React from 'react';

import ChatUser from '@/components/ChatUser';
import { formatDate } from '@/utils/Helpers';

import type { Message } from '../../types/message';
import { ReactionPicker } from './ReactionPicker';

const Messages = (props: {
  messages: Message[];
  currentUserId: string;
  onDelete?: (id: string) => void;
  onReply?: (msg: Message) => void;
  replyLookup?: Map<string, Message>;
  onEdit?: (msg: Message, newContent: string) => Promise<void>;
}) => {
  const { messages, currentUserId, onDelete, onReply, replyLookup, onEdit } =
    props;
  const [pickerOpenFor, setPickerOpenFor] = React.useState<string | null>(null);
  const [reactions, setReactions] = React.useState<
    Record<string, { emoji: string; userIds: string[] }[]>
  >({});
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingValue, setEditingValue] = React.useState('');

  React.useEffect(() => {
    // Fetch reactions for all messages
    const fetchReactions = async () => {
      const all: Record<string, { emoji: string; userIds: string[] }[]> = {};
      await Promise.all(
        messages.map(async (message) => {
          const res = await fetch(
            `/api/messages/reactions?messageId=${message?.id}`,
          );
          if (res.ok) {
            const data = await res.json();
            all[message?.id] = data.reactions || [];
          }
        }),
      );
      setReactions(all);
    };
    if (messages.length) fetchReactions();
  }, [messages]);

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId: id, userId: currentUserId }),
    });
    if (res.ok && onDelete) onDelete(id);
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    await fetch('/api/messages/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, userId: currentUserId, emoji }),
    });
    setPickerOpenFor(null);
    // Optimistically update UI
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

  return (
    <>
      {(!messages || messages.length === 0) && (
        <div
          id="noMessages"
          className="flex h-[600px] flex-col items-center justify-center rounded-md bg-white p-5 shadow-md"
        >
          <div className="size-16 rounded-full bg-gray-200 p-3 [&_svg]:stroke-muted-foreground [&_svg]:stroke-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 10h.01" />
              <path d="M12 10h.01" />
              <path d="M16 10h.01" />
            </svg>
          </div>

          <div className="mt-3 text-center">
            <div className="text-xl font-semibold">Let&apos;s get started!</div>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {messages.map((message, idx) => {
          const replyMsg =
            message.replyToMessageId &&
            replyLookup?.get(message.replyToMessageId);
          const msgReactions = reactions[message.id] || [];
          return (
            <div
              key={message.id ?? idx}
              className="flex flex-col items-start rounded-lg bg-white p-3 shadow-md"
            >
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
                      username={message.user.username}
                      imageUrl={message.user.imageUrl}
                    />
                    <span className="text-sm text-gray-500">
                      {formatDate(message.createdAt)}
                    </span>
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
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      title="Add Reaction"
                      type="button"
                      aria-label="Add Reaction"
                      onClick={() => setPickerOpenFor(message.id)}
                    >
                      <span role="img" aria-label="Add Reaction">
                        🙂
                      </span>
                    </button>
                    {pickerOpenFor === message.id && (
                      <div className="absolute z-50 mt-2">
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
          );
        })}
      </div>
    </>
  );
};

export { Messages };
