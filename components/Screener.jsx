"use client";

import { useMemo, useState } from "react";
import { TOKENS, TOKEN_KINDS, SCREENER_DISCLAIMER } from "@/lib/data";
import { usd, compact, pct, age } from "@/lib/format";
import { Sparkline, TokenBadge, Notice } from "./ui";

const COLUMNS = [
  { key: "symbol", label: "Token", align: "left" },
  { key: "price", label: "Price" },
  { key: "change24h", label: "24h" },
  { key: "volume24h", label: "Volume 24h" },
  { key: "liquidity", label: "Liquidity" },
  { key: "fdv", label: "FDV" },
  { key: "holders", label: "Holders" },
  { key: "ageHours", label: "Age" },
  { key: "risk", label: "Flags", align: "left", sortable: false },
  { key: "spark", label: "7d", sortable: false },
];

function riskFlags(t) {
  const flags = [];
  if (t.ageHours < 48) flags.push({ label: "New", tone: "pending" });
  if (t.liquidity < 250000) flags.push({ label: "Thin liq.", tone: "pending" });
  if (t.audit === "unaudited") flags.push({ label: "Unaudited", tone: "" });
  if (t.audit === "circle") flags.push({ label: "Circle", tone: "info" });
  if (t.volume24h > t.liquidity * 2) flags.push({ label: "Vol > 2× liq", tone: "" });
  return flags;
}

export default function Screener({ limit, compactMode = false }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [minLiq, setMinLiq] = useState(0);
  const [hideRisky, setHideRisky] = useState(false);
  const [sort, setSort] = useState({ key: "volume24h", dir: "desc" });

  const rows = useMemo(() => {
    let out = TOKENS.filter((t) => {
      if (kind !== "all" && t.kind !== kind) return false;
      if (t.liquidity < minLiq) return false;
      if (hideRisky && (t.audit === "unaudited" || t.liquidity < 250000)) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return t.symbol.toLowerCase().includes(q) || t.name.toLowerCase().includes(q);
    });

    out = [...out].sort((a, b) => {
      const va = a[sort.key];
      const vb = b[sort.key];
      if (typeof va === "string") {
        return sort.dir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      const na = va ?? -Infinity;
      const nb = vb ?? -Infinity;
      return sort.dir === "asc" ? na - nb : nb - na;
    });

    return limit ? out.slice(0, limit) : out;
  }, [query, kind, minLiq, hideRisky, sort, limit]);

  const toggleSort = (key, sortable) => {
    if (sortable === false) return;
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      {!compactMode && (
        <Notice tone="blue">
          <b>Sample data.</b> {SCREENER_DISCLAIMER}
        </Notice>
      )}

      <div className="card">
        {!compactMode && (
          <div className="toolbar">
            <input
              className="input search"
              placeholder="Search symbol or name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="chips">
              {TOKEN_KINDS.map((k) => (
                <button
                  key={k.key}
                  className={`chip ${kind === k.key ? "on" : ""}`}
                  onClick={() => setKind(k.key)}
                  type="button"
                >
                  {k.label}
                </button>
              ))}
            </div>
            <select className="input" value={minLiq} onChange={(e) => setMinLiq(Number(e.target.value))}>
              <option value={0}>Any liquidity</option>
              <option value={100000}>Liq ≥ $100K</option>
              <option value={500000}>Liq ≥ $500K</option>
              <option value={2000000}>Liq ≥ $2M</option>
            </select>
            <button
              type="button"
              className={`chip ${hideRisky ? "on" : ""}`}
              onClick={() => setHideRisky((v) => !v)}
            >
              Hide risky
            </button>
          </div>
        )}

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    className={c.align === "left" ? "left" : ""}
                    onClick={() => toggleSort(c.key, c.sortable)}
                    style={{ cursor: c.sortable === false ? "default" : "pointer" }}
                  >
                    {c.label}
                    {sort.key === c.key ? (sort.dir === "asc" ? " ▲" : " ▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const flags = riskFlags(t);
                return (
                  <tr key={t.symbol}>
                    <td className="left">
                      <div className="token-cell">
                        <TokenBadge token={t} />
                        <div>
                          <div className="token-name">{t.symbol}</div>
                          <div className="token-sub">{t.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="mono">{usd(t.price)}</td>
                    <td className={`mono ${t.change24h >= 0 ? "up" : "down"}`}>{pct(t.change24h)}</td>
                    <td className="mono">{compact(t.volume24h)}</td>
                    <td className="mono">{compact(t.liquidity)}</td>
                    <td className="mono">{compact(t.fdv)}</td>
                    <td className="mono">{t.holders.toLocaleString("en-US")}</td>
                    <td className="mono">{age(t.ageHours)}</td>
                    <td className="left">
                      <div className="tags">
                        {flags.length ? (
                          flags.map((f) => (
                            <span key={f.label} className={`badge ${f.tone}`}>
                              {f.label}
                            </span>
                          ))
                        ) : (
                          <span className="faint">—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Sparkline points={t.spark} color={t.change24h >= 0 ? "#2fd48f" : "#ff5d73"} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length === 0 && <div className="empty">No tokens match those filters.</div>}

        {!compactMode && (
          <div
            className="toolbar"
            style={{ borderBottom: "none", borderTop: "1px solid var(--line)", justifyContent: "space-between" }}
          >
            <span className="faint">
              {rows.length} of {TOKENS.length} pairs · quoted against USDC
            </span>
            <a className="btn sm" href="https://radardex.io/" target="_blank" rel="noreferrer">
              Open RadarDex scanner ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
