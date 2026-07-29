# Arc Early

Independent early-user tooling for **Arc**, Circle's EVM Layer 1 for stablecoin finance (USDC is the native gas token).

Not affiliated with Circle.

## Pages

| Route | What it does |
| --- | --- |
| `/` | Dashboard — network status tiles, tool cards, top pairs, latest updates, ecosystem spotlight |
| `/screener` | Token screener: sortable columns, category/liquidity filters, risk flags, sparklines |
| `/memecoins` | Live community-token market data from the API used by RadarDex |
| `/wallets` | Whale/trader wallet tracker — live balances, all-time tx counts and per-block activity matching |
| `/bridge` | Live Circle Gateway route check — is Arc mainnet a published route yet, and through which contracts |
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

Next.js 15 (App Router, JavaScript), RainbowKit 2 + wagmi 2 + viem, plain CSS for everything else — no UI or chart libraries. The supplied Arc and USDC images live in `public/brand`; official ecosystem marks are stored locally in `public/ecosystem`.

## Wallet + websocket

- [`lib/chains.js`](lib/chains.js) defines Arc testnet for viem/wagmi — chain id `5042002`, USDC as native currency, HTTP **and** `wss://` RPC, Arcscan explorer.
- [`lib/wagmi.js`](lib/wagmi.js) builds the wagmi config. Arc's transport is `fallback([webSocket(...), http(...)])`, so RPC reads ride the socket and drop to HTTP if it can't be opened.
- [`components/Providers.jsx`](components/Providers.jsx) wraps the app in `WagmiProvider` → `QueryClientProvider` → `RainbowKitProvider` (dark theme, USDC-blue accent, Arc as `initialChain`).
- [`lib/useArcLive.js`](lib/useArcLive.js) is the live feed: `watchBlocks` over the websocket (`eth_subscribe` → `newHeads`), with a one-shot fallback to 2s HTTP polling if the socket errors. It derives block interval, tx/s, gas-used ratio and gas price, and reports which transport is actually in use — the UI badge says `live · websocket` or `live · polling`, never both.
- [`lib/useWalletTracker.js`](lib/useWalletTracker.js) powers `/wallets`. It subscribes to `newHeads` **with full transaction bodies** and matches every transaction's `from`/`to` against the tracked address set, so activity is counted as it lands instead of being polled after the fact. Blocks are de-duplicated by number (the HTTP fallback re-emits on restart), balances and all-time nonces come from a separate batched HTTP client refreshed every 15s, and no BigInt reaches React state.
- RPC endpoints are overridable: set `NEXT_PUBLIC_ARC_RPC_HTTP` / `NEXT_PUBLIC_ARC_RPC_WS` in `.env.local` to point the tracker at a dedicated provider. Both default to Arc's shared public testnet endpoints and are ignored unless they carry an `http(s)://` / `ws(s)://` scheme. The tracker's footer says when it is running on the public endpoint.
- `<ConnectButton />` sits in the header; `/network` uses wagmi's `switchChain`, which asks the wallet to add Arc when it doesn't know the network.
- The bridge page has no wallet or transaction action until Arc publishes mainnet parameters and Circle lists a production CCTP route.

## Data

Static reference content lives in [`lib/data.js`](lib/data.js); the RadarDex feed is fetched at runtime:

- `ARC_NETWORKS` — testnet parameters (chain ID 5042002, `rpc.testnet.arc.network`, `testnet.arcscan.app`) and mainnet status. Public Testnet is the current active network; mainnet phases remain upcoming.
- `lib/radardex.js` — bounded, normalized access to the live token feed used by radardex.io.
- `/api/radardex/memecoins` — same-origin proxy with a timeout, schema checks and an explicit unavailable state.
- `lib/gateway.js` — reads Circle's Gateway `/v1/info` for **both** mainnet and testnet and reports whether Arc is a published route. Contract addresses and domain ids are never hardcoded: they are whatever Circle serves, so the bridge cannot be pointed at an address this repo invented. `/api/gateway/routes` is the same-origin proxy (5-minute cache, 503 + explicit unavailable state on failure).
- The check drives the whole `/bridge` page. If Circle lists Arc on the production API, the verdict card flips to **route open** and surfaces Circle's own wallet/minter addresses; until then it stays closed. If the API can't be reached it fails closed rather than falling back to a cached or assumed list.
- `TOKENS` — **sample** screener rows. Arc mainnet has no public price feed yet, so these exist to exercise the UI. Replace with a fetch against an Arc indexer or the RadarDex API keeping this shape: `{ symbol, name, kind, price, change24h, volume24h, liquidity, fdv, holders, ageHours, audit, pool, spark[] }`.
- `ECOSYSTEM` — project directory. `UPDATES` — dated entries, each with a source link.

## Caveats worth keeping

- The bridge is **Coming Soon** and read-only. It never holds funds, builds calldata, asks for a signature or displays simulated route quotes. The gate is not a hardcoded flag — it is Circle's own published route list, so the page opens on its own the day Arc appears there and cannot be opened early by editing a constant in this repo.
- Arc mainnet parameters circulate informally well before launch. A chain ID or RPC that does not appear in Circle's Gateway list or Arc's official docs has not been published, regardless of who is sharing it — approving a USDC allowance against an unverified GatewayWallet is the standard way funds get drained. `/bridge` shows the verified list precisely so it can be compared against whatever someone hands you.
- RadarDex rows are live third-party data. Names, symbols, icons, prices and liquidity are not treated as verified; the UI warns users to verify contracts and never substitutes sample values when the upstream feed is unavailable.
- `/wallets` ships four seeded whale/trader addresses taken from RadarDex profiles. The **Reported** column is the portfolio size quoted on that profile — a third-party reference kept in its own column, never summed with the on-chain balance, because RadarDex labels its market as Arc mainnet while the app reads Arc's public testnet. Wallets added in the UI are stored in `localStorage` only.
- Arc's official wallet setup specifies 18 decimals for native USDC. Some wallets may still label the gas token as ETH even though the underlying token is USDC.
- Arc mainnet parameters are not public. Treat any claimed mainnet endpoint or bridge as unsafe until the official Arc documentation publishes it.
