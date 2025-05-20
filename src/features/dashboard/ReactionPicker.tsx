import Picker from 'emoji-picker-react';
import React, { useEffect, useRef } from 'react';

export function ReactionPicker({
  onSelect,
}: {
  onSelect: (emoji: string) => void;
}) {
  const pickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        onSelect(''); // Signal to close picker without selection
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onSelect]);

  return (
    <div
      ref={pickerRef}
      className="absolute z-[100] rounded-lg border bg-white shadow-lg"
    >
      <Picker
        onEmojiClick={(emojiData) => {
          if (emojiData.emoji) onSelect(emojiData.emoji);
        }}
        height={350}
        width={300}
        previewConfig={{ showPreview: false }}
      />
    </div>
  );
}
