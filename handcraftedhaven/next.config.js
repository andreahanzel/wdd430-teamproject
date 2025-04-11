const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
   // disablePostcssPresetEnv: true, // Disables strict CSS validation
   // optimizeCss: true, // Better CSS processing
  },
  webpack: (config) => {
    // Block chrome-extension fonts
    config.module.rules.push({
      test: /chrome-extension.*\.woff2$/,
      type: 'javascript/auto',
      use: {
        loader: 'null-loader',
      },
    });

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  }
};

module.exports = nextConfig;