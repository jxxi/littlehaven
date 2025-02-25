import Image from 'next/image';
import React from 'react';

const ChatUser = ({ username, imageUrl }) => {
  return (
    <div className="flex flex-row items-center space-x-2">
      <Image
        src={imageUrl}
        alt={`${username}'s avatar`}
        className="size-10 rounded-full"
        width={40}
        height={40}
      />
      <span className="font-semibold text-gray-800">{username}</span>
    </div>
  );
};

export default ChatUser;
