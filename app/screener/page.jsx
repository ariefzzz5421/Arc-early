import Screener from "@/components/Screener";
import { PageHead } from "@/components/ui";

export const metadata = {
  title: "Screener",
  description: "Screen Arc tokens by volume, liquidity, FDV, holders and age, with risk flags for thin liquidity and fresh launches.",
};

export default function ScreenerPage() {
  return (
    <div className="shell">
      <PageHead
        eyebrow="Tools"
        title="Arc token screener"
        actions={[
          <span key="a" className="badge info">Quoted vs USDC</span>,
          <span key="b" className="badge">Uniswap v3 pools</span>,
          <a key="c" className="badge" href="https://radardex.io/" target="_blank" rel="noreferrer">
            RadarDex ↗
          </a>,
        ]}
      >
        Sort and filter every pair on Arc. Columns are sortable — click a header to flip direction. Flags call out the
        things that usually matter on a young chain: launches under 48 hours old, pools under $250K of liquidity,
        unaudited contracts, and volume running above 2× the pool depth.
      </PageHead>

      <div style={{ paddingBottom: 20 }}>
        <Screener />
      </div>

      <div className="card card-pad" style={{ marginBottom: 30 }}>
        <h3>Wiring in live data</h3>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 0 }}>
          The table reads from <code className="mono">TOKENS</code> in <code className="mono">lib/data.js</code>. Once Arc
          mainnet RPC is published, swap that import for a fetch against an Arc indexer or the RadarDex API and the rest
          of the component works unchanged — the shape it expects is{" "}
          <code className="mono">
            {"{ symbol, name, kind, price, change24h, volume24h, liquidity, fdv, holders, ageHours, audit, spark[] }"}
          </code>
          .
        </p>
      </div>
    </div>
  );
}
