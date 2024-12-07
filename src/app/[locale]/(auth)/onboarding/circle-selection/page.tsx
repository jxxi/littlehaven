import { getTranslations } from 'next-intl/server';

import { CircleList } from '@/features/circle/CircleList';

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

const CircleSelectionPage = () => (
  <div className="flex min-h-screen items-center justify-center">
    <CircleList />
  </div>
);

export const dynamic = 'force-dynamic';

export default CircleSelectionPage;
