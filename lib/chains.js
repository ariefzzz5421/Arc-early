import { arcTestnet } from "viem/chains";

/**
 * Arc public testnet. Viem ships the canonical definition, including chain id
 * 5042002 and USDC with 18 decimals.
 */
export { arcTestnet };

const httpOverride = process.env.NEXT_PUBLIC_ARC_RPC_HTTP?.trim();
const wsOverride = process.env.NEXT_PUBLIC_ARC_RPC_WS?.trim();

const isHttpUrl = (value) => /^https?:\/\/\S+$/i.test(value || "");
const isWsUrl = (value) => /^wss?:\/\/\S+$/i.test(value || "");

/**
 * RPC endpoints. Both default to the public Arc testnet URLs shipped by viem and
 * can be pointed at a dedicated provider (Alchemy, QuickNode, a private node) via
 * NEXT_PUBLIC_ARC_RPC_HTTP / NEXT_PUBLIC_ARC_RPC_WS. The wallet tracker leans on
 * the websocket for head subscriptions, so a rate-limited public endpoint is the
 * first thing to replace when the stream starts dropping.
 */
export const ARC_HTTP = isHttpUrl(httpOverride) ? httpOverride : arcTestnet.rpcUrls.default.http[0];
export const ARC_WS = isWsUrl(wsOverride) ? wsOverride : arcTestnet.rpcUrls.default.webSocket[0];

/** Fallback HTTP endpoints, used when the primary one errors out. */
export const ARC_HTTP_FALLBACKS = arcTestnet.rpcUrls.default.http.filter((url) => url !== ARC_HTTP);

/** True when the endpoints in use are the shared public ones (no key configured). */
export const ARC_RPC_IS_PUBLIC = !isHttpUrl(httpOverride) && !isWsUrl(wsOverride);

/** Block explorer base URL for the network the app is currently reading. */
export const ARC_EXPLORER = arcTestnet.blockExplorers.default.url;

/** Bridge chain key → wagmi/viem chain id (null = not an EVM chain we ship). */
export const WAGMI_CHAIN_ID = {
  arc: arcTestnet.id,
  ethereum: 11155111,
  base: 84532,
  arbitrum: 421614,
  solana: null,
};

/**
 * Canonical native-USDC token addresses, used for read-only balance display.
 * On Arc, USDC is the native gas token, so there is no ERC-20 to read.
 */
export const USDC_ADDRESS = {
  ethereum: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  base: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  arbitrum: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
};
