'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

import { UserCircleList } from '@/features/circle/UserCircleList';
import { MessageBox } from '@/features/dashboard/MessageBox';

const DashboardIndexPage = () => {
  const { user } = useUser();
  const [circles, setCircles] = useState<any[]>([]); // Adjust type as necessary
  const [activeCircleId] = useState<string>();

  useEffect(() => {
    const fetchCircles = async () => {
      if (user) {
        const response = await fetch(`/api/circles?userId=${user.id}`);
        const data = await response.json();
        setCircles(data);
      }
    };

    fetchCircles();
  }, [user]); // Add user as a dependency

  return (
    <div className="flex h-full flex-row">
      <div className="h-full grow-0 bg-white">
        <UserCircleList circles={circles} />
      </div>
      <div className="grow content-end items-end bg-gray-800 p-4">
        <MessageBox
          userId={user?.id ?? ''}
          currentCircleId={activeCircleId ?? ''}
        />
      </div>
    </div>
  );
};

export default DashboardIndexPage;
