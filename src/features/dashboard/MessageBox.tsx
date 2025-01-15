'use client';

import { Image, Plus } from 'lucide-react';
import React, { useState } from 'react';

import EmojiPicker from './EmojiPicker';
import { MessageState } from './MessageState';

const MessageBox = () => {
  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState([
    { id: 1, text: 'lorem epsom salt', user: 'jenny' },
    { id: 2, text: 'Ive been there!', user: 'rita' },
    { id: 3, text: '🥰', user: 'gamergrl' },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: prevMessages.length + 1, text: message, user: 'currentUser' },
      ]);
      setMessage('');
    }
  };

  return (
    <div className="flex-col">
      <MessageState messages={messages} />
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
              aria-label="Image"
              className="hover:text-gray-200"
            >
              <Image aria-label="image" size={20} />
            </button>
            <EmojiPicker message={message} setMessage={setMessage} />
          </div>
        </div>
      </div>
    </div>
  );
};

export { MessageBox };
