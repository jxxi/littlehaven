'use client';

import { UserCircleList } from '@/features/circle/UserCircleList';
import { MessageBox } from '@/features/dashboard/MessageBox';

const DashboardIndexPage = () => {
  return (
    <div className="flex h-full flex-row">
      <div className="h-full grow-0 bg-white">
        <UserCircleList />
      </div>
      <div className="grow content-end items-end bg-gray-800 p-4">
        <MessageBox />
      </div>
    </div>
  );
};

export default DashboardIndexPage;
