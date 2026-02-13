/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  dynamicStartUrl: false,
  // Exclude build manifests from precaching (Vercel doesn't serve them)
  buildExcludes: [/app-build-manifest\.json$/, /build-manifest\.json$/],
  runtimeCaching: [
    // Cache the start URL (home page) - StaleWhileRevalidate for fast offline access
    {
      urlPattern: /^\/$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'start-url',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    // Cache all HTML pages for offline navigation
    {
      urlPattern: /^https?:\/\/[^/]+\/?$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'html-pages',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 24 * 60 * 60
        }
      }
    },
    // Cache Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
        }
      }
    },
    // Cache font files
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    // Cache images
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    // Cache Next.js static files
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    // Cache JavaScript files
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
        }
      }
    },
    // Cache CSS files
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },
    // Cache Next.js data - use StaleWhileRevalidate for offline access
    {
      urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-data',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    // Cache all other requests - StaleWhileRevalidate for better offline experience
    {
      urlPattern: /.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'others',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    }
  ]
});

const nextConfig = {
  // Only use basePath for GitHub Pages production builds
  ...(process.env.GITHUB_ACTIONS && {
    output: 'export',
    basePath: '/CRITICALCARECALCULATOR',
    trailingSlash: true,
  }),
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: true,
    },
  }),
}

module.exports = withPWA(nextConfig)
