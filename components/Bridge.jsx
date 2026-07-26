"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { CHAINS, chainByKey, routersFor, quote } from "@/lib/data";
import { WAGMI_CHAIN_ID, USDC_ADDRESS } from "@/lib/chains";
import { usd, eta } from "@/lib/format";
import { ChainIcon, UsdcLogo } from "./Logos";
import { Notice } from "./ui";

function ChainPicker({ value, onChange, exclude }) {
  const chain = chainByKey(value);
  return (
    <label className="chain-select">
      <ChainIcon chain={chain} />
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {CHAINS.filter((c) => c.key !== exclude).map((c) => (
          <option key={c.key} value={c.key}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Bridge() {
  const [from, setFrom] = useState("arc");
  const [to, setTo] = useState("base");
  const [amount, setAmount] = useState("1000");
  const [routerKey, setRouterKey] = useState(null);
  const [reviewing, setReviewing] = useState(false);

  const { address, isConnected, chainId: connectedChainId } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();

  const fromChainId = WAGMI_CHAIN_ID[from];
  const balance = useBalance({
    address,
    chainId: fromChainId ?? undefined,
    token: USDC_ADDRESS[from],
    query: { enabled: Boolean(address && fromChainId), refetchInterval: 20_000 },
  });

  const routers = useMemo(() => routersFor(from, to), [from, to]);

  const quotes = useMemo(() => {
    const list = routers.map((r) => ({ router: r, ...quote(r, amount, from, to) }));
    return list.sort((a, b) => b.out - a.out || a.etaSec - b.etaSec);
  }, [routers, amount, from, to]);

  const selected = quotes.find((q) => q.router.key === routerKey) || quotes[0];
  const cheapestKey = quotes[0]?.router.key;
  const fastestKey = quotes.length
    ? [...quotes].sort((a, b) => a.etaSec - b.etaSec)[0].router.key
    : null;

  useEffect(() => {
    setReviewing(false);
  }, [from, to, amount, routerKey]);

  const flip = () => {
    setFrom(to);
    setTo(from);
    setRouterKey(null);
  };

  const fromChain = chainByKey(from);
  const toChain = chainByKey(to);
  const amt = Number(amount) || 0;
  const arcLeg = from === "arc" || to === "arc";
  const wrongNetwork = isConnected && fromChainId && connectedChainId !== fromChainId;

  return (
    <div className="bridge-grid">
      {/* ---------------- left: the form ---------------- */}
      <div className="grid" style={{ gap: 16 }}>
        <div className="card card-pad grid" style={{ gap: 10 }}>
          <div className="section-head" style={{ marginBottom: 4 }}>
            <div>
              <div className="eyebrow">Route planner</div>
              <h2 style={{ marginTop: 6 }}>Bridge USDC</h2>
            </div>
            <ConnectButton showBalance={false} chainStatus="icon" accountStatus="address" label="Connect wallet" />
          </div>

          {wrongNetwork && (
            <div className="pill-row" style={{ justifyContent: "space-between" }}>
              <span className="faint" style={{ fontSize: 13 }}>
                Wallet is on a different network than the source chain.
              </span>
              <button
                className="btn sm"
                type="button"
                disabled={switching}
                onClick={() => switchChain({ chainId: fromChainId })}
              >
                {switching ? "Switching…" : `Switch to ${fromChain.name}`}
              </button>
            </div>
          )}

          <div className="leg">
            <div className="leg-top">
              <span>From</span>
              <span>
                {fromChain.kind} · gas in {fromChain.gas}
              </span>
            </div>
            <div className="leg-body">
              <ChainPicker value={from} onChange={(v) => { setFrom(v); setRouterKey(null); }} exclude={to} />
              <input
                className="amount-input mono"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                aria-label="Amount in USDC"
              />
            </div>
            <div className="leg-top" style={{ marginTop: 10, marginBottom: 0 }}>
              <span className="pill-row" style={{ gap: 6 }}>
                <UsdcLogo size={14} /> USDC
                {balance.data && (
                  <span className="faint">
                    · balance {Number(balance.data.formatted).toLocaleString("en-US", { maximumFractionDigits: 4 })}
                  </span>
                )}
              </span>
              <span className="pill-row" style={{ gap: 6 }}>
                {[100, 1000, 10000].map((v) => (
                  <button key={v} className="chip" style={{ padding: "2px 8px" }} onClick={() => setAmount(String(v))} type="button">
                    {v.toLocaleString("en-US")}
                  </button>
                ))}
                {balance.data && (
                  <button
                    className="chip on"
                    style={{ padding: "2px 8px" }}
                    type="button"
                    onClick={() => setAmount(balance.data.formatted)}
                  >
                    Max
                  </button>
                )}
              </span>
            </div>
          </div>

          <div className="swap-row">
            <button className="swap-btn" onClick={flip} type="button" aria-label="Swap direction">
              ↓
            </button>
          </div>

          <div className="leg">
            <div className="leg-top">
              <span>To</span>
              <span>
                {toChain.kind} · gas in {toChain.gas}
              </span>
            </div>
            <div className="leg-body">
              <ChainPicker value={to} onChange={(v) => { setTo(v); setRouterKey(null); }} exclude={from} />
              <div className="amount-input mono" style={{ opacity: selected ? 1 : 0.4 }}>
                {selected ? selected.out.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "0"}
              </div>
            </div>
            <div className="leg-top" style={{ marginTop: 10, marginBottom: 0 }}>
              <span className="pill-row" style={{ gap: 6 }}>
                <UsdcLogo size={14} /> USDC {toChain.key === "arc" ? "(native gas token)" : "(native, via burn & mint)"}
              </span>
              <span>{selected ? eta(selected.etaSec) : "—"}</span>
            </div>
          </div>

          {(fromChain.note || toChain.note) && (
            <div className="faint" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
              {fromChain.note} {toChain.note}
            </div>
          )}

          <button
            className="btn primary wide"
            type="button"
            disabled={!selected || amt <= 0}
            onClick={() => setReviewing(true)}
          >
            {amt > 0 ? `Review route · ${usd(amt, { digits: 2 })} USDC` : "Enter an amount"}
          </button>

          {reviewing && selected && (
            <div className="grid" style={{ gap: 10 }}>
              <Notice tone="blue">
                Arc Early does not move funds. Take this route to{" "}
                <a href={selected.router.link} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
                  {selected.router.name}
                </a>{" "}
                and re-verify the quote there before signing anything.
              </Notice>
              <div className="card card-pad">
                <div className="kv">
                  <span className="k">Path</span>
                  <span className="v">
                    {fromChain.name} → {selected.router.key === "orbit-canonical" ? "Arbitrum One → " : ""}
                    {toChain.name}
                  </span>
                </div>
                <div className="kv">
                  <span className="k">Router</span>
                  <span className="v">{selected.router.name}</span>
                </div>
                <div className="kv">
                  <span className="k">Trust assumption</span>
                  <span className="v">{selected.router.trust}</span>
                </div>
                <div className="kv">
                  <span className="k">Send</span>
                  <span className="v mono">{usd(amt, { digits: 2 })}</span>
                </div>
                <div className="kv">
                  <span className="k">Receive (est.)</span>
                  <span className="v mono up">{usd(selected.out, { digits: 2 })}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {arcLeg && (
          <Notice>
            <b>Arc mainnet is not live.</b> Circle has not published mainnet RPC, chain ID or canonical bridge contracts,
            so Arc legs are quoted from testnet and announced parameters. Any site that offers you a live Arc mainnet
            bridge today is a scam — verify against{" "}
            <a href="https://docs.arc.io" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
              docs.arc.io
            </a>
            .
          </Notice>
        )}
      </div>

      {/* ---------------- right: routes ---------------- */}
      <div className="grid" style={{ gap: 14 }}>
        <div className="card card-pad grid" style={{ gap: 10 }}>
          <div className="eyebrow">Routes · {quotes.length} available</div>
          {quotes.map((q) => (
            <button
              key={q.router.key}
              type="button"
              className={`route ${selected?.router.key === q.router.key ? "on" : ""}`}
              onClick={() => setRouterKey(q.router.key)}
            >
              <div style={{ minWidth: 0 }}>
                <div className="r-name">
                  {q.router.name}
                  {q.router.key === cheapestKey && <span className="badge live">Cheapest</span>}
                  {q.router.key === fastestKey && q.router.key !== cheapestKey && (
                    <span className="badge info">Fastest</span>
                  )}
                </div>
                <div className="r-meta">
                  {q.router.kind} · {eta(q.etaSec)}
                </div>
              </div>
              <div className="r-out">
                <div className="mono" style={{ fontWeight: 700 }}>
                  {q.out.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </div>
                <div className="r-meta">fee {usd(q.totalFee, { digits: 2 })}</div>
              </div>
            </button>
          ))}
          {quotes.length === 0 && <div className="empty">No route between those chains yet.</div>}
        </div>

        {selected && (
          <div className="card card-pad">
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Quote breakdown
            </div>
            <div className="kv">
              <span className="k">Protocol fee ({selected.router.bps} bps{selected.router.flat ? ` + $${selected.router.flat}` : ""})</span>
              <span className="v mono">{usd(selected.protocolFee, { digits: 2 })}</span>
            </div>
            <div className="kv">
              <span className="k">Gas (est., both legs)</span>
              <span className="v mono">{usd(selected.gasEstimate, { digits: 2 })}</span>
            </div>
            <div className="kv">
              <span className="k">Total cost</span>
              <span className="v mono">{usd(selected.totalFee, { digits: 2 })}</span>
            </div>
            <div className="kv">
              <span className="k">Effective rate</span>
              <span className="v mono">{amt > 0 ? `${((selected.totalFee / amt) * 100).toFixed(3)}%` : "—"}</span>
            </div>
            <div className="kv">
              <span className="k">Time to finality</span>
              <span className="v">{eta(selected.etaSec)}</span>
            </div>
            <p className="faint" style={{ fontSize: 12.5, marginBottom: 0, marginTop: 12, lineHeight: 1.55 }}>
              {selected.router.blurb}
            </p>
          </div>
        )}

        <div className="card card-pad">
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Supported chains
          </div>
          <div className="grid" style={{ gap: 9 }}>
            {CHAINS.map((c) => (
              <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ChainIcon chain={c} size={22} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.name}</div>
                  <div className="faint" style={{ fontSize: 11.5 }}>{c.kind}</div>
                </div>
                <span className={`badge ${c.key === "arc" ? "pending" : "live"}`}>
                  {c.key === "arc" ? "testnet" : "mainnet"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
