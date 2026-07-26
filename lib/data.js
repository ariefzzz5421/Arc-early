/**
 * Static reference data for Arc Early.
 *
 * Everything here is either (a) published network/ecosystem information with a
 * source link, or (b) clearly-flagged sample market data used to drive the
 * screener UI until a live Arc indexer endpoint is wired into lib/market.js.
 */

export const SITE = {
  name: "Arc Early",
  tagline: "Screener, bridge router and mainnet watch for Circle's Arc L1.",
  updated: "2026-07-26",
};

/* ------------------------------------------------------------------ */
/* Networks                                                            */
/* ------------------------------------------------------------------ */

export const ARC_NETWORKS = {
  mainnet: {
    key: "arc-mainnet",
    label: "Arc Mainnet",
    status: "pending", // beta launch window: summer 2026
    chainId: null,
    rpc: null,
    explorer: null,
    gasToken: "USDC",
    note: "Mainnet beta parameters are not published yet. Any site handing out an 'Arc mainnet' RPC or bridge today should be treated as a scam.",
  },
  testnet: {
    key: "arc-testnet",
    label: "Arc Testnet (public)",
    status: "live",
    chainId: 5042002,
    chainIdHex: "0x4CEF52",
    rpc: "https://rpc.testnet.arc.network",
    ws: "wss://rpc.testnet.arc.network",
    explorer: "https://testnet.arcscan.app",
    faucet: "https://faucet.circle.com",
    gasToken: "USDC",
    blockTime: "~2s",
    consensus: "Malachite (Tendermint BFT), sub-second finality",
  },
};

/* ------------------------------------------------------------------ */
/* Bridge — chains and routers                                         */
/* ------------------------------------------------------------------ */

export const CHAINS = [
  {
    key: "arc",
    name: "Arc",
    short: "ARC",
    color: "#0b2547",
    chainId: 5042002,
    env: "testnet",
    kind: "L1",
    gas: "USDC",
    routers: ["cctp-fast", "cctp-standard", "arc-native"],
    note: "Circle's stablecoin L1. Mainnet beta pending — routes below quote against testnet/announced parameters.",
  },
  {
    key: "ethereum",
    name: "Ethereum",
    short: "ETH",
    color: "#627eea",
    chainId: 1,
    env: "mainnet",
    kind: "L1",
    gas: "ETH",
    routers: ["cctp-fast", "cctp-standard", "arc-native", "stargate"],
  },
  {
    key: "base",
    name: "Base",
    short: "BASE",
    color: "#0052ff",
    chainId: 8453,
    env: "mainnet",
    kind: "L2 · OP Stack",
    gas: "ETH",
    routers: ["cctp-fast", "cctp-standard", "stargate", "across"],
  },
  {
    key: "robinhood",
    name: "Robinhood Chain",
    short: "RHC",
    color: "#00c805",
    chainId: null,
    env: "mainnet",
    kind: "L2 · Arbitrum Orbit",
    gas: "ETH",
    routers: ["orbit-canonical", "stargate"],
    note: "Robinhood's tokenized-equity chain is built on Arbitrum Orbit, so Arc ⇄ RHC settles in two legs via Arbitrum.",
  },
  {
    key: "arbitrum",
    name: "Arbitrum One",
    short: "ARB",
    color: "#2d374b",
    chainId: 42161,
    env: "mainnet",
    kind: "L2 · Rollup",
    gas: "ETH",
    routers: ["cctp-fast", "cctp-standard", "stargate", "across"],
  },
  {
    key: "solana",
    name: "Solana",
    short: "SOL",
    color: "#14f195",
    chainId: null,
    env: "mainnet",
    kind: "L1",
    gas: "SOL",
    routers: ["cctp-fast", "cctp-standard"],
  },
];

export const chainByKey = (key) => CHAINS.find((c) => c.key === key);

/**
 * Router models. `bps` + `flat` drive the quote; `etaSec` drives the ETA.
 * Figures are published/observed averages and are shown as estimates in the UI.
 */
export const ROUTERS = {
  "cctp-fast": {
    key: "cctp-fast",
    name: "Circle CCTP V2 — Fast",
    kind: "Native burn & mint",
    bps: 1,
    flat: 0,
    etaSec: 30,
    trust: "Circle attestation (Iris)",
    blurb: "Burns native USDC on the source chain and mints native USDC on the destination. No wrapped assets, no third-party liquidity.",
    link: "https://developers.circle.com/cctp",
  },
  "cctp-standard": {
    key: "cctp-standard",
    name: "Circle CCTP V2 — Standard",
    kind: "Native burn & mint",
    bps: 0,
    flat: 0,
    etaSec: 900,
    trust: "Circle attestation (Iris)",
    blurb: "Same path as Fast but waits for hard finality on the source chain. Zero protocol fee — you only pay gas.",
    link: "https://developers.circle.com/cctp",
  },
  "arc-native": {
    key: "arc-native",
    name: "Arc Native Bridge",
    kind: "Canonical",
    bps: 0,
    flat: 0.25,
    etaSec: 240,
    trust: "Arc validator set",
    blurb: "Canonical deposit path into Arc. Gas on Arc is denominated in USDC, so the destination fee is dollar-priced.",
    link: "https://docs.arc.io",
  },
  stargate: {
    key: "stargate",
    name: "Stargate (LayerZero)",
    kind: "Liquidity pool",
    bps: 6,
    flat: 0,
    etaSec: 90,
    trust: "LayerZero DVNs",
    blurb: "Unified liquidity pools with instant guaranteed finality. Useful when a chain is not a CCTP domain.",
    link: "https://stargate.finance",
  },
  across: {
    key: "across",
    name: "Across",
    kind: "Intent / relayer",
    bps: 8,
    flat: 0,
    etaSec: 60,
    trust: "UMA optimistic oracle",
    blurb: "Relayers front the funds on the destination chain and are repaid from the source escrow.",
    link: "https://across.to",
  },
  "orbit-canonical": {
    key: "orbit-canonical",
    name: "Orbit Canonical (via Arbitrum)",
    kind: "Two-leg canonical",
    bps: 2,
    flat: 0.4,
    etaSec: 1200,
    trust: "Arbitrum + Orbit bridge",
    blurb: "Settles Arc ⇄ Arbitrum with CCTP, then Arbitrum ⇄ Robinhood Chain over the Orbit canonical bridge.",
    link: "https://docs.arbitrum.io/launch-orbit-chain/orbit-quickstart",
  },
};

/** Routers usable for a given pair = intersection of both chains' support. */
export function routersFor(fromKey, toKey) {
  const a = chainByKey(fromKey);
  const b = chainByKey(toKey);
  if (!a || !b || a.key === b.key) return [];
  const shared = a.routers.filter((r) => b.routers.includes(r));
  // Robinhood Chain is not a CCTP domain: it always needs the two-leg path.
  if (a.key === "robinhood" || b.key === "robinhood") {
    if (!shared.includes("orbit-canonical")) shared.push("orbit-canonical");
  }
  return shared.map((k) => ROUTERS[k]).filter(Boolean);
}

/** Deterministic quote for a router — no network calls, pure arithmetic. */
export function quote(router, amount, fromKey, toKey) {
  const amt = Number(amount) || 0;
  const gasEstimate = estimateGas(fromKey, toKey, router.key);
  const protocolFee = (amt * router.bps) / 10000 + router.flat;
  const out = Math.max(0, amt - protocolFee - gasEstimate);
  return {
    protocolFee,
    gasEstimate,
    totalFee: protocolFee + gasEstimate,
    out,
    etaSec: router.etaSec + (fromKey === "robinhood" || toKey === "robinhood" ? 300 : 0),
  };
}

/** Rough source-chain gas cost, expressed in USDC. */
function estimateGas(fromKey, toKey, routerKey) {
  const base = { ethereum: 3.2, base: 0.04, arbitrum: 0.05, arc: 0.01, solana: 0.002, robinhood: 0.06 };
  const src = base[fromKey] ?? 0.1;
  const dst = base[toKey] ?? 0.1;
  const multiplier = routerKey === "orbit-canonical" ? 2 : 1;
  return (src + dst * 0.35) * multiplier;
}

/* ------------------------------------------------------------------ */
/* Screener — sample market rows                                       */
/* ------------------------------------------------------------------ */

export const SCREENER_DISCLAIMER =
  "Sample data. Arc mainnet has not launched, so no live price feed exists yet — these rows exercise the screener UI and are replaced by a real indexer via lib/market.js once mainnet RPC is public.";

const spark = (seed, n = 24) => {
  const out = [];
  let v = 100;
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 1103515245 + 12345) % 2147483648;
    v = Math.max(5, v * (1 + ((s % 1000) / 1000 - 0.47) * 0.09));
    out.push(v);
  }
  return out;
};

export const TOKENS = [
  {
    symbol: "USDC",
    name: "USD Coin",
    kind: "stable",
    color: "#2775ca",
    price: 1.0,
    change24h: 0.01,
    volume24h: 41200000,
    liquidity: 88400000,
    fdv: null,
    holders: 18240,
    ageHours: 4200,
    audit: "circle",
    pool: "native gas token",
    spark: spark(11),
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    kind: "stable",
    color: "#1a5fb4",
    price: 1.09,
    change24h: -0.06,
    volume24h: 6120000,
    liquidity: 14800000,
    fdv: null,
    holders: 3110,
    ageHours: 4200,
    audit: "circle",
    pool: "Lunex StableSwap",
    spark: spark(23),
  },
  {
    symbol: "ARC",
    name: "Arc Network Token",
    kind: "infra",
    color: "#0b2547",
    price: 0.412,
    change24h: 6.4,
    volume24h: 12900000,
    liquidity: 21400000,
    fdv: 4120000000,
    holders: 9840,
    ageHours: 720,
    audit: "verified",
    pool: "Uniswap v3 · ARC/USDC",
    spark: spark(37),
  },
  {
    symbol: "RADAR",
    name: "RadarDex",
    kind: "defi",
    color: "#7b61ff",
    price: 0.0864,
    change24h: 18.2,
    volume24h: 3410000,
    liquidity: 2180000,
    fdv: 86400000,
    holders: 6420,
    ageHours: 336,
    audit: "verified",
    pool: "Uniswap v3 · RADAR/USDC",
    spark: spark(51),
  },
  {
    symbol: "TOWER",
    name: "TowerExchange",
    kind: "defi",
    color: "#3ba7c4",
    price: 0.241,
    change24h: -4.1,
    volume24h: 1980000,
    liquidity: 3320000,
    fdv: 24100000,
    holders: 2870,
    ageHours: 288,
    audit: "verified",
    pool: "Uniswap v3 · TOWER/USDC",
    spark: spark(67),
  },
  {
    symbol: "ASTRA",
    name: "AstraPump",
    kind: "defi",
    color: "#ff8a3d",
    price: 0.0129,
    change24h: 41.7,
    volume24h: 2740000,
    liquidity: 640000,
    fdv: 12900000,
    holders: 5130,
    ageHours: 96,
    audit: "unaudited",
    pool: "Uniswap v3 · ASTRA/USDC",
    spark: spark(83),
  },
  {
    symbol: "LUNEX",
    name: "Lunex",
    kind: "defi",
    color: "#9ad0ff",
    price: 0.0552,
    change24h: 2.3,
    volume24h: 890000,
    liquidity: 1450000,
    fdv: 5520000,
    holders: 1740,
    ageHours: 240,
    audit: "verified",
    pool: "Lunex StableSwap",
    spark: spark(97),
  },
  {
    symbol: "HNKL",
    name: "Hinkal Protocol",
    kind: "infra",
    color: "#6ee7b7",
    price: 0.318,
    change24h: -7.8,
    volume24h: 720000,
    liquidity: 980000,
    fdv: 31800000,
    holders: 1220,
    ageHours: 192,
    audit: "verified",
    pool: "Uniswap v3 · HNKL/USDC",
    spark: spark(113),
  },
  {
    symbol: "ORIXA",
    name: "Orixa Market",
    kind: "nft",
    color: "#f472b6",
    price: 0.0074,
    change24h: 12.9,
    volume24h: 410000,
    liquidity: 320000,
    fdv: 7400000,
    holders: 3980,
    ageHours: 120,
    audit: "unaudited",
    pool: "Uniswap v3 · ORIXA/USDC",
    spark: spark(131),
  },
  {
    symbol: "PUNKS",
    name: "Arc Punks",
    kind: "nft",
    color: "#c4b5fd",
    price: 0.00212,
    change24h: -18.4,
    volume24h: 260000,
    liquidity: 190000,
    fdv: 2120000,
    holders: 2640,
    ageHours: 168,
    audit: "unaudited",
    pool: "Uniswap v3 · PUNKS/USDC",
    spark: spark(149),
  },
  {
    symbol: "CBHFR",
    name: "CatBatHatFatRat",
    kind: "meme",
    color: "#facc15",
    price: 0.000418,
    change24h: 96.3,
    volume24h: 1120000,
    liquidity: 210000,
    fdv: 4180000,
    holders: 7410,
    ageHours: 36,
    audit: "unaudited",
    pool: "Uniswap v3 · CBHFR/USDC",
    spark: spark(167),
  },
  {
    symbol: "UNEMP",
    name: "Unemployee on Arc",
    kind: "meme",
    color: "#fb7185",
    price: 0.00009,
    change24h: -31.2,
    volume24h: 340000,
    liquidity: 74000,
    fdv: 900000,
    holders: 4120,
    ageHours: 18,
    audit: "unaudited",
    pool: "Uniswap v3 · UNEMP/USDC",
    spark: spark(181),
  },
];

export const TOKEN_KINDS = [
  { key: "all", label: "All" },
  { key: "stable", label: "Stables" },
  { key: "infra", label: "Infra" },
  { key: "defi", label: "DeFi" },
  { key: "nft", label: "NFT" },
  { key: "meme", label: "Meme" },
];

/* ------------------------------------------------------------------ */
/* Ecosystem                                                           */
/* ------------------------------------------------------------------ */

export const ECOSYSTEM = [
  {
    name: "RadarDex",
    slug: "radardex",
    category: "DEX & Launchpad",
    featured: true,
    url: "https://radardex.io/",
    color: "#7b61ff",
    blurb:
      "Token scanner, launcher and market tracker for Arc. Launches straight into Uniswap v3 on Arc — no bonding curve, no migration, pool live instantly. Formerly ArcDEXScan; rebranded July 2026.",
    tags: ["Scanner", "Uniswap v3", "Leaderboard", "Referrals"],
  },
  {
    name: "TowerExchange",
    slug: "tower",
    category: "DEX & Launchpad",
    url: "https://x.com/TowerExchange",
    color: "#3ba7c4",
    blurb: "Native stablecoin DEX aggregator for Arc with pooled liquidity routing.",
    tags: ["Aggregator", "Stableswap"],
  },
  {
    name: "AstraPump",
    slug: "astrapump",
    category: "DEX & Launchpad",
    url: "https://x.com/AstraPump",
    color: "#ff8a3d",
    blurb: "One-click token issuance and trading launchpad on Arc.",
    tags: ["Launchpad"],
  },
  {
    name: "Lunex",
    slug: "lunex",
    category: "DEX & Launchpad",
    url: "https://x.com/LunexFi",
    color: "#9ad0ff",
    blurb: "StableSwap AMM focused on USDC/EURC and FX-style stablecoin pairs.",
    tags: ["StableSwap", "FX"],
  },
  {
    name: "Hinkal Protocol",
    slug: "hinkal",
    category: "Infrastructure",
    url: "https://hinkal.pro",
    color: "#6ee7b7",
    blurb: "Privacy and confidential settlement layer for institutional flows on Arc.",
    tags: ["Privacy", "Compliance"],
  },
  {
    name: "Blockradar",
    slug: "blockradar",
    category: "Payments",
    url: "https://blockradar.co",
    color: "#38bdf8",
    blurb: "Wallet-as-a-service: non-custodial wallet creation, gasless transactions, real-time AML screening.",
    tags: ["WaaS", "AML", "Circle grant"],
  },
  {
    name: "Hurupay / Kolan",
    slug: "hurupay",
    category: "Payments",
    url: "https://hurupay.com",
    color: "#34d399",
    blurb: "Dollar accounts with USDC conversion and local-currency withdrawal in 50+ countries.",
    tags: ["Off-ramp", "Circle grant"],
  },
  {
    name: "Myaza",
    slug: "myaza",
    category: "Payments",
    url: "https://myaza.io",
    color: "#f59e0b",
    blurb: "Pan-African payment network — multi-currency wallets across 21 African currencies plus virtual cards.",
    tags: ["Cards", "Circle grant"],
  },
  {
    name: "Payrit",
    slug: "payrit",
    category: "Payments",
    url: "https://payrit.io",
    color: "#a78bfa",
    blurb: "Cross-border mobile wallet settling in USDC across EVM, Stellar and Solana.",
    tags: ["Remittance", "Circle grant"],
  },
  {
    name: "ViFi Labs",
    slug: "vifi",
    category: "Payments",
    url: "https://vifilabs.com",
    color: "#22d3ee",
    blurb: "Decentralised FX protocol for emerging-market currencies with low-slippage trading.",
    tags: ["FX", "Circle grant"],
  },
  {
    name: "Orixa",
    slug: "orixa",
    category: "NFT",
    url: "https://x.com/OrixaMarket",
    color: "#f472b6",
    blurb: "Native NFT marketplace for Arc collections.",
    tags: ["Marketplace"],
  },
  {
    name: "Arc Punks",
    slug: "arcpunks",
    category: "NFT",
    url: "https://x.com/ArcPunksNFT",
    color: "#c4b5fd",
    blurb: "Community Punks-style PFP collection, one of the earliest Arc NFT communities.",
    tags: ["PFP"],
  },
  {
    name: "ArcCitizens",
    slug: "arccitizens",
    category: "NFT",
    url: "https://x.com/ArcCitizens",
    color: "#93c5fd",
    blurb: "Community-governed identity NFT for Arc participants.",
    tags: ["Identity", "DAO"],
  },
  {
    name: "CatBatHatFatRat",
    slug: "cbhfr",
    category: "Meme",
    url: "https://x.com/CatBatHatFatRat",
    color: "#facc15",
    blurb: "Meme project with a PFP generator and an unusually loud community.",
    tags: ["Meme", "PFP"],
  },
];

export const ECO_CATEGORIES = ["All", "DEX & Launchpad", "Infrastructure", "Payments", "NFT", "Meme"];

/* ------------------------------------------------------------------ */
/* Updates                                                             */
/* ------------------------------------------------------------------ */

export const UPDATES = [
  {
    date: "2026-07",
    title: "ArcDEXScan rebrands to RadarDex",
    tag: "Ecosystem",
    tone: "info",
    body:
      "The Arc token scanner relaunched as RadarDex on radardex.io, keeping its scanner, Uniswap v3 launcher, trading leaderboard and referral rewards under a new identity.",
    source: { label: "radardex.io", url: "https://radardex.io/" },
  },
  {
    date: "2026-07",
    title: "Mainnet beta window: summer 2026",
    tag: "Mainnet",
    tone: "warn",
    body:
      "Circle's whitepaper targets an Arc mainnet beta this summer, gated on testnet results and regulatory readiness. Mainnet RPC, chain ID and canonical bridge addresses are still unpublished.",
    source: {
      label: "Circle blog",
      url: "https://www.circle.com/blog/introducing-arc-an-open-layer-1-blockchain-purpose-built-for-stablecoin-finance",
    },
  },
  {
    date: "2026-07",
    title: "Fake 'Arc Bridge' sites are circulating",
    tag: "Security",
    tone: "warn",
    body:
      "Third-party sites claiming live Arc mainnet bridging are scams — there is no mainnet bridge to use yet. Only ever connect a wallet to endpoints published by Circle in the official Arc docs.",
    source: { label: "Arc docs", url: "https://docs.arc.io" },
  },
  {
    date: "2026-05",
    title: "Testnet passes 244.1M transactions",
    tag: "Testnet",
    tone: "good",
    body:
      "Arc's public testnet had processed roughly 244.1 million transactions as of 5 May 2026, driven by institutional pilots and ecosystem launch activity.",
    source: {
      label: "Ecosystem overview",
      url: "https://www.weex.com/news/detail/mainnet-approaches-a-comprehensive-overview-of-circles-native-blockchain-arc-ecosystem-ps1qze84tjaw6asr7oknx59l",
    },
  },
  {
    date: "2026-Q1",
    title: "Circle developer grants — payments cohort",
    tag: "Ecosystem",
    tone: "info",
    body:
      "Circle's 2026 grant cohort funded payment infrastructure on Arc: Blockradar, Hurupay/Kolan, Myaza, Arrel (DAPL), Payrit, ViFi Labs, SFx Money and Flezpay.",
    source: {
      label: "Ecosystem overview",
      url: "https://www.weex.com/news/detail/overview-of-arc-ecosystem-projects-under-circle-hohy6g9r0turnf6qatn2kjia",
    },
  },
  {
    date: "2025-10-28",
    title: "Public testnet goes live",
    tag: "Testnet",
    tone: "good",
    body:
      "Arc's public testnet launched with 100+ institutions participating, including BlackRock, Visa, Goldman Sachs and HSBC. Chain ID 5042002, USDC as the native gas token, ~2s blocks.",
    source: { label: "Arc docs", url: "https://docs.arc.io/arc/references/connect-to-arc" },
  },
  {
    date: "2025-08",
    title: "Whitepaper: ARC token and network design",
    tag: "Mainnet",
    tone: "info",
    body:
      "Initial ARC supply of 10B tokens — 60% ecosystem development, 25% Circle, 15% long-term reserves. Consensus runs on Malachite, a Tendermint-based BFT engine with sub-second deterministic finality, plus a built-in FX engine and opt-in privacy.",
    source: {
      label: "Circle blog",
      url: "https://www.circle.com/blog/introducing-arc-an-open-layer-1-blockchain-purpose-built-for-stablecoin-finance",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Dashboard tiles                                                     */
/* ------------------------------------------------------------------ */

export const NETWORK_STATS = [
  { label: "Mainnet", value: "Beta pending", sub: "Summer 2026 target window", kind: "pending" },
  { label: "Testnet txs", value: "244.1M", sub: "cumulative, as of 5 May 2026", kind: "good" },
  { label: "Native gas", value: "USDC", sub: "dollar-denominated fees", kind: "info" },
  { label: "Finality", value: "<1s", sub: "Malachite BFT · ~2s blocks", kind: "info" },
];
