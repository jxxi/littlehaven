'use client';

import CircleSelectionModal from '@/features/circle/CircleSelectionModal';

const CircleSelectionPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <CircleSelectionModal />
    </div>
  );
};

export const dynamic = 'force-dynamic';

export default CircleSelectionPage;
