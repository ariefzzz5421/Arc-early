"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { compact, pct, usd } from "@/lib/format";
import { Sparkline } from "./ui";

const SORTS = [
  { key: "volume24h", label: "24h volume" },
  { key: "marketCap", label: "Market cap" },
  { key: "liquidity", label: "Liquidity" },
  { key: "change24h", label: "24h change" },
  { key: "transactions24h", label: "Transactions" },
  { key: "ageSeconds", label: "Newest" },
];

function tokenAge(seconds) {
  if (!Number.isFinite(seconds)) return "—";
  if (seconds < 3600) return `${Math.max(1, Math.round(seconds / 60))}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
}

function shortAddress(address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function TokenIcon({ token }) {
  const [failed, setFailed] = useState(false);
  if (!token.icon || failed) {
    return <span className="token-logo">{token.symbol.slice(0, 2).toUpperCase()}</span>;
  }
  return (
    <img
      className="token-logo token-logo-img"
      src={token.icon}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export default function MemecoinMarket({ initialData }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("volume24h");
  const [quote, setQuote] = useState("All");

  const marketQuery = useQuery({
    queryKey: ["radardex", "memecoins"],
    initialData,
    queryFn: async () => {
      const response = await fetch("/api/radardex/memecoins", { cache: "no-store" });
      const next = await response.json();
      if (!response.ok) throw new Error(next.message || "RadarDex data is unavailable.");
      return next;
    },
    refetchInterval: 60_000,
    staleTime: 25_000,
    retry: 1,
  });

  const data = marketQuery.data;
  const refreshing = marketQuery.isFetching;
  const refresh = () => marketQuery.refetch();

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...(data?.tokens || [])]
      .filter((token) => {
        if (quote !== "All" && token.quote !== quote) return false;
        if (!needle) return true;
        return (
          token.name.toLowerCase().includes(needle) ||
          token.symbol.toLowerCase().includes(needle) ||
          token.address.includes(needle)
        );
      })
      .sort((a, b) => {
        if (sort === "ageSeconds") return (a.ageSeconds ?? Infinity) - (b.ageSeconds ?? Infinity);
        return (b[sort] ?? -Infinity) - (a[sort] ?? -Infinity);
      });
  }, [data, query, sort, quote]);

  if (data?.status !== "live" || marketQuery.isError) {
    return (
      <div className="card empty">
        <h3>RadarDex data unavailable</h3>
        <p className="muted">
          {marketQuery.error?.message || data?.message || "No live market rows are available right now."}
        </p>
        <button className="btn" type="button" onClick={refresh} disabled={refreshing}>
          {refreshing ? "Retrying…" : "Retry live feed"}
        </button>
      </div>
    );
  }

  const totalVolume = data.tokens.reduce((sum, token) => sum + (token.volume24h || 0), 0);
  const totalLiquidity = data.tokens.reduce((sum, token) => sum + (token.liquidity || 0), 0);
  const totalTransactions = data.tokens.reduce((sum, token) => sum + (token.transactions24h || 0), 0);

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="grid stats meme-stats">
        <div className="card stat">
          <div className="label">Tracked by RadarDex</div>
          <div className="value">{data.upstreamCount ?? data.tokens.length}</div>
          <div className="sub">upstream token count</div>
        </div>
        <div className="card stat">
          <div className="label">24h volume</div>
          <div className="value">{compact(totalVolume)}</div>
          <div className="sub">rows returned by live feed</div>
        </div>
        <div className="card stat">
          <div className="label">Liquidity</div>
          <div className="value">{compact(totalLiquidity)}</div>
          <div className="sub">USDC/eUSD pool estimate</div>
        </div>
        <div className="card stat">
          <div className="label">24h transactions</div>
          <div className="value">{totalTransactions.toLocaleString("en-US")}</div>
          <div className="sub">buy and sell activity</div>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <input
            className="input search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search token, symbol or contract…"
            aria-label="Search RadarDex tokens"
          />
          <select className="input" value={sort} onChange={(event) => setSort(event.target.value)}>
            {SORTS.map((option) => (
              <option key={option.key} value={option.key}>
                Sort: {option.label}
              </option>
            ))}
          </select>
          <div className="chips">
            {["All", "USDC", "eUSD"].map((value) => (
              <button
                key={value}
                type="button"
                className={`chip ${quote === value ? "on" : ""}`}
                onClick={() => setQuote(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <button className="btn sm" type="button" onClick={refresh} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="table-wrap">
          <table className="data meme-table">
            <thead>
              <tr>
                <th className="left">Token</th>
                <th>Price</th>
                <th>24h</th>
                <th>Trend</th>
                <th>Market cap</th>
                <th>24h volume</th>
                <th>Liquidity</th>
                <th>Txns</th>
                <th>Traders</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((token) => (
                <tr key={token.address}>
                  <td className="left">
                    <a
                      className="token-cell"
                      href={`https://radardex.io/#${token.address}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <TokenIcon token={token} />
                      <span>
                        <span className="token-name">
                          {token.symbol}
                          {token.verified ? <span className="badge live token-verified">Verified</span> : null}
                        </span>
                        <span className="token-sub">
                          {token.name} · {shortAddress(token.address)} · {token.quote}
                        </span>
                      </span>
                    </a>
                  </td>
                  <td className="mono">{usd(token.price)}</td>
                  <td className={`mono ${(token.change24h || 0) >= 0 ? "up" : "down"}`}>
                    {pct(token.change24h)}
                  </td>
                  <td>
                    <Sparkline
                      points={token.spark}
                      color={(token.change24h || 0) >= 0 ? "#2fd48f" : "#ff5d73"}
                    />
                  </td>
                  <td className="mono">{compact(token.marketCap)}</td>
                  <td className="mono">{compact(token.volume24h)}</td>
                  <td className="mono">{compact(token.liquidity)}</td>
                  <td className="mono">{token.transactions24h?.toLocaleString("en-US") ?? "—"}</td>
                  <td className="mono">{token.traders24h?.toLocaleString("en-US") ?? "—"}</td>
                  <td>{tokenAge(token.ageSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 ? <div className="empty">No live tokens match the current filters.</div> : null}
        <div className="data-attribution">
          Live source:{" "}
          <a href={data.sourceUrl} target="_blank" rel="noreferrer">
            RadarDex
          </a>
          {" · "}
          fetched {new Date(data.fetchedAt).toLocaleString("en-US")}
          {" · "}
          values are third-party, unverified testnet/community market data.
        </div>
      </div>
    </div>
  );
}
