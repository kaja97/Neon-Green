import withPWAInit from 'next-pwa';
import defaultRuntimeCaching from 'next-pwa/cache.js';

/** @type {import('next').NextConfig} */
const nextConfig = {};

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  // API responses are authenticated and change frequently. Never serve them
  // from the service-worker cache (including when the API is cross-origin).
  runtimeCaching: defaultRuntimeCaching.filter(
    ({ options }) => !['apis', 'cross-origin'].includes(options?.cacheName)
  ),
});

export default withPWA(nextConfig);
