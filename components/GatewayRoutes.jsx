"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GATEWAY_STEPS, WITHDRAWAL_DELAY_DAYS } from "@/lib/gateway";

function shortAddress(address) {
  if (!address) return "—";
  return `${address.slice(0, 8)}…${address.slice(-6)}`;
}

function fetchedAtLabel(value) {
  if (!value) return "unknown time";
  return value.replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

function CopyAddress({ address, title }) {
  const [copied, setCopied] = useState(false);

  if (!address) return <span className="faint">not published</span>;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — the address is still shown in full on hover.
    }
  };

  return (
    <button className="wallet-link mono" type="button" onClick={copy} title={title ? `${title}: ${address}` : address}>
      {copied ? "copied ✓" : shortAddress(address)}
    </button>
  );
}

export default function GatewayRoutes({ initialData }) {
  const [env, setEnv] = useState("mainnet");
  const [query, setQuery] = useState("");

  const routeQuery = useQuery({
    queryKey: ["circle", "gateway", "routes"],
    initialData,
    queryFn: async () => {
      const response = await fetch("/api/gateway/routes", { cache: "no-store" });
      const next = await response.json();
      if (!response.ok) throw new Error(next.message || "Circle's Gateway API is unavailable.");
      return next;
    },
    refetchInterval: 300_000,
    staleTime: 120_000,
    retry: 1,
  });

  const data = routeQuery.data;
  const refreshing = routeQuery.isFetching;

  const side = data?.[env] ?? null;

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = side?.domains ?? [];
    if (!needle) return list;
    return list.filter(
      (row) =>
        row.chain.toLowerCase().includes(needle) ||
        row.network.toLowerCase().includes(needle) ||
        String(row.domain) === needle,
    );
  }, [side, query]);

  if (data?.status !== "live" || routeQuery.isError) {
    return (
      <div className="card empty">
        <h3>Circle Gateway route data unavailable</h3>
        <p className="muted">
          {routeQuery.error?.message || data?.message || "Circle's Gateway API could not be reached."}
        </p>
        <p className="faint" style={{ fontSize: 12.5, maxWidth: "60ch", margin: "0 auto 16px" }}>
          The bridge stays closed while route support cannot be verified. It does not fall back to a cached or assumed
          list of supported chains.
        </p>
        <button className="btn" type="button" onClick={() => routeQuery.refetch()} disabled={refreshing}>
          {refreshing ? "Retrying…" : "Retry"}
        </button>
      </div>
    );
  }

  const arcMainnet = data.arc.mainnet;
  const arcTestnet = data.arc.testnet;

  return (
    <div className="grid" style={{ gap: 18 }}>
      {/* ---------- the answer the page exists to give ---------- */}
      <div className={`card card-pad gateway-verdict ${arcMainnet ? "open" : "closed"}`}>
        <div className="gateway-verdict-mark" aria-hidden="true">
          {arcMainnet ? "✓" : "×"}
        </div>
        <div>
          <div className="eyebrow">Live check · Circle Gateway API</div>
          <h2 style={{ marginTop: 6, fontSize: 22 }}>
            {arcMainnet ? "Arc mainnet is a published Gateway route" : "Arc mainnet is not a published Gateway route"}
          </h2>
          <p className="muted" style={{ marginTop: 8, maxWidth: "78ch" }}>
            {arcMainnet ? (
              <>
                Circle now lists Arc on the production Gateway API as domain <b>{arcMainnet.domain}</b>, with a wallet
                contract at <span className="mono">{arcMainnet.wallet}</span> and a minter at{" "}
                <span className="mono">{arcMainnet.minter}</span>. These addresses come from Circle, not from this
                repository.
              </>
            ) : (
              <>
                Circle&apos;s production Gateway API lists {data.mainnet.count} supported domains and Arc is not among
                them.{" "}
                {arcTestnet ? (
                  <>
                    Arc appears only on the testnet API, as domain <b>{arcTestnet.domain}</b>.
                  </>
                ) : null}{" "}
                There is therefore no Circle-published mainnet wallet or minter contract to deposit into. Any Arc
                mainnet RPC, chain ID or Gateway contract circulating elsewhere is unverified — treat it as unsafe
                until it appears in this list.
              </>
            )}
          </p>
          <div className="pill-row" style={{ marginTop: 14 }}>
            <span className={`badge ${arcMainnet ? "live" : "pending"}`}>
              {arcMainnet ? <span className="dot" /> : null}
              {arcMainnet ? "route open" : "route not published"}
            </span>
            <span className="badge info">{data.mainnet.count} mainnet domains</span>
            <span className="badge info">{data.testnet.count} testnet domains</span>
            <button className="btn sm" type="button" onClick={() => routeQuery.refetch()} disabled={refreshing}>
              {refreshing ? "Checking…" : "Re-check now"}
            </button>
          </div>
        </div>
      </div>

      {/* ---------- live domain registry ---------- */}
      <div className="card">
        <div className="toolbar">
          <div className="chips">
            {[
              { key: "mainnet", label: `Mainnet (${data.mainnet.count})` },
              { key: "testnet", label: `Testnet (${data.testnet.count})` },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                className={`chip ${env === option.key ? "on" : ""}`}
                onClick={() => setEnv(option.key)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <input
            className="input search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chain or domain id…"
            aria-label="Search Gateway domains"
          />
        </div>

        <div className="table-wrap">
          <table className="data gateway-table">
            <thead>
              <tr>
                <th className="left">Chain</th>
                <th>Domain</th>
                <th>GatewayWallet</th>
                <th>GatewayMinter</th>
                <th>Tokens</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.domain}-${row.chain}`} className={/^arc\b/i.test(row.chain) ? "row-arc" : undefined}>
                  <td className="left">
                    <span className="token-name">{row.chain}</span>
                    <span className="token-sub">{row.network || "—"}</span>
                  </td>
                  <td className="mono">{row.domain}</td>
                  <td>
                    <CopyAddress address={row.wallet} title="GatewayWallet" />
                  </td>
                  <td>
                    <CopyAddress address={row.minter} title="GatewayMinter" />
                  </td>
                  <td className="faint">{row.tokens.length ? row.tokens.join(", ") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {rows.length === 0 ? (
          <div className="empty">
            {side?.ok ? "No domain matches that search." : side?.message || "This environment could not be read."}
          </div>
        ) : null}

        <div className="data-attribution">
          Read live from{" "}
          <a href={side?.endpoint} target="_blank" rel="noreferrer">
            {side?.endpoint}
          </a>
          {" · "}
          fetched {fetchedAtLabel(data.fetchedAt)}
          {" · "}
          contract addresses are Circle&apos;s, served by Circle. Verify one on the source chain&apos;s explorer before
          approving any allowance against it.
        </div>
      </div>

      {/* ---------- the flow ---------- */}
      <div className="card">
        <div className="section-head" style={{ margin: 0, padding: "16px 18px 4px" }}>
          <div>
            <div className="eyebrow">How the route works</div>
            <h2 style={{ marginTop: 6, fontSize: 18 }}>Deposit → finality → burn intent → attestation → mint</h2>
          </div>
          <a className="badge info" href={data.docs.guide} target="_blank" rel="noreferrer">
            Circle Gateway guide ↗
          </a>
        </div>

        <ol className="gateway-steps">
          {GATEWAY_STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="gateway-step-n" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p className="muted">{step.body}</p>
                <code className="mono gateway-step-detail">{step.detail}</code>
              </div>
            </li>
          ))}
        </ol>

        <div className="data-attribution">
          Gateway is non-custodial: a deposit stays yours and can be withdrawn on-chain without the API after a{" "}
          {WITHDRAWAL_DELAY_DAYS}-day delay. Finality windows are per-chain — see{" "}
          <a href={data.docs.finality} target="_blank" rel="noreferrer">
            Circle&apos;s finality reference
          </a>
          .
        </div>
      </div>
    </div>
  );
}
