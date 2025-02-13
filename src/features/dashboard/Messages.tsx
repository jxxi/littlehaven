/* eslint-disable react/no-unescaped-entities */
import { UserButton } from '@clerk/nextjs';
import React from 'react';

import type { Message } from '../../types/message';

const formatDate = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const Messages = (props: { messages: Message[] }) => (
  <>
    {(!props.messages || props.messages.length === 0) && (
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
          <div className="text-xl font-semibold">Let's get started!</div>
        </div>
      </div>
    )}{' '}
    <div className="space-y-2">
      {' '}
      {props.messages.map((message) => (
        <div
          key={message.id}
          className="flex items-start rounded-lg bg-white p-3 shadow-md"
        >
          <UserButton
            appearance={{
              elements: {
                userButtonBox: {
                  flexDirection: 'row-reverse',
                },
              },
            }}
            showName
          />
          <div className="ml-2 flex flex-col">
            <div className="flex items-center">
              <span className="text-gray-800">{message.content}</span>
              <span className="ml-2 text-sm text-gray-500">
                {formatDate(message.createdAt)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </>
);

export { Messages };
