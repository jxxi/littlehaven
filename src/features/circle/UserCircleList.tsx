import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import type { Circle } from './types';

interface UserCircleListProps {
  circles: Circle[];
  currentCircleId?: string;
  currentChannelId?: string;
  unreadCircles: Set<string>;
  unreadChannels: Set<string>;
  handleCircleClick: (circleId: string) => void;
  handleChannelClick: (channelId: string) => void;
}

const UserCircleList: React.FC<UserCircleListProps> = ({
  circles,
  currentCircleId,
  currentChannelId,
  unreadCircles,
  unreadChannels,
  handleCircleClick,
  handleChannelClick,
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
    <div className="flex h-full rounded-md bg-white shadow-md">
      <div className="w-1/3 rounded-md bg-gray-200 p-3">
        {circles.map((circle, index) => (
          <Button
            key={circle.circleId}
            className={`
              mb-2 flex h-12 w-full cursor-pointer items-center rounded-md border bg-white p-3 
              ${selectedIndex === index ? 'ring-4 ring-sky-200' : 'border-transparent'} 
              hover:bg-blue-50
              ${unreadCircles.has(circle.circleId) ? 'bg-blue-100 font-bold' : ''}
              ${currentCircleId === circle.circleId ? 'bg-gray-200' : ''}
            `}
            onClick={() => {
              setSelectedIndex(index);
              handleCircleClick(circle.circleId);
              setCurrentChannel(circle.channels?.[0]?.channelId);
            }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Image
                    key={circle.circleId}
                    src={
                      circle.iconUrl ||
                      '/assets/images/default-circle-icon-removebg.png'
                    }
                    alt=""
                    width={50}
                    height={50}
                    className="mr-2"
                  />
                </TooltipTrigger>
                <TooltipContent className="z-[100]">
                  <p>{circle.description || circle.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Button>
        ))}
      </div>
      <div className="w-2/3 rounded-md bg-gray-100 p-3">
        {selectedIndex !== null && circles[selectedIndex] && (
          <div className="flex flex-col space-y-1">
            <h2 className="mb-2 text-lg font-bold text-gray-800">
              {circles[selectedIndex].name}
            </h2>
            {circles[selectedIndex].channels.map((channel) => (
              <Button
                key={channel.channelId}
                className={`
                  mb-1 w-full rounded-md px-3 py-2 text-left transition-colors
                  ${unreadChannels.has(channel.channelId) ? 'bg-blue-50 font-bold' : ''}
                  ${currentChannel === channel.channelId ? 'bg-gray-100' : ''}
                `}
                onClick={() => {
                  if (selectedIndex !== null && circles[selectedIndex]) {
                    handleChannelClick(channel.channelId);
                    handleCircleClick(circles[selectedIndex].circleId);
                    setCurrentChannel(channel.channelId);
                  }
                }}
              >
                #{channel.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { UserCircleList };
