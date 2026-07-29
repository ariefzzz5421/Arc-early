"use client";

import { useEffect, useMemo, useState } from "react";
import { ARC_EXPLORER, ARC_HTTP, ARC_RPC_IS_PUBLIC, ARC_WS } from "@/lib/chains";
import { compact } from "@/lib/format";
import {
  isAddress,
  normalizeAddress,
  profileUrl,
  readStored,
  resolveWallets,
  shortAddress,
  writeStored,
} from "@/lib/wallets";
import { useWalletTracker } from "@/lib/useWalletTracker";

const SORTS = [
  { key: "balanceUsdc", label: "On-chain balance" },
  { key: "liveTxs", label: "Live activity" },
  { key: "nonce", label: "All-time txs" },
  { key: "netUsdc", label: "Net flow" },
  { key: "reportedUsd", label: "Reported size" },
];

function ago(timestamp) {
  if (!timestamp) return "—";
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  return `${Math.round(seconds / 3600)}h ago`;
}

function duration(ms) {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

/** USDC amount with the precision a gas-token balance actually needs. */
function usdc(value) {
  if (value == null) return "—";
  if (value === 0) return "0";
  if (Math.abs(value) >= 1000) return compact(value).replace("$", "");
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export default function WalletTracker() {
  const [stored, setStored] = useState({ added: [], removed: [] });
  const [draftAddress, setDraftAddress] = useState("");
  const [draftLabel, setDraftLabel] = useState("");
  const [formError, setFormError] = useState(null);
  const [sort, setSort] = useState("balanceUsdc");

  // localStorage is read after mount so the server and the first client render
  // agree on the seed list.
  useEffect(() => {
    setStored(readStored());
  }, []);

  const wallets = useMemo(() => resolveWallets(stored), [stored]);
  const { status, transport, error, head, scanned, activity, rows, totals, uptimeMs, balanceState, refresh } =
    useWalletTracker(wallets);

  const persist = (next) => {
    setStored(next);
    writeStored(next);
  };

  const addWallet = (event) => {
    event.preventDefault();
    const address = normalizeAddress(draftAddress);

    if (!isAddress(address)) {
      setFormError("Enter a valid 0x… address (40 hex characters).");
      return;
    }
    if (wallets.some((wallet) => wallet.address === address)) {
      setFormError("That wallet is already being tracked.");
      return;
    }

    persist({
      added: [...stored.added, { address, label: draftLabel.trim().slice(0, 32), addedAt: Date.now() }],
      removed: stored.removed.filter((entry) => normalizeAddress(entry) !== address),
    });
    setDraftAddress("");
    setDraftLabel("");
    setFormError(null);
  };

  const removeWallet = (address) => {
    persist({
      added: stored.added.filter((entry) => normalizeAddress(entry.address) !== address),
      removed: [...new Set([...stored.removed.map(normalizeAddress), address])],
    });
  };

  const sortedRows = useMemo(() => {
    const value = (row) => {
      if (sort === "liveTxs") return row.live.txs;
      if (sort === "netUsdc") return row.netUsdc;
      return row[sort];
    };
    return [...rows].sort((a, b) => (value(b) ?? -Infinity) - (value(a) ?? -Infinity));
  }, [rows, sort]);

  const badge =
    status === "live"
      ? { cls: "live", text: transport === "websocket" ? "live · websocket" : "live · polling" }
      : status === "error"
        ? { cls: "pending", text: "stream disconnected" }
        : { cls: "info", text: "connecting…" };

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="grid stats tracker-stats">
        <div className="card stat">
          <div className="label">Tracked wallets</div>
          <div className="value">{totals.wallets}</div>
          <div className="sub">{totals.active} active this session</div>
        </div>
        <div className="card stat">
          <div className="label">On-chain balance</div>
          <div className="value">{totals.balanceUsdc == null ? "—" : `${usdc(totals.balanceUsdc)} USDC`}</div>
          <div className="sub">
            {totals.balanceKnown}/{totals.wallets} wallets read · native gas token
          </div>
        </div>
        <div className="card stat">
          <div className="label">All-time transactions</div>
          <div className="value">{totals.allTimeTxs == null ? "—" : totals.allTimeTxs.toLocaleString("en-US")}</div>
          <div className="sub">outbound nonce, {totals.allTimeKnown}/{totals.wallets} wallets</div>
        </div>
        <div className="card stat">
          <div className="label">Live activity</div>
          <div className="value">{totals.liveTxs.toLocaleString("en-US")}</div>
          <div className="sub">matched in {scanned.toLocaleString("en-US")} blocks · {duration(uptimeMs)}</div>
        </div>
        <div className="card stat">
          <div className="label">Net flow (session)</div>
          <div className={`value ${totals.netUsdc > 0 ? "up" : totals.netUsdc < 0 ? "down" : ""}`}>
            {totals.liveTxs === 0 ? "—" : `${totals.netUsdc > 0 ? "+" : ""}${usdc(totals.netUsdc)}`}
          </div>
          <div className="sub">
            in {usdc(totals.inUsdc)} · out {usdc(totals.outUsdc)} USDC
          </div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="section-head" style={{ marginBottom: 14 }}>
          <div>
            <div className="eyebrow">Add wallet</div>
            <h2 style={{ marginTop: 6, fontSize: 18 }}>Track another address</h2>
          </div>
          <span className={`badge ${badge.cls}`}>
            {status === "live" && <span className="dot" />}
            {badge.text}
          </span>
        </div>

        <form className="wallet-form" onSubmit={addWallet}>
          <input
            className="input mono"
            value={draftAddress}
            onChange={(event) => {
              setDraftAddress(event.target.value);
              setFormError(null);
            }}
            placeholder="0x… wallet address"
            aria-label="Wallet address"
            spellCheck={false}
          />
          <input
            className="input"
            value={draftLabel}
            onChange={(event) => setDraftLabel(event.target.value)}
            placeholder="Label (optional)"
            aria-label="Wallet label"
            maxLength={32}
          />
          <button className="btn primary" type="submit">
            Add wallet
          </button>
          <button className="btn sm" type="button" onClick={refresh} disabled={balanceState.status === "loading"}>
            Refresh balances
          </button>
        </form>
        {formError ? (
          <p className="muted" style={{ marginTop: 10, color: "var(--down)" }}>
            {formError}
          </p>
        ) : null}
        <p className="faint" style={{ marginTop: 10, fontSize: 12, lineHeight: 1.6 }}>
          Wallets you add are stored in this browser only — nothing is uploaded. Every address is matched against each
          incoming block, so activity is counted the moment it lands.
        </p>
      </div>

      <div className="card">
        <div className="toolbar">
          <select className="input" value={sort} onChange={(event) => setSort(event.target.value)}>
            {SORTS.map((option) => (
              <option key={option.key} value={option.key}>
                Sort: {option.label}
              </option>
            ))}
          </select>
          <span className="faint" style={{ fontSize: 12 }}>
            Balances refreshed {balanceState.updatedAt ? ago(balanceState.updatedAt) : "…"}
            {balanceState.error ? ` · ${balanceState.error}` : ""}
          </span>
        </div>

        <div className="table-wrap">
          <table className="data wallet-table">
            <thead>
              <tr>
                <th className="left">Wallet</th>
                <th>Balance (USDC)</th>
                <th>Reported</th>
                <th>All-time txs</th>
                <th>Live txs</th>
                <th>In</th>
                <th>Out</th>
                <th>Net</th>
                <th>Last activity</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr key={row.address}>
                  <td className="left">
                    <div className="wallet-cell">
                      <span className="wallet-avatar" aria-hidden="true">
                        {row.label.slice(0, 2).toUpperCase()}
                      </span>
                      <span>
                        <span className="token-name">
                          {row.label}
                          {row.live.txs > 0 ? <span className="badge live token-verified">active</span> : null}
                        </span>
                        <span className="token-sub mono">{shortAddress(row.address)}</span>
                      </span>
                    </div>
                  </td>
                  <td className="mono">{usdc(row.balanceUsdc)}</td>
                  <td className="mono faint">{row.reportedUsd == null ? "—" : compact(row.reportedUsd)}</td>
                  <td className="mono">{row.nonce == null ? "—" : row.nonce.toLocaleString("en-US")}</td>
                  <td className="mono">{row.live.txs}</td>
                  <td className="mono up">{row.live.inUsdc ? usdc(row.live.inUsdc) : "—"}</td>
                  <td className="mono down">{row.live.outUsdc ? usdc(row.live.outUsdc) : "—"}</td>
                  <td className={`mono ${row.netUsdc > 0 ? "up" : row.netUsdc < 0 ? "down" : ""}`}>
                    {row.live.txs === 0 ? "—" : `${row.netUsdc > 0 ? "+" : ""}${usdc(row.netUsdc)}`}
                  </td>
                  <td className="faint">{ago(row.live.lastAt)}</td>
                  <td>
                    <div className="wallet-actions">
                      <a
                        className="wallet-link"
                        href={row.profileUrl || profileUrl(row.address)}
                        target="_blank"
                        rel="noreferrer"
                        title="Open RadarDex profile"
                      >
                        RadarDex ↗
                      </a>
                      <a
                        className="wallet-link"
                        href={`${ARC_EXPLORER}/address/${row.address}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open in ArcScan"
                      >
                        Explorer ↗
                      </a>
                      <button
                        className="wallet-link danger"
                        type="button"
                        onClick={() => removeWallet(row.address)}
                        title="Stop tracking"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedRows.length === 0 ? (
          <div className="empty">No wallets tracked. Add an address above to start counting its activity.</div>
        ) : null}

        <div className="data-attribution">
          Balances, nonces and transactions are read directly from Arc over{" "}
          <span className="mono">{transport === "websocket" ? ARC_WS : ARC_HTTP}</span>. “Reported” is the portfolio
          size quoted on the wallet&apos;s RadarDex profile when it was added — a third-party reference, never mixed
          into the on-chain columns.
        </div>
      </div>

      <div className="card">
        <div className="section-head" style={{ margin: 0, padding: "16px 18px 12px" }}>
          <div>
            <div className="eyebrow">Live feed</div>
            <h2 style={{ marginTop: 6, fontSize: 18 }}>Matched transactions</h2>
          </div>
          <span className="faint" style={{ fontSize: 12 }}>
            {head ? `head #${head.number.toLocaleString("en-US")}` : "waiting for head"}
          </span>
        </div>

        <div className="activity-feed">
          {activity.map((entry) => (
            <a
              key={entry.key}
              className="activity-row"
              href={`${ARC_EXPLORER}/tx/${entry.hash}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className={`activity-dir ${entry.direction === "in" ? "up" : "down"}`}>
                {entry.direction === "in" ? "IN" : "OUT"}
              </span>
              <span className="activity-main">
                <span className="mono">{shortAddress(entry.address)}</span>
                <span className="faint">
                  {entry.direction === "in" ? "from" : "to"}{" "}
                  {entry.counterparty ? shortAddress(entry.counterparty.toLowerCase()) : "contract creation"}
                  {entry.contractCall ? " · contract call" : ""}
                </span>
              </span>
              <span className={`mono ${entry.direction === "in" ? "up" : "down"}`}>
                {entry.value ? `${entry.direction === "in" ? "+" : "−"}${usdc(entry.value)}` : "0"} USDC
              </span>
              <span className="faint mono activity-block">#{entry.blockNumber.toLocaleString("en-US")}</span>
              <span className="faint activity-when">{ago(entry.at)}</span>
            </a>
          ))}
          {activity.length === 0 ? (
            <div className="empty">
              {status === "error"
                ? `Stream failed: ${error}`
                : "Watching every new block for the tracked addresses — nothing matched yet."}
            </div>
          ) : null}
        </div>

        <div className="data-attribution">
          Subscribed to <code className="mono">newHeads</code> with full transaction bodies
          {transport === "http" ? " (websocket unavailable — polling every 2s)" : ""}. Session totals cover the{" "}
          {scanned.toLocaleString("en-US")} blocks seen since this page opened, not the wallet&apos;s full history.
          {ARC_RPC_IS_PUBLIC
            ? " Using the shared public Arc endpoint — set NEXT_PUBLIC_ARC_RPC_WS to a dedicated provider for an uninterrupted stream."
            : ""}
        </div>
      </div>
    </div>
  );
}
