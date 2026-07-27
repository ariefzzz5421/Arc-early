# Arc Early

Independent early-user tooling for **Arc**, Circle's EVM Layer 1 for stablecoin finance (USDC is the native gas token).

Not affiliated with Circle.

## Pages

| Route | What it does |
| --- | --- |
| `/` | Dashboard — network status tiles, tool cards, top pairs, latest updates, ecosystem spotlight |
| `/screener` | Token screener: sortable columns, category/liquidity filters, risk flags, sparklines |
| `/bridge` | Testnet USDC planner across Arc Testnet, Ethereum Sepolia, Base Sepolia, Arbitrum Sepolia and Solana Devnet |
| `/updates` | Mainnet watch — dated, source-linked Arc milestones with tag filters |
| `/ecosystem` | Directory of projects building on Arc, with RadarDex featured |
| `/network` | Chain IDs, RPC/explorer/faucet, add-to-wallet, mainnet status |

The dashboard and `/network` carry a **live chain-head panel** streaming Arc testnet blocks over websocket.

## Run it

```bash
npm run dev
```

Then open http://localhost:3000. `npm run build && npm start` for production.

Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (free from [cloud.reown.com](https://cloud.reown.com)) if you want WalletConnect, MetaMask-mobile and Rainbow in the wallet list. Without it the site still runs — [`lib/wagmi.js`](lib/wagmi.js) ships only the connectors that work standalone (browser-injected + Coinbase Wallet) rather than rendering options that are guaranteed to fail.

## Stack

Next.js 15 (App Router, JavaScript), RainbowKit 2 + wagmi 2 + viem, plain CSS for everything else — no UI or chart libraries. Logos (Arc, USDC, RadarDex) are inline SVG in `components/Logos.jsx`; `app/icon.svg` is the favicon.

## Wallet + websocket

- [`lib/chains.js`](lib/chains.js) defines Arc testnet for viem/wagmi — chain id `5042002`, USDC as native currency, HTTP **and** `wss://` RPC, Arcscan explorer.
- [`lib/wagmi.js`](lib/wagmi.js) builds the wagmi config. Arc's transport is `fallback([webSocket(...), http(...)])`, so RPC reads ride the socket and drop to HTTP if it can't be opened.
- [`components/Providers.jsx`](components/Providers.jsx) wraps the app in `WagmiProvider` → `QueryClientProvider` → `RainbowKitProvider` (dark theme, USDC-blue accent, Arc as `initialChain`).
- [`lib/useArcLive.js`](lib/useArcLive.js) is the live feed: `watchBlocks` over the websocket (`eth_subscribe` → `newHeads`), with a one-shot fallback to 2s HTTP polling if the socket errors. It derives block interval, tx/s, gas-used ratio and gas price, and reports which transport is actually in use — the UI badge says `live · websocket` or `live · polling`, never both.
- `<ConnectButton />` sits in the header and on the bridge; `/network` uses wagmi's `switchChain`, which asks the wallet to add Arc when it doesn't know the network.
- Balances shown on the bridge are read-only: native USDC on Arc, ERC-20 USDC on Ethereum/Base/Arbitrum via the addresses in `lib/chains.js`.

## Data

All content lives in [`lib/data.js`](lib/data.js):

- `ARC_NETWORKS` — testnet parameters (chain ID 5042002, `rpc.testnet.arc.network`, `testnet.arcscan.app`) and mainnet status. Public Testnet is the current active network; mainnet phases remain upcoming.
- `CHAINS` / `ROUTERS` / `quote()` — the testnet-only bridge model. It keeps Arc Testnet paired with Sepolia/Devnet destinations supported by Circle CCTP and never mixes testnet with mainnet funds.
- `TOKENS` — **sample** screener rows. Arc mainnet has no public price feed yet, so these exist to exercise the UI. Replace with a fetch against an Arc indexer or the RadarDex API keeping this shape: `{ symbol, name, kind, price, change24h, volume24h, liquidity, fdv, holders, ageHours, audit, pool, spark[] }`.
- `ECOSYSTEM` — project directory. `UPDATES` — dated entries, each with a source link.

## Caveats worth keeping

- The bridge **plans testnet routes only**. It never holds funds, builds calldata, or signs anything; the review action links to Circle's supported-chain documentation. Everything wallet-related is read-only — the app reads addresses and balances and can ask the wallet to switch/add a network, which the wallet still prompts on. No `sendTransaction` or `signMessage` call exists anywhere in the codebase.
- Arc's official wallet setup specifies 18 decimals for native USDC. Some wallets may still label the gas token as ETH even though the underlying token is USDC.
- Arc mainnet parameters are not public. Treat any claimed mainnet endpoint or bridge as unsafe until the official Arc documentation publishes it.
