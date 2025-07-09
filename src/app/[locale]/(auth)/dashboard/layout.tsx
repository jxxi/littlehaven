import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { DashboardHeader } from '@/features/dashboard/DashboardHeader';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Dashboard',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    icons: [{ rel: 'icon', url: '/favicon.svg' }],
  };
}

export default function DashboardLayout(props: { children: React.ReactNode }) {
  const t = useTranslations('DashboardLayout');

  return (
    <div className="flex h-fit w-full flex-col overflow-hidden bg-gray-50">
      {/* Header */}
      <header className="flex w-full bg-white/90 px-3 py-4">
        <div className="flex w-full items-center justify-between">
          <DashboardHeader
            menu={[{ href: '/dashboard/search', label: t('search') }]}
          />
        </div>
      </header>
      {/* Main Content (smaller padding) */}
      <main className="flex-1 overflow-y-auto p-1">{props.children}</main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
