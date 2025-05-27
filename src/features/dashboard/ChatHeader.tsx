import { Search as SearchIcon, Users } from 'lucide-react';
import React from 'react';

export function ChatHeader({
  onToggleMembers,
  onToggleSearch,
}: {
  onToggleMembers: () => void;
  onToggleSearch: () => void;
}) {
  return (
    <div className="relative flex items-center justify-end border-b bg-white px-4 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          aria-label="Search"
          type="button"
          className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Search"
          onClick={onToggleSearch}
        >
          <SearchIcon className="size-5" />
        </button>
        <button
          aria-label="Members"
          type="button"
          className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Members"
          onClick={onToggleMembers}
        >
          <Users className="size-5" />
        </button>
      </div>
    </div>
  );
}
