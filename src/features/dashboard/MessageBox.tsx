'use client';

import { Image, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { GifIcon } from '@/components/icons/GifIcon';

import type { CreateMessage, Message } from '../../types/message';
import EmojiPicker from './EmojiPicker';
import { GifPicker } from './GifPicker';
import { Messages } from './Messages';
import { Video } from './Video';

const MessageBox = ({ userId, currentCircleId, currentChannelId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showGifPicker, setShowGifPicker] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentCircleId || !currentChannelId) return;
      try {
        const response = await fetch(
          `/api/circles/messages?channelId=${currentChannelId}`,
        );
        if (!response.ok) throw new Error('Failed to fetch messages');
        const circleMessages = await response.json();
        setMessages(circleMessages);
      } catch (error) {
        /* empty */
      }
    };

    fetchMessages();
  }, [currentCircleId, currentChannelId, userId]);

  // useEffect(() => {
  //   const eventSource = new EventSource(
  //     `/api/messages/sse?circleId=${currentCircleId}`,
  //   );

  //   eventSource.onmessage = (event) => {
  //     const newMessage = JSON.parse(event.data);
  //     setMessages((prev) => [...prev, newMessage]);
  //   };

  //   return () => {
  //     eventSource.close();
  //   };
  // }, [currentCircleId]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage: CreateMessage = {
      circleId: currentCircleId,
      channelId: currentChannelId,
      userId,
      content: message,
      isTts: false,
    };

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      if (!response.ok) throw new Error('Failed to send message');
      setMessage('');
    } catch (error) {
      // TODO: Show error notification
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
            <button
              type="button"
              aria-label="Send GIF"
              className="hover:text-gray-200"
              onClick={() => setShowGifPicker(!showGifPicker)}
            >
              <GifIcon size={20} />
            </button>
          </div>
        </div>
      </div>
      {showGifPicker && (
        <GifPicker
          onSelect={handleGifSelect}
          onClose={() => setShowGifPicker(false)}
        />
      )}
    </div>
  );
};

export { MessageBox };
