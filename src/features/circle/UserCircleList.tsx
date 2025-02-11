import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import type { Circle } from '../../types/Circle';

interface UserCircleListProps {
  circles: Circle[];
  handleCircleClick: (circleId: string) => void;
  handleChannelClick: (channelId: string) => void;
  currentChannelId: string | undefined;
  currentCircleId: string | undefined;
}

const UserCircleList: React.FC<UserCircleListProps> = ({
  circles,
  handleCircleClick,
  handleChannelClick,
  currentChannelId,
  currentCircleId,
}) => {
  const selectedCircleIndex = circles.findIndex(
    (circle) => circle.circleId === currentCircleId,
  );

  const [currentChannel, setCurrentChannel] = useState<string | undefined>(
    currentChannelId,
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    selectedCircleIndex !== -1 ? selectedCircleIndex : null,
  );

  if (!circles) {
    return (
      <div className="rounded-md bg-card p-3">
        <div className="max-w-3xl space-y-2" />
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="w-1/3 rounded-md bg-card p-3">
        {circles.map((circle, index) => (
          <Button
            key={circle.circleId}
            className="flex w-full cursor-pointer items-center rounded-md border p-3 hover:bg-accent"
            onClick={() => {
              setSelectedIndex(index);
              handleCircleClick(circle.circleId);
              setCurrentChannel(circle.channels?.[0]?.channelId);
            }}
          >
            <Image
              src={circle.icon || '/assets/images/default-circle-icon.png'}
              alt=""
              width={32}
              height={32}
              className="mr-2"
            />
            <div className="font-bold">{circle.name}</div>
          </Button>
        ))}
      </div>
      <div className="w-2/3 rounded-md bg-card p-3">
        {selectedIndex !== null && circles[selectedIndex] && (
          <div className="flex flex-col space-y-1">
            {circles[selectedIndex].channels.map((channel) => (
              <Button
                key={channel.channelId}
                className={`rounded px-2 py-1 text-white ${currentChannel === channel.channelId ? 'bg-accent' : ''}`}
                onClick={() => {
                  handleChannelClick(channel.channelId);
                  setCurrentChannel(channel.channelId);
                }}
              >
                {channel.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { UserCircleList };
