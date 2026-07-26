"use client";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  rainbowWallet,
  coinbaseWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, fallback, http, webSocket } from "wagmi";
import { mainnet, base, arbitrum } from "wagmi/chains";
import { arcTestnet, ARC_HTTP, ARC_WS } from "./chains";

/**
 * WalletConnect-backed wallets need a project id (free, from cloud.reown.com).
 * Without one we ship only the connectors that work standalone, so the app never
 * renders a wallet option that is guaranteed to fail.
 */
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim();

const wallets = projectId
  ? [injectedWallet, metaMaskWallet, rainbowWallet, coinbaseWallet, walletConnectWallet]
  : [injectedWallet, coinbaseWallet];

const connectors = connectorsForWallets([{ groupName: "Connect to Arc", wallets }], {
  appName: "Arc Early",
  appDescription: "Screener, bridge router and mainnet watch for Circle's Arc L1",
  projectId: projectId ?? "",
});

export const chains = [arcTestnet, mainnet, base, arbitrum];

export const wagmiConfig = createConfig({
  connectors,
  chains,
  // Arc prefers the websocket transport and falls back to HTTP if the socket
  // cannot be established (corporate proxies, offline dev, etc).
  transports: {
    [arcTestnet.id]: fallback([
      webSocket(ARC_WS, { retryCount: 3, reconnect: { attempts: 10, delay: 2000 } }),
      http(ARC_HTTP),
    ]),
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: true,
});

export const hasWalletConnect = Boolean(projectId);
