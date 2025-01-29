'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { UserCircleList } from '@/features/circle/UserCircleList';
import { MessageBox } from '@/features/dashboard/MessageBox';

interface Channel {
  channelId: string;
  name: string;
  description?: string;
  type: 'text' | 'voice';
}

interface Circle {
  circleId: string;
  name: string;
  description?: string;
  icon?: string;
  channels: Channel[];
}

const DashboardIndexPage = () => {
  const { user } = useUser();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string>();
  const [activeChannelId, setActiveChannelId] = useState<string>();

  useEffect(() => {
    const fetchCircles = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/circles?userId=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch circles');

        const data = await response.json();
        setCircles(data);

        // Fetch channels for each circle
        const circlesWithChannels = await Promise.all(
          data.map(async (circle) => {
            const channelResponse = await fetch(
              `/api/channels?circleId=${circle.circleId}`,
            );
            if (!channelResponse.ok)
              throw new Error(
                `Failed to fetch channels for circle ${circle.circleId}`,
              );
            const channels = await channelResponse.json();
            return { ...circle, channels };
          }),
        );

        setCircles(circlesWithChannels);
        if (circlesWithChannels.length > 0) {
          const firstCircle = circlesWithChannels[0];
          setActiveCircleId(firstCircle.circleId);
          if (firstCircle.channels?.length > 0) {
            setActiveChannelId(firstCircle.channels[0].channelId);
          }
        }
      } catch (error) {
        setCircles([]);
      }
    };

    fetchCircles();
  }, [user]);

  return (
    <div className="flex h-full flex-row">
      <div className="h-full grow-0 bg-white">
        <UserCircleList circles={circles} />
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
