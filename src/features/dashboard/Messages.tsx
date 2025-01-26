/* eslint-disable react/no-unescaped-entities */
import React from 'react';

import { buttonVariants } from '@/components/ui/button';

import type { Message } from './Message';

const Messages = (props: { messages: Message[] }) => (
  <>
    {(!props.messages || props.messages.length === 0) && (
      <div
        id="noMessages"
        className="flex h-[600px] flex-col items-center justify-center rounded-md bg-card p-5"
      >
        <div className="size-16 rounded-full bg-muted p-3 [&_svg]:stroke-muted-foreground [&_svg]:stroke-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M0 0h24v24H0z" stroke="none" />
            <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3M12 12l8-4.5M12 12v9M12 12L4 7.5" />
          </svg>
        </div>

        <div className="mt-3 text-center">
          <div className="text-xl font-semibold">Let's get started</div>
          <div className="mt-1 text-sm font-medium text-muted-foreground">
            text
          </div>

          <div className="mt-5">
            <a
              className={buttonVariants({ size: 'lg' })}
              href="https://nextjs-boilerplate.com/pro-saas-starter-kit"
            >
              button
            </a>
          </div>
        </div>
      </div>
    )}{' '}
    <div className="space-y-2">
      {' '}
      {props.messages.map((message) => (
        <div
          key={message.messageId}
          className="rounded-lg bg-gray-800 p-3 shadow-md"
        >
          <div className="font-semibold text-blue-400">{message.userId}</div>{' '}
          {/* User name color */}
          <div className="text-gray-300">{message.content}</div>{' '}
          {/* Message text color */}
        </div>
      ))}
    </div>
  </>
);

export { Messages };
