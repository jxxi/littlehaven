// eslint-disable-next-line import/no-extraneous-dependencies
import Picker from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const EmojiPicker = ({ message, setMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close picker if click is outside both picker and button
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    // Add event listener when picker is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEmojiClick = (emojiData) => {
    setMessage(message + emojiData.emoji);
    setIsOpen(false);
  };

  const toggleEmojiPicker = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative w-full max-w-md p-1">
      {/* Emoji button */}
      <button
        type="button"
        aria-label="emoji"
        ref={buttonRef}
        onClick={toggleEmojiPicker}
        className={`z-[100] rounded-full p-2 transition-colors duration-200 ${
          isOpen
            ? 'bg-gray-200 text-blue-600'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`}
      >
        <Smile className="size-5" />
      </button>

      {/* Emoji Picker */}
      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute bottom-full z-[100] mb-2 rounded-lg border bg-white shadow-lg"
          style={{
            bottom: '100%', // Position above the button
            left: 'auto',
            maxHeight: '300px', // Limit height to prevent overflow
            minWidth: '300px',
            right: '0', // Ensure it doesn't overflow the right side
            transform: 'translateY(-50px)', // Adjust position slightly
          }}
        >
          <Picker
            onEmojiClick={handleEmojiClick}
            height={350}
            width={300}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
