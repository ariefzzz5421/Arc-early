"use client";

import { useArcLive } from "@/lib/useArcLive";
import { ARC_WS, ARC_HTTP, arcTestnet } from "@/lib/chains";

function Tile({ label, value, sub }) {
  return (
    <div className="live-tile">
      <div className="label">{label}</div>
      <div className="value mono">{value}</div>
      {sub ? <div className="sub">{sub}</div> : null}
    </div>
  );
}

export default function LiveNetwork({ compact = false }) {
  const { status, transport, head, blocks, intervalMs, tps, gasPriceUsdc, error } = useArcLive();

  const badge =
    status === "live"
      ? { cls: "live", text: transport === "websocket" ? "live · websocket" : "live · polling" }
      : status === "error"
        ? { cls: "pending", text: "disconnected" }
        : { cls: "info", text: "connecting…" };

  return (
    <div className="card card-pad grid" style={{ gap: 14 }}>
      <div className="section-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="eyebrow">Live · Arc testnet</div>
          <h2 style={{ marginTop: 6, fontSize: 18 }}>Chain head</h2>
        </div>
        <span className={`badge ${badge.cls}`}>
          {status === "live" && <span className="dot" />}
          {badge.text}
        </span>
      </div>

      <div className="live-grid">
        <Tile
          label="Block"
          value={head ? `#${head.number.toLocaleString("en-US")}` : "—"}
          sub={head ? new Date(head.timestamp * 1000).toLocaleTimeString() : "waiting for head"}
        />
        <Tile
          label="Block interval"
          value={intervalMs ? `${(intervalMs / 1000).toFixed(2)}s` : "—"}
          sub={`over last ${blocks.length} blocks`}
        />
        <Tile label="Txs in block" value={head ? head.txs.toLocaleString("en-US") : "—"} sub={tps ? `${tps.toFixed(2)} tx/s` : "—"} />
        <Tile
          label="Gas price"
          value={gasPriceUsdc != null ? `${gasPriceUsdc.toFixed(9)}` : "—"}
          sub="USDC per gas unit"
        />
        {!compact && (
          <Tile
            label="Gas used"
            value={head && head.gasLimit ? `${((head.gasUsed / head.gasLimit) * 100).toFixed(1)}%` : "—"}
            sub={head ? `${head.gasUsed.toLocaleString("en-US")} gas` : "of block limit"}
          />
        )}
      </div>

      {!compact && (
        <div className="block-strip">
          {blocks.map((b) => (
            <a
              key={b.hash}
              className="block-chip"
              href={`${arcTestnet.blockExplorers.default.url}/block/${b.number}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className="mono">#{b.number.toLocaleString("en-US")}</span>
              <span className="faint">{b.txs} tx</span>
            </a>
          ))}
          {blocks.length === 0 && <span className="faint">Waiting for the first head…</span>}
        </div>
      )}

      <div className="faint" style={{ fontSize: 12, lineHeight: 1.5 }}>
        {status === "error" ? (
          <>Stream failed: {error}. </>
        ) : null}
        Subscribed to <code className="mono">newHeads</code> on{" "}
        <span className="mono">{transport === "websocket" ? ARC_WS : ARC_HTTP}</span>
        {transport === "http" ? " (websocket unavailable — polling every 2s)." : "."} Arc mainnet has no public endpoint
        yet, so this is testnet data.
      </div>
    </div>
  );
}
