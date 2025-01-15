import { Channels } from '@/features/dashboard/Channels';
import { MessageBox } from '@/features/dashboard/MessageBox';

const DashboardIndexPage = () => {
  const channels = [
    { id: '1', name: 'baby-pics' },
    { id: '2', name: 'general' },
    { id: '3', name: 'games' },
  ];

  return (
    <div className="flex h-full flex-row">
      <div className="grow-0 bg-gray-800 p-4">
        <Channels channels={channels} />
      </div>
      <div className="grow content-end items-end bg-gray-800 p-4">
        <MessageBox />
      </div>
    </div>
  );
};

export default DashboardIndexPage;
