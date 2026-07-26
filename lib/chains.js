import { defineChain } from "viem";

/**
 * Arc public testnet. Verified live: eth_chainId → 0x4cef52 (5042002) and the
 * wss endpoint serves newHeads subscriptions.
 *
 * Note: published sources disagree on whether the USDC gas unit is exposed with
 * 6 or 18 decimals. The Arc docs list 18, which is what wallets get here — check
 * docs.arc.io before relying on a displayed balance.
 */
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  network: "arc-testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
      webSocket: ["wss://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: { name: "Arcscan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

export const ARC_HTTP = arcTestnet.rpcUrls.default.http[0];
export const ARC_WS = arcTestnet.rpcUrls.default.webSocket[0];

/** Bridge chain key → wagmi/viem chain id (null = not an EVM chain we ship). */
export const WAGMI_CHAIN_ID = {
  arc: arcTestnet.id,
  ethereum: 1,
  base: 8453,
  arbitrum: 42161,
  robinhood: null,
  solana: null,
};

/**
 * Canonical native-USDC token addresses, used for read-only balance display.
 * On Arc, USDC is the native gas token, so there is no ERC-20 to read.
 */
export const USDC_ADDRESS = {
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
};
