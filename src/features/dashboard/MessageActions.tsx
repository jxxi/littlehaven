import { Smile } from 'lucide-react';
import React, { useState } from 'react';

import { ReactionPicker } from './ReactionPicker';

export function MessageActions({
  message,
  currentUserId,
  onDelete,
  onEditStart,
  onReply,
  handleAddReaction,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      {message.userId === currentUserId && (
        <button
          className="ml-2 text-red-500 hover:text-red-700"
          title="Delete message"
          type="button"
          aria-label="Delete message"
          onClick={() => onDelete(message.id)}
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
          onClick={() => onEditStart(message)}
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
        className="relative z-[100] ml-2 text-gray-500 hover:text-gray-700"
        title="Add Reaction"
        type="button"
        aria-label="Add Reaction"
        onClick={() => setPickerOpen((v) => !v)}
      >
        <Smile className="size-5" />
        {pickerOpen && (
          <div className="absolute left-0 top-8 z-[200]">
            <ReactionPicker
              onSelect={(emoji) => {
                setPickerOpen(false);
                if (emoji) handleAddReaction(message.id, emoji);
              }}
            />
          </div>
        )}
      </button>
    </div>
  );
}
