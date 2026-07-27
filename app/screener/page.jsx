import Screener from "@/components/Screener";
import { PageHead } from "@/components/ui";

export const metadata = {
  title: "Screener",
  description: "Explore sample Arc token rows by volume, liquidity, FDV, holders and age, with illustrative risk flags.",
};

export default function ScreenerPage() {
  return (
    <div className="shell">
      <PageHead
        eyebrow="Tools"
        title="Arc screener preview"
        actions={[
          <span key="a" className="badge info">Quoted vs USDC</span>,
          <span key="b" className="badge">Sample market rows</span>,
          <a key="c" className="badge" href="https://radardex.io/" target="_blank" rel="noreferrer">
            RadarDex ↗
          </a>,
        ]}
      >
        Explore the sample rows and test the filters before a supported live indexer is connected. Columns are sortable
        and the flags demonstrate checks for young launches, thin liquidity, unaudited contracts and volume above pool
        depth.
      </PageHead>

      <div style={{ paddingBottom: 20 }}>
        <Screener />
      </div>

      <div className="card card-pad" style={{ marginBottom: 30 }}>
        <h3>Wiring in live data</h3>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 0 }}>
          The table reads from <code className="mono">TOKENS</code> in <code className="mono">lib/data.js</code>. Once Arc
          mainnet and a supported indexer are available, swap that import for a verified data fetch and the rest of the
          component works unchanged — the shape it expects is{" "}
          <code className="mono">
            {"{ symbol, name, kind, price, change24h, volume24h, liquidity, fdv, holders, ageHours, audit, spark[] }"}
          </code>
          .
        </p>
      </div>
    </div>
  );
}
