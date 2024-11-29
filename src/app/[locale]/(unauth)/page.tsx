import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border-2 border-black bg-white p-4 shadow-md">
      <h2 className="mb-2 text-lg font-semibold text-gray-800">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function IndexPage(props: { params: { locale: string } }) {
  unstable_setRequestLocale(props.params.locale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-pink-100 to-blue-100 p-4">
      <div className="text-center">
        <h1 className="mb-6 border-b-4 border-black pb-2 text-4xl font-bold text-gray-800">
          Baby Bumpers
        </h1>
        <p className="mb-8 text-xl text-gray-700">
          Your lifelong community for the journey of parenthood
        </p>
        <div className="mb-12 space-y-6">
          <Feature
            title="Matched by Due Date"
            description="Connect with parents-to-be at the same stage of pregnancy"
          />
          <Feature
            title="Grow Together"
            description="Share milestones as your babies develop side by side"
          />
          <Feature
            title="Lifelong Support"
            description="From first kicks to first steps and beyond"
          />
        </div>
        <Link
          href="/sign-up"
          className="inline-flex items-center rounded-full bg-black px-6 py-2 text-lg font-semibold text-white transition duration-300 hover:bg-gray-800"
        >
          Join Your Bump Buddies
          <ArrowRightIcon className="ml-2 size-5" />
        </Link>
      </div>
    </main>
  );
}
