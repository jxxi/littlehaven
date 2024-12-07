import { useTranslations } from 'next-intl';

import { TitleBar } from '@/features/dashboard/TitleBar';

const CircleProfilePage = () => {
  const t = useTranslations('CircleProfile');

  return (
    <TitleBar title={t('title_bar')} description={t('title_bar_description')} />
  );
};

export default CircleProfilePage;
