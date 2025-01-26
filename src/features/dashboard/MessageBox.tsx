'use client';

import { Image, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { getAllMessagesForChannel } from '@/utils/message/operations';

import EmojiPicker from './EmojiPicker';
import type { Message } from './Message';
import { Messages } from './Messages';
import { Video } from './Video';

const MessageBox = ({ userId, currentCircleId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const channelMessages = await getAllMessagesForChannel(currentCircleId);
        setMessages(channelMessages);
      } catch (error) {
        /* empty */
      }
    };

    fetchMessages();
  }, [currentCircleId]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            circleId: currentCircleId,
            userId,
            content: message,
          }),
        });

        if (!response.ok) throw new Error('Failed to send message');

        const newMessage = await response.json();
        setMessages((prev) => [...prev, newMessage]);
        setMessage('');
      } catch (error) {
        // TODO: Show error notification
      }
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
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const { url, poster } = await response.json();

        // Add new message with media
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            messageId: (prevMessages.length + 1).toString(),
            content: '',
            userId,
            circleId: currentCircleId,
            mediaUrl: url,
            mediaType: type,
            thumbnailUrl: poster,
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        // TODO: Show error notification to user
      }
    };

    input.click();
  };

  return (
    <div className="flex-col">
      <Messages messages={messages} />
      <div className="flex items-center space-x-2 bg-gray-700 p-4">
        <button
          type="button"
          aria-label="Add"
          className="text-gray-400 hover:text-gray-200"
        >
          <Plus size={24} />
        </button>

        <div className="relative grow">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            className="w-full rounded-md bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />

          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 space-x-2 text-gray-400">
            <button
              type="button"
              aria-label="Upload Image"
              className="hover:text-gray-200"
              onClick={() => handleFileUpload('image')}
            >
              <Image aria-label="Image" size={20} />
            </button>
            <button
              type="button"
              aria-label="Upload Video"
              className="hover:text-gray-200"
              onClick={() => handleFileUpload('video')}
            >
              <Video src="" />
            </button>
            <EmojiPicker message={message} setMessage={setMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export { MessageBox };
