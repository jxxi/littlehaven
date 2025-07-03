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
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      {/* Header */}
      <header className="flex w-full bg-white/90 px-3 py-4 shadow-sm">
        <div className="flex w-full max-w-7xl items-center justify-between">
          <DashboardHeader
            menu={[{ href: '/dashboard/search', label: t('search') }]}
          />
        </div>
      </header>
      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-6">
        {props.children}
      </main>
    </div>
  );
}

export const dynamic = 'force-dynamic';
