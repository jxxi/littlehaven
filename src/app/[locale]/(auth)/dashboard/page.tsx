'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { UserCircleList } from '@/features/circle/UserCircleList';
import { MessageBox } from '@/features/dashboard/MessageBox';

import type { Circle } from '../../../../types/Circle';

const DashboardIndexPage = () => {
  const { user } = useUser();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string>();
  const [activeChannelId, setActiveChannelId] = useState<string>();

  useEffect(() => {
    const fetchCircles = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/circles/user?userId=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch circles');

        const data = await response.json();
        const initialCircles = data?.circles;

        // Only fetch channels if initialCircles is not empty
        if (initialCircles && initialCircles.length > 0) {
          const circlesWithChannels = await Promise.all(
            initialCircles.map(async (circleId) => {
              const channelResponse = await fetch(
                `/api/circles/channels?circleId=${circleId}`,
                {
                  method: 'GET',
                },
              );
              if (!channelResponse.ok)
                throw new Error(
                  `Failed to fetch channels for circle ${circleId}`,
                );
              const channels = await channelResponse.json();
              return { circleId, channels }; // Ensure you return the circleId
            }),
          );

          setCircles(circlesWithChannels);

          // Set activeCircleId only after circlesWithChannels is populated
          const firstCircle = circlesWithChannels[0];
          if (firstCircle) {
            setActiveCircleId(firstCircle.circleId); // Ensure this is set correctly
            if (firstCircle.channels?.length > 0) {
              setActiveChannelId(firstCircle.channels[0].channelId);
            }
          }
        }
      } catch (error) {
        console.error(error); // Log the error for debugging
        setCircles([]);
      }
    };

    fetchCircles();
  }, [user]); // Only run when user changes

  return (
    <div className="flex h-full flex-row">
      <div className="h-full grow-0 bg-white">
        {circles.length > 0 ? (
          <UserCircleList
            circles={circles}
            currentCircleId={activeCircleId}
            currentChannelId={activeChannelId}
            handleCircleClick={(circleId) => setActiveCircleId(circleId)}
            handleChannelClick={(channelId) => setActiveChannelId(channelId)}
          />
        ) : (
          <div className="p-4 text-center">No circles available</div>
        )}
      </div>
      <div className="grow content-end items-end bg-gray-800 p-4">
        <MessageBox
          userId={user?.id ?? ''}
          currentCircleId={activeCircleId}
          currentChannelId={activeChannelId}
        />
      </div>
    </div>
  );
};

export default DashboardIndexPage;
