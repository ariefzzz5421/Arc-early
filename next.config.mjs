/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep tracing scoped to this checkout when a parent directory also has a
  // lockfile. This prevents local and Vercel builds from selecting the wrong
  // workspace root.
  outputFileTracingRoot: process.cwd(),
  webpack: (config) => {
    // Optional deps pulled in by the WalletConnect / MetaMask SDK chain that we
    // don't ship — declaring them external keeps the bundle and logs clean.
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // RainbowKit → wagmi/connectors → @base-org/account → @coinbase/cdp-sdk
    // reaches for the x402 payment packages, which are optional peers we never
    // call. Resolve them to empty modules so the bundle can build.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@x402/core": false,
      "@x402/evm": false,
      "@x402/svm": false,
      "@x402/sui": false,
      // MetaMask's browser bundle probes this React Native-only optional peer.
      // The web app never uses it, so resolving it to an empty module removes a
      // noisy build warning without shipping an unnecessary mobile dependency.
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
};

export default nextConfig;
