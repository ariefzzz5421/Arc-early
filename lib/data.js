/**
 * Static reference data for Arc Early.
 *
 * Everything here is either (a) published network/ecosystem information with a
 * source link, or (b) clearly-flagged sample market data used to drive the
 * screener UI until a live Arc indexer endpoint is wired into lib/market.js.
 */

export const SITE = {
  name: "Arc Early",
  tagline: "Live community-token data, ecosystem map and Arc mainnet watch.",
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
    category: "Community Market",
    featured: true,
    url: "https://radardex.io/",
    color: "#7b61ff",
    logo: "/ecosystem/radardex.svg",
    blurb:
      "Community token scanner, market tracker and launcher. Its live index powers Arc Early's memecoin page.",
    tags: ["Live index", "Token discovery", "Third-party"],
    stats: [["Data", "Live API"], ["Refresh", "60 sec"], ["Confidence", "Third-party"]],
    sourceLabel: "RadarDex",
  },
  {
    name: "Aave",
    slug: "aave",
    category: "DeFi",
    url: "https://aave.com/",
    color: "#8b5cf6",
    logo: "/ecosystem/aave.svg",
    blurb: "Open-source, non-custodial liquidity markets for supplying assets and borrowing against collateral.",
    tags: ["Lending", "Liquidity"],
    stats: [["Role", "Money market"], ["Access", "Non-custodial"], ["Arc status", "Directory listed"]],
    sourceLabel: "Arc ecosystem",
  },
  {
    name: "Across",
    slug: "across",
    category: "Interoperability",
    url: "https://across.to/",
    color: "#6cf9d8",
    logo: "/ecosystem/across.svg",
    blurb: "Intent-based interoperability infrastructure designed for fast crosschain transfers.",
    tags: ["Bridge", "Intents"],
    stats: [["Role", "Crosschain"], ["Design", "Intent-based"], ["Arc status", "Directory listed"]],
    sourceLabel: "Arc ecosystem",
  },
  {
    name: "Alchemy",
    slug: "alchemy",
    category: "Developer Infrastructure",
    url: "https://www.alchemy.com",
    color: "#3b82f6",
    logo: "/ecosystem/alchemy.svg",
    blurb: "RPC, data APIs and developer tooling for building and scaling onchain applications.",
    tags: ["RPC", "Data APIs"],
    stats: [["Role", "Developer platform"], ["Coverage", "100+ chains"], ["Arc status", "Directory listed"]],
    sourceLabel: "Arc ecosystem",
  },
  {
    name: "Blockradar",
    slug: "blockradar",
    category: "Payments",
    url: "https://blockradar.co",
    color: "#38bdf8",
    logo: "/ecosystem/blockradar.svg",
    blurb: "Stablecoin payment infrastructure for fast, low-cost transfers across borders.",
    tags: ["Payments", "Stablecoins"],
    stats: [["Role", "Money movement"], ["Focus", "Cross-border"], ["Arc status", "Directory listed"]],
    sourceLabel: "Arc ecosystem",
  },
  {
    name: "Blockscout",
    slug: "blockscout",
    category: "Developer Infrastructure",
    url: "https://www.blockscout.com/",
    color: "#7c5cff",
    logo: "/ecosystem/blockscout.svg",
    blurb: "Open-source block explorer infrastructure for Ethereum Virtual Machine networks.",
    tags: ["Explorer", "Open source"],
    stats: [["Role", "Block explorer"], ["Runtime", "EVM"], ["Arc status", "Directory listed"]],
    sourceLabel: "Arc ecosystem",
  },
  {
    name: "Bridge",
    slug: "bridge",
    category: "Payments",
    url: "https://www.bridge.xyz/",
    color: "#f4f7fb",
    logo: "/ecosystem/bridge.svg",
    blurb: "Developer stablecoin platform for global money movement and payout infrastructure.",
    tags: ["Stablecoins", "APIs"],
    stats: [["Role", "Payments API"], ["Focus", "Global movement"], ["Arc status", "Directory listed"]],
    sourceLabel: "Arc ecosystem",
  },
  {
    name: "Chainlink",
    slug: "chainlink",
    category: "Data & Oracles",
    url: "https://chain.link/",
    color: "#375bd2",
    logo: "/ecosystem/chainlink.png",
    blurb: "Decentralized oracle infrastructure that connects smart contracts to data and services.",
    tags: ["Oracle", "Data"],
    stats: [["Role", "Oracle network"], ["Focus", "External data"], ["Arc status", "Directory listed"]],
    sourceLabel: "Arc ecosystem",
  },
  {
    name: "Curve",
    slug: "curve",
    category: "DeFi",
    url: "https://www.curve.finance/",
    color: "#ef4444",
    logo: "/ecosystem/curve.png",
    blurb: "Decentralized exchange optimized for swapping assets with similar values.",
    tags: ["DEX", "Stable swaps"],
    stats: [["Role", "Exchange"], ["Focus", "Like-value assets"], ["Arc status", "Directory listed"]],
    sourceLabel: "Arc ecosystem",
  },
  {
    name: "Fireblocks",
    slug: "fireblocks",
    category: "Security & Custody",
    url: "https://fireblocks.com/",
    color: "#111827",
    logo: "/ecosystem/fireblocks.svg",
    blurb: "Enterprise-grade digital asset and stablecoin infrastructure for secure operations.",
    tags: ["Custody", "Enterprise"],
    stats: [["Role", "Asset operations"], ["Focus", "Enterprise"], ["Arc status", "Directory listed"]],
    sourceLabel: "Arc ecosystem",
  },
  {
    name: "Hibachi",
    slug: "hibachi",
    category: "FX",
    url: "https://hibachi.xyz/",
    color: "#f97316",
    logo: "/ecosystem/hibachi.png",
    blurb: "A stablecoin-native FX exchange project with transparent pricing on a live orderbook.",
    tags: ["FX", "Orderbook"],
    stats: [["Role", "FX exchange"], ["Market", "Stablecoins"], ["Arc status", "Directory listed"]],
    sourceLabel: "Arc ecosystem",
  },
  {
    name: "LayerZero",
    slug: "layerzero",
    category: "Interoperability",
    url: "https://layerzero.network/",
    color: "#f4f7fb",
    logo: "/ecosystem/layerzero.svg",
    blurb: "Interoperability infrastructure for applications that communicate across blockchains.",
    tags: ["Messaging", "Crosschain"],
    stats: [["Role", "Messaging"], ["Focus", "Interoperability"], ["Arc status", "Directory listed"]],
    sourceLabel: "Arc ecosystem",
  },
];

export const ECO_CATEGORIES = [
  "All",
  "Community Market",
  "DeFi",
  "Payments",
  "Interoperability",
  "Developer Infrastructure",
  "Data & Oracles",
  "Security & Custody",
  "FX",
];

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
