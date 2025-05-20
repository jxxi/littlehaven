'use client';

import { useUser } from '@clerk/nextjs';
import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';

import Loader from '@/components/Loader';
import type { Circle } from '@/features/circle/types';
import { UserCircleList } from '@/features/circle/UserCircleList';
import { MessageBox } from '@/features/dashboard/MessageBox';

const DashboardIndexPage = () => {
  const { user } = useUser();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string>();
  const [activeChannelId, setActiveChannelId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [unreadCircles, setUnreadCircles] = useState<Set<string>>(new Set());
  const [unreadChannels, setUnreadChannels] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchCircles = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/circles?userId=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch circles');

        const initialCircles = await response.json();

        // Only fetch channels if initialCircles is not empty
        if (initialCircles && initialCircles.length > 0) {
          const circlesWithChannels = await Promise.all(
            initialCircles.map(async (circle) => {
              const { circleId } = circle;
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
              return { ...circle, channels }; // Flatten the structure
            }),
          );

          setCircles(circlesWithChannels);
          setActiveCircleId(circlesWithChannels[0].circleId);
          if (circlesWithChannels[0].channels?.length > 0) {
            setActiveChannelId(circlesWithChannels[0].channels[0].channelId);
          }
        }
      } catch (error) {
        //
      } finally {
        setLoading(false);
      }
    };

    fetchCircles();
  }, [user]); // Only run when user changes

  useEffect(() => {}, [circles, activeCircleId]);

  useEffect((): (() => void) => {
    if (!user) return () => {};

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    circles.forEach((circle) => {
      const channel = pusher.subscribe(`circle-${circle.circleId}`);
      channel.bind(
        'new-message',
        (data: { timestamp: string; channelId: string }) => {
          if (!document.hasFocus()) {
            setUnreadCircles((prev) => new Set(prev).add(circle.circleId));
            setUnreadChannels((prev) => new Set(prev).add(data.channelId));
          }
        },
      );
    });

    const cleanup = () => {
      circles.forEach((circle) => {
        pusher.unsubscribe(`circle-${circle.circleId}`);
      });
    };

    return cleanup;
  }, [circles, user]);

  const handleCircleClick = (circleId: string) => {
    setActiveCircleId(circleId);
    setUnreadCircles((prev) => {
      const next = new Set(prev);
      next.delete(circleId);
      return next;
    });

    // Update last read in DB
    fetch('/api/circles/read', {
      method: 'POST',
      body: JSON.stringify({ circleId, userId: user?.id }),
    });
  };

  const handleChannelClick = (channelId: string) => {
    setActiveChannelId(channelId);
    setUnreadChannels((prev) => {
      const next = new Set(prev);
      next.delete(channelId);
      return next;
    });

    fetch('/api/channels/read', {
      method: 'POST',
      body: JSON.stringify({ channelId, userId: user?.id }),
    });
  };

  return (
    <div className="flex h-full flex-row">
      {loading && <Loader />}
      <div className="grow-0 border border-black bg-white">
        {circles.length > 0 ? (
          <UserCircleList
            circles={circles}
            currentCircleId={activeCircleId}
            currentChannelId={activeChannelId}
            unreadCircles={unreadCircles}
            unreadChannels={unreadChannels}
            handleCircleClick={handleCircleClick}
            handleChannelClick={handleChannelClick}
          />
        ) : (
          <div className="p-4 text-center">No circles available</div>
        )}
      </div>
      <div className="grow content-end items-end bg-pink-50 p-4">
        <MessageBox
          userId={user?.id ?? ''}
          userName={user?.username ?? ''}
          userImage={user?.imageUrl}
          currentCircleId={activeCircleId}
          currentChannelId={activeChannelId}
          setLoading={setLoading}
        />
      </div>
    </div>
  );
};

export default DashboardIndexPage;
