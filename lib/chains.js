import { arcTestnet } from "viem/chains";

/**
 * Arc public testnet. Viem ships the canonical definition, including chain id
 * 5042002 and USDC with 18 decimals.
 */
export { arcTestnet };

export const ARC_HTTP = arcTestnet.rpcUrls.default.http[0];
export const ARC_WS = arcTestnet.rpcUrls.default.webSocket[0];

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
