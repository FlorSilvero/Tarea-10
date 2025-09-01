// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // books.google.com
      { protocol: 'https', hostname: 'books.google.com', pathname: '/books/content*' },
      { protocol: 'https', hostname: 'books.google.com', pathname: '/books/publisher/content*' },
      { protocol: 'http',  hostname: 'books.google.com', pathname: '/books/content*' },
      { protocol: 'http',  hostname: 'books.google.com', pathname: '/books/publisher/content*' },

      // books.googleusercontent.com
      { protocol: 'https', hostname: 'books.googleusercontent.com', pathname: '/books/content*' },
      { protocol: 'http',  hostname: 'books.googleusercontent.com', pathname: '/books/content*' },
    ],
  },

  // Si querés: para compilar aunque haya errores de ESLint
   eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;