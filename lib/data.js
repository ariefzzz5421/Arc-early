/**
 * Static reference data for Arc Early.
 *
 * Everything here is either (a) published network/ecosystem information with a
 * source link, or (b) clearly-flagged sample market data used to drive the
 * screener UI until a live Arc indexer endpoint is wired into lib/market.js.
 */

export const SITE = {
  name: "Arc Early",
  tagline: "Screener, testnet bridge planner and network watch for Circle's Arc L1.",
  updated: "2026-07-27",
};

/* ------------------------------------------------------------------ */
/* Networks                                                            */
/* ------------------------------------------------------------------ */

export const ARC_NETWORKS = {
  mainnet: {
    key: "arc-mainnet",
    label: "Arc Mainnet",
    status: "pending",
    chainId: null,
    rpc: null,
    explorer: null,
    gasToken: "USDC",
    note: "Arc's current active public network is Testnet. Mainnet parameters are not published yet; treat any unverified 'Arc mainnet' RPC or bridge as unsafe.",
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
    blockTime: "~0.5s",
    consensus: "Malachite (Tendermint BFT), sub-second finality",
  },
};

/* ------------------------------------------------------------------ */
/* Bridge — chains and routers                                         */
/* ------------------------------------------------------------------ */

export const CHAINS = [
  {
    key: "arc",
    name: "Arc Testnet",
    short: "ARC",
    color: "#0b2547",
    chainId: 5042002,
    env: "testnet",
    kind: "L1",
    gas: "USDC",
    routers: ["cctp-standard"],
    note: "Circle's active public testnet. Testnet USDC has no financial value.",
  },
  {
    key: "ethereum",
    name: "Ethereum Sepolia",
    short: "SEP",
    color: "#627eea",
    chainId: 11155111,
    env: "testnet",
    kind: "L1",
    gas: "ETH",
    routers: ["cctp-standard"],
  },
  {
    key: "base",
    name: "Base Sepolia",
    short: "BSEP",
    color: "#0052ff",
    chainId: 84532,
    env: "testnet",
    kind: "L2 · OP Stack",
    gas: "ETH",
    routers: ["cctp-standard"],
  },
  {
    key: "arbitrum",
    name: "Arbitrum Sepolia",
    short: "ASEP",
    color: "#2d374b",
    chainId: 421614,
    env: "testnet",
    kind: "L2 · Rollup",
    gas: "ETH",
    routers: ["cctp-standard"],
  },
  {
    key: "solana",
    name: "Solana Devnet",
    short: "SOL-D",
    color: "#14f195",
    chainId: null,
    env: "testnet",
    kind: "L1",
    gas: "SOL",
    routers: ["cctp-standard"],
  },
];

export const chainByKey = (key) => CHAINS.find((c) => c.key === key);

/**
 * Router models. `bps` + `flat` drive the quote; `etaSec` drives the ETA.
 * The route availability comes from Circle's supported-chain documentation.
 * Gas and time values are illustrative testnet planning estimates, not live quotes.
 */
export const ROUTERS = {
  "cctp-standard": {
    key: "cctp-standard",
    name: "Circle CCTP — Standard",
    kind: "Native burn & mint",
    bps: 0,
    flat: 0,
    etaSec: 900,
    trust: "Circle attestation (Iris)",
    blurb: "Burns testnet USDC on the source chain and mints testnet USDC on the destination after Circle attestation. Arc Testnet does not offer Fast Transfer as a source.",
    link: "https://developers.circle.com/cctp/concepts/supported-chains-and-domains",
  },
};

/** Routers usable for a given pair = intersection of both chains' support. */
export function routersFor(fromKey, toKey) {
  const a = chainByKey(fromKey);
  const b = chainByKey(toKey);
  if (!a || !b || a.key === b.key) return [];
  const shared = a.routers.filter((r) => b.routers.includes(r));
  return shared.map((k) => ROUTERS[k]).filter(Boolean);
}

/** Deterministic quote for a router — no network calls, pure arithmetic. */
export function quote(router, amount, fromKey, toKey) {
  const parsed = Number(amount);
  const amt = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  const gasEstimate = estimateGas(fromKey, toKey);
  const protocolFee = (amt * router.bps) / 10000 + router.flat;
  const out = Math.max(0, amt - protocolFee - gasEstimate);
  return {
    protocolFee,
    gasEstimate,
    totalFee: protocolFee + gasEstimate,
    out,
    etaSec: router.etaSec,
  };
}

/** Rough source-chain gas cost, expressed in USDC. */
function estimateGas(fromKey, toKey) {
  const base = { ethereum: 0.02, base: 0.005, arbitrum: 0.005, arc: 0.001, solana: 0.001 };
  const src = base[fromKey] ?? 0.1;
  const dst = base[toKey] ?? 0.1;
  return src + dst * 0.35;
}

/* ------------------------------------------------------------------ */
/* Screener — sample market rows                                       */
/* ------------------------------------------------------------------ */

export const SCREENER_DISCLAIMER =
  "Arc mainnet has not launched, so no live price feed exists yet — these rows exercise the screener UI and are replaced by a real indexer once a supported data source is available.";

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
    title: "Public mainnet remains upcoming",
    tag: "Mainnet",
    tone: "warn",
    body:
      "Arc's current deployment model lists Public Testnet as live while both private and public mainnet remain upcoming. Mainnet RPC, chain ID and production bridge parameters are not public.",
    source: {
      label: "Arc deployment model",
      url: "https://docs.arc.io/arc/concepts/deployment-model",
    },
  },
  {
    date: "2026-07",
    title: "Treat unverified mainnet bridges as unsafe",
    tag: "Security",
    tone: "warn",
    body:
      "Arc mainnet parameters are not public. Do not connect a wallet to a site that claims live mainnet support unless its network and contract details are published in the official Arc documentation.",
    source: { label: "Arc docs", url: "https://docs.arc.io" },
  },
  {
    date: "2026-05",
    title: "Q1 testnet review reports 30.7M transactions",
    tag: "Testnet",
    tone: "good",
    body:
      "Arc's official Q1 2026 review reported roughly 30.7 million transactions, 916,000 unique wallets, 100% uptime and an average block time near 0.48 seconds.",
    source: {
      label: "Arc deployment model",
      url: "https://docs.arc.io/arc/concepts/deployment-model",
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
      "Arc's public testnet launched with 100+ institutions participating, including BlackRock, Visa, Goldman Sachs and HSBC. Chain ID 5042002 and USDC is the native gas token.",
    source: { label: "Arc docs", url: "https://docs.arc.io/arc/references/connect-to-arc" },
  },
  {
    date: "2025-08",
    title: "Arc uses stablecoins, not a volatile gas token",
    tag: "Mainnet",
    tone: "info",
    body:
      "Arc is designed around stablecoins: USDC pays gas, EURC supports euro-denominated transfers and the network has no volatile native token. Consensus uses Malachite BFT with deterministic sub-second finality.",
    source: {
      label: "Arc network",
      url: "https://docs.arc.io/arc-chain",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Dashboard tiles                                                     */
/* ------------------------------------------------------------------ */

export const NETWORK_STATS = [
  { label: "Mainnet", value: "Upcoming", sub: "no public parameters yet", kind: "pending" },
  { label: "Testnet txs", value: "30.7M", sub: "official Q1 2026 review", kind: "good" },
  { label: "Native gas", value: "USDC", sub: "dollar-denominated fees", kind: "info" },
  { label: "Finality", value: "<1s", sub: "Malachite BFT · ~0.5s blocks", kind: "info" },
];
