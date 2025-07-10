import '@/styles/global.css';

import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';

import { AllLocales } from '@/utils/AppConfig';

export const metadata: Metadata = {
  icons: [
    {
      rel: 'icon',
      url: '/favicon.svg',
    },
  ],
};

export function generateStaticParams() {
  return AllLocales.map((locale) => ({ locale }));
}

export default function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  unstable_setRequestLocale(props.params.locale);

  // Using internationalization in Client Components
  const messages = useMessages();

  return (
    <html lang={props.params.locale}>
      <body className="bg-gradient-to-br from-slate-100 to-slate-200 font-sans text-gray-700 antialiased">
        <ClerkProvider>
          <NextIntlClientProvider
            locale={props.params.locale}
            messages={messages}
          >
            {props.children}
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
