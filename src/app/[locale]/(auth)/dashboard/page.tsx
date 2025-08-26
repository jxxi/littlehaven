'use client';

import { useUser } from '@clerk/nextjs';
import Pusher from 'pusher-js';
import { useEffect, useState } from 'react';

import BrandLoader from '@/components/BrandLoader';
import type { Circle } from '@/features/circle/types';
import { UserCircleList } from '@/features/circle/UserCircleList';
import { ChatPanel } from '@/features/dashboard/ChatPanel';
import { Env } from '@/libs/Env';
import { logError } from '@/utils/Logger';

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
        setLoading(true);
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
        } else {
          setCircles([]);
        }
      } catch (error) {
        logError('Error in dashboard page - fetchCircles', error);
        setCircles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCircles();
  }, [user]); // Only run when user changes

  useEffect(() => {}, [circles, activeCircleId]);

  useEffect((): (() => void) => {
    if (!user) return () => {};

    // Check if Pusher is configured
    if (!Env.NEXT_PUBLIC_PUSHER_KEY || !Env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      logError('Pusher configuration missing', {
        key: !!Env.NEXT_PUBLIC_PUSHER_KEY,
        cluster: !!Env.NEXT_PUBLIC_PUSHER_CLUSTER,
      });
      return () => {};
    }

    const pusher = new Pusher(Env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: Env.NEXT_PUBLIC_PUSHER_CLUSTER,
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

    // Find the circle and select its first channel
    const selectedCircle = circles.find(
      (circle) => circle.circleId === circleId,
    );
    if (selectedCircle?.channels && selectedCircle.channels.length > 0) {
      setActiveChannelId(selectedCircle.channels[0]?.channelId);
    }

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

  const renderSidebarContent = () => {
    if (loading) return <BrandLoader />;
    if (circles.length > 0) {
      return (
        <UserCircleList
          circles={circles}
          currentCircleId={activeCircleId}
          currentChannelId={activeChannelId}
          unreadCircles={unreadCircles}
          unreadChannels={unreadChannels}
          handleCircleClick={handleCircleClick}
          handleChannelClick={handleChannelClick}
        />
      );
    }
    return (
      <div className="p-4 text-center text-gray-400">No circles available</div>
    );
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 p-6">
      <div className="flex h-[96vh] w-[98vw] max-w-[1800px] overflow-hidden rounded-2xl bg-cream shadow-2xl">
        {/* Sidebar */}
        <div className="flex h-full w-72 flex-col border-r border-warmth-orange bg-cream p-6">
          {renderSidebarContent()}
        </div>
        {/* Chat Panel */}
        <div className="flex h-full flex-1 flex-col bg-white/70 p-8">
          <ChatPanel
            userId={user?.id ?? ''}
            userName={user?.username ?? ''}
            userImage={user?.imageUrl}
            currentCircleId={activeCircleId}
            currentChannelId={activeChannelId}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardIndexPage;
