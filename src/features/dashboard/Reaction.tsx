// eslint-disable-next-line import/no-extraneous-dependencies
import Picker from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const Reaction = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
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
    setSelectedEmoji(emojiData.emoji);
    setIsOpen(false);
  };

  const toggleEmojiPicker = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative w-full max-w-md p-4">
      {/* Emoji button */}
      <button
        type="button"
        aria-label="emoji"
        ref={buttonRef}
        onClick={toggleEmojiPicker}
        className={`
          rounded-full p-2 transition-colors duration-200
          ${
            isOpen
              ? 'bg-gray-200 text-blue-600'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }
        `}
      >
        <Smile className="size-5" />
      </button>

      {/* Emoji Picker */}
      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute bottom-full left-0 z-50 mb-2 rounded-lg border bg-white shadow-lg"
        >
          <Picker
            onEmojiClick={handleEmojiClick}
            height={350}
            width={300}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Selected Emoji Display */}
      {selectedEmoji && (
        <div className="mt-2 text-xl">Selected: {selectedEmoji}</div>
      )}
    </div>
  );
};

export default Reaction;
