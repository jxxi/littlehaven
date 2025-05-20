import { Search as SearchIcon, Users, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

import type { Message } from '../../types/message';

export function ChatHeader({
  members,
  messages,
  onMemberClick,
}: {
  members: { id: string; name: string; avatarUrl?: string }[];
  messages: Message[];
  onMemberClick?: (memberId: string) => void;
}) {
  const [showMembers, setShowMembers] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState('');

  // Filter logic
  const filteredMembers = search
    ? members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    : [];
  const filteredMessages = search
    ? messages.filter(
        (msg) =>
          msg.content.toLowerCase().includes(search.toLowerCase()) ||
          (msg.user?.username?.toLowerCase().includes(search.toLowerCase()) ??
            false),
      )
    : [];

  return (
    <div className="relative flex items-center justify-end border-b bg-white px-4 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          aria-label="Search"
          type="button"
          className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Search"
          onClick={() => {
            setShowSearch(true);
            setSearch('');
          }}
        >
          <SearchIcon className="size-5" />
        </button>
        <button
          aria-label="Members"
          type="button"
          className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Members"
          onClick={() => setShowMembers(true)}
        >
          <Users className="size-5" />
        </button>
      </div>
      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <button
              type="button"
              className="absolute right-2 top-2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              onClick={() => setShowSearch(false)}
              aria-label="Close search"
            >
              <X className="size-5" />
            </button>
            <input
              type="text"
              placeholder="Search messages or users..."
              className="w-full rounded border px-3 py-2 text-gray-800 focus:outline-none focus:ring"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-4">
              {search && (
                <>
                  <div className="mb-2 text-xs font-semibold text-gray-500">
                    Members
                  </div>
                  <ul>
                    {filteredMembers.length === 0 && (
                      <li className="text-gray-400">No members found</li>
                    )}
                    {filteredMembers.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="flex w-full items-center gap-2 rounded py-2 hover:bg-gray-100"
                        onClick={() => {
                          setShowSearch(false);
                          onMemberClick?.(m.id);
                        }}
                        aria-label={`View member ${m.name}`}
                      >
                        {m.avatarUrl ? (
                          <Image
                            src={m.avatarUrl}
                            alt={m.name}
                            width={28}
                            height={28}
                            className="size-7 rounded-full"
                            unoptimized
                          />
                        ) : (
                          <div className="size-7 rounded-full bg-gray-200" />
                        )}
                        <span className="text-gray-700">{m.name}</span>
                      </button>
                    ))}
                  </ul>
                  <div className="mb-2 mt-4 text-xs font-semibold text-gray-500">
                    Messages
                  </div>
                  <ul>
                    {filteredMessages.length === 0 && (
                      <li className="text-gray-400">No messages found</li>
                    )}
                    {filteredMessages.map((msg) => (
                      <li key={msg.id} className="py-1 text-gray-700">
                        <span className="font-semibold">
                          {msg.user?.username ?? 'Unknown'}:
                        </span>{' '}
                        {msg.content}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {!search && (
                <div className="text-center text-gray-400">
                  Type to search members or messages
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Members Modal */}
      {showMembers && (
        <>
          {/* Overlay for click-away */}
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-black/20"
            onClick={() => setShowMembers(false)}
            aria-label="Close members sidebar"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') setShowMembers(false);
            }}
          />
          <aside className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col border-l bg-white shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="text-lg font-bold text-gray-800">Members</div>
              <button
                type="button"
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                onClick={() => setShowMembers(false)}
                aria-label="Close members"
              >
                <X className="size-5" />
              </button>
            </div>
            <ul className="flex-1 overflow-y-auto p-4">
              {members.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="flex w-full items-center gap-2 rounded py-2 hover:bg-gray-100"
                  onClick={() => {
                    setShowMembers(false);
                    onMemberClick?.(m.id);
                  }}
                  aria-label={`View member ${m.name}`}
                >
                  {m.avatarUrl ? (
                    <Image
                      src={m.avatarUrl}
                      alt={m.name}
                      width={28}
                      height={28}
                      className="size-7 rounded-full"
                      unoptimized
                    />
                  ) : (
                    <div className="size-7 rounded-full bg-gray-200" />
                  )}
                  <span className="text-gray-700">{m.name}</span>
                </button>
              ))}
            </ul>
          </aside>
        </>
      )}
    </div>
  );
}
