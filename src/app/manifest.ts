import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Language Buddy',
    short_name: 'Language Buddy',
    start_url: '/',
    display: 'standalone',
    background_color: '#eff6fd', // --color-bg-page
    theme_color: '#eff6fd', // --color-bg-page
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
