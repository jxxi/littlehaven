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
  };
}

export default function DashboardLayout(props: { children: React.ReactNode }) {
  const t = useTranslations('DashboardLayout');

  return (
    <div className="h-screen shadow-md">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-3 py-4">
        <DashboardHeader
          menu={[
            {
              href: '/dashboard',
              label: t('home'),
            },
            {
              href: '/dashboard/circle-profile/circle-members',
              label: t('members'),
            },
            {
              href: '/dashboard/circle-profile',
              label: t('settings'),
            },
          ]}
        />
      </div>

      <div className="h-[calc(100vh-64px)] flex-1 border border-black bg-muted p-4">
        <div className="h-full">{props.children}</div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
