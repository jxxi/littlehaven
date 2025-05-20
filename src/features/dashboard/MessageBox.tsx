'use client';

import { UserButton } from '@clerk/nextjs';
import { Image } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

import { GifIcon } from '@/components/icons/GifIcon';

import type { CreateMessage, Message } from '../../types/message';
import { ChatHeader } from './ChatHeader';
import EmojiPicker from './EmojiPicker';
import { GifPicker } from './GifPicker';
import { Messages } from './Messages';

const socket = io('http://localhost:3000');

const MessageBox = ({
  userId,
  userName,
  userImage,
  currentCircleId,
  currentChannelId,
  setLoading,
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showGifPicker, setShowGifPicker] = useState(false);

  const [members, setMembers] = useState<
    { id: string; name: string; avatarUrl?: string }[]
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

    socket.on('receiveMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      if (currentChannelId) {
        socket.emit('leaveChannel', currentChannelId);
      }
      socket.off('receiveMessage');
    };
  }, [currentChannelId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!currentCircleId || !currentChannelId) return;
        setMessages([]); // Clear messages before fetching new ones
        const response = await fetch(
          `/api/messages?circleId=${currentCircleId}&channelId=${currentChannelId}`,
        );
        if (!response.ok) throw new Error('Failed to fetch messages');
        const circleMessages = await response.json();
        //
        setMessages(
          circleMessages.map((msg) => ({
            ...msg,
            id: msg.id || msg.messageId,
          })),
        );
      } catch (error) {
        // TODO: Show error notification to user
      } finally {
        setLoading(false); // Set loading to false after fetching messages
      }
    };

    fetchMessages();
  }, [currentCircleId, currentChannelId, userId, setLoading]);

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

  const handleSendMessage = async () => {
    if (!message.trim() || !currentCircleId || !currentChannelId) {
      // TODO: Show error notification to user
      return;
    }

    const tempId = uuidv4();
    const tempMessage = {
      circleId: currentCircleId,
      channelId: currentChannelId,
      userId,
      content: message,
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
        channelId: currentChannelId,
      });

      setMessage('');
      if (currentChannelId)
        setReplyToMap((prev) => ({ ...prev, [currentChannelId]: null }));
    } catch (error) {
      // TODO: Show error notification to user
    }
  };

  const handleFileUpload = async (type: 'image' | 'video') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : 'video/*';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        // Upload file
        const response = await fetch('/api/messages', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const { url, poster } = await response.json();

        const newMessage: CreateMessage = {
          circleId: currentCircleId,
          channelId: currentChannelId,
          userId,
          content: message,
          mediaUrl: url,
          mediaType: type,
          thumbnailUrl: poster,
          isTts: false,
        };

        const messageResponse = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMessage),
        });

        if (!messageResponse.ok) throw new Error('Message Upload failed');
      } catch (error) {
        // TODO: Show error notification to user
      }
    };

    input.click();
  };

  const handleGifSelect = async (gif: { url: string; preview: string }) => {
    try {
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
      /* empty */
    }
  };

  // Build a lookup map for replies
  const replyLookup = new Map(messages.map((m) => [m.id, m]));

  const handleSetReplyTo = (msg: Message | null) => {
    if (!currentChannelId) return;
    setReplyToMap((prev) => ({ ...prev, [currentChannelId]: msg }));
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
      // Handle error
    }
  };

  return (
    <div className="relative h-full flex-col rounded-md border border-black bg-white p-4 pb-20 shadow-md">
      <ChatHeader
        members={members}
        messages={messages}
        onMemberClick={() => {
          /* handle member click */
        }}
      />
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
      <div className="flex flex-row">
        <div className="relative flex grow flex-col">
          {replyTo && (
            <div className="mb-2 flex items-center rounded border-l-4 border-blue-400 bg-blue-50 px-2 py-1 text-xs text-blue-800">
              <span className="mr-2 font-semibold">
                Replying to {replyTo.user?.username || 'user'}:
              </span>
              <span className="max-w-xs truncate">{replyTo.content}</span>
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
        <div className="absolute inset-x-0 bottom-0 flex items-center space-x-2 rounded-md bg-gray-200 p-4">
          <UserButton />

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
            <button
              type="button"
              aria-label="Upload Image"
              className="p-1 hover:text-gray-600"
              onClick={() => handleFileUpload('image')}
            >
              <Image aria-label="image" alt-text="image" size={20} />
            </button>
            <button
              type="button"
              aria-label="Upload Video"
              className="p-1 hover:text-gray-600"
              onClick={() => handleFileUpload('video')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </button>
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
  );
};

export { MessageBox };
