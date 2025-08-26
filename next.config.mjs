/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies, import/extensions */
import { fileURLToPath } from 'node:url';

import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createJiti from 'jiti';
import withNextIntl from 'next-intl/plugin';

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti('./src/libs/Env');

const withNextIntlConfig = withNextIntl('./src/libs/i18n.ts');

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.tenor.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
  eslint: {
    dirs: ['.'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@electric-sql/pglite'],
  },
  webpack: (config, { dev }) => {
    // Configure source maps
    if (dev) {
      config.devtool = 'eval-source-map';

      // Optimize webpack cache for large strings
      config.cache = {
        ...config.cache,
        compression: 'gzip',
        maxMemoryGenerations: 1,
        // Reduce cache size to avoid serialization issues
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      };

      // Optimize for development performance
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }

    // Handle Node.js modules that don't exist in Edge Runtime
    config.resolve.fallback = {
      ...config.resolve.fallback,
      worker_threads: false,
      fs: false,
      net: false,
      tls: false,
    };

    // Optimize module resolution for locale files
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
      include: /locales/,
    });

    // Ignore source map warnings for dynamic files
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Could not auto-detect referenced sourcemap/,
      /Failed to parse source map/,
    ];

    return config;
  },
};

const sentryWebpackPluginOptions = {
  silent: !process.env.CI,
  org: 'little-haven',
  project: 'javascript-nextjs',
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  disableLogger: true,
  automaticVercelMonitors: true,
};

export default withSentryConfig(
  withNextIntlConfig(bundleAnalyzer(nextConfig)),
  sentryWebpackPluginOptions,
);
