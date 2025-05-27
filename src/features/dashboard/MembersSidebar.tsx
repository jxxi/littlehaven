import Image from 'next/image';

export function MembersSidebar({ members, onClose }) {
  return (
    <div className="z-10 flex h-full w-80 flex-col border-l bg-white shadow-lg">
      <div className="flex items-center border-b px-4 py-3">
        <div className="text-lg font-bold text-gray-800">Members</div>
      </div>
      <ul className="flex-1 overflow-y-auto p-4">
        {members.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded py-2 hover:bg-gray-100"
              onClick={() => {
                onClose();
                // Optionally call onMemberClick here if you want
              }}
              aria-label={`View member ${m.nickname}`}
            >
              {m.imageUrl ? (
                <Image
                  src={m.imageUrl}
                  alt={m.nickname}
                  width={28}
                  height={28}
                  className="size-7 rounded-full"
                  unoptimized
                />
              ) : (
                <div className="size-7 rounded-full bg-gray-200" />
              )}
              <span className="text-gray-700">{m.nickname}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
