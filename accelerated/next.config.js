/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    // Lint these directories during builds
    dirs: ['app', 'components', 'hooks', 'lib', 'types'],
  },
  images: {
    unoptimized: true, // Required for static export
  },
};

module.exports = nextConfig;
