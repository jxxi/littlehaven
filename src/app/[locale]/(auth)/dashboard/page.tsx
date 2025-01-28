'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { UserCircleList } from '@/features/circle/UserCircleList';
import { MessageBox } from '@/features/dashboard/MessageBox';

const DashboardIndexPage = () => {
  const { user } = useUser();
  const [circles, setCircles] = useState<any[]>([]);
  const [activeCircleId, setActiveCircleId] = useState<string>();
  const [activeChannelId, setActiveChannelId] = useState<string>();

  useEffect(() => {
    const fetchCircles = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/circles/user?id=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch circles');

        const data = await response.json();
        setCircles(data);
        if (data.circles.length > 0) {
          setActiveCircleId(data.circles[0]);
          setActiveChannelId('0');
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
