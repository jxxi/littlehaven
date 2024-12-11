/* eslint-disable jsx-a11y/alt-text */

'use client';

import { Image, Plus, Smile } from 'lucide-react';
import React, { useState } from 'react';

const MessageBox = () => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
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
          placeholder="Message #channel-name"
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
            <Image size={20} />
          </button>
          <button
            type="button"
            aria-label="Emoji"
            className="hover:text-gray-200"
          >
            <Smile size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export { MessageBox };
