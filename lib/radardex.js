const RADARDEX_API =
  "https://web-production-efe27.up.railway.app/tokens?sort=volume24&dir=desc&limit=100&window=24h";

const finiteOrNull = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

function normalizeToken(token) {
  if (!token || typeof token !== "object" || !/^0x[a-fA-F0-9]{40}$/.test(token.address || "")) {
    return null;
  }

  return {
    address: token.address.toLowerCase(),
    symbol: String(token.symbol || "UNKNOWN").slice(0, 20),
    name: String(token.name || "Unknown token").slice(0, 80),
    price: finiteOrNull(token.price),
    marketCap: finiteOrNull(token.mcap),
    change24h: finiteOrNull(token.change24h),
    volume24h: finiteOrNull(token.volume24),
    liquidity: finiteOrNull(token.liquidityUsdc),
    transactions24h: finiteOrNull(token.txns24),
    traders24h: finiteOrNull(token.traders24),
    buys24h: finiteOrNull(token.buys24),
    sells24h: finiteOrNull(token.sells24),
    ageSeconds: finiteOrNull(token.ageSec),
    icon: /^https:\/\//.test(token.icon || "") ? token.icon : null,
    verified: token.verified === true,
    launchedOnRadarDex: token.launched === true,
    quote: token.hasUsdc ? "USDC" : token.hasEusd ? "eUSD" : "Unknown",
    spark: Array.isArray(token.spark)
      ? token.spark.map(finiteOrNull).filter((value) => value !== null).slice(-24)
      : [],
  };
}

export async function fetchRadarDexTokens() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(RADARDEX_API, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`RadarDex returned HTTP ${response.status}`);
    }

    const payload = await response.json();
    const tokens = Array.isArray(payload?.tokens)
      ? payload.tokens.map(normalizeToken).filter(Boolean)
      : [];

    return {
      status: "live",
      source: "RadarDex",
      sourceUrl: "https://radardex.io/",
      fetchedAt: new Date().toISOString(),
      upstreamCount: finiteOrNull(payload?.count),
      tokens,
    };
  } catch (error) {
    return {
      status: "unavailable",
      source: "RadarDex",
      sourceUrl: "https://radardex.io/",
      fetchedAt: new Date().toISOString(),
      tokens: [],
      message:
        error?.name === "AbortError"
          ? "RadarDex did not respond before the timeout."
          : "RadarDex market data is temporarily unavailable.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
