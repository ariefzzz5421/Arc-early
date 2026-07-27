import Bridge from "@/components/Bridge";
import { PageHead } from "@/components/ui";
import { ROUTERS } from "@/lib/data";

export const metadata = {
  title: "Bridge",
  description:
    "Plan testnet USDC routes between Arc Testnet, Ethereum Sepolia, Base Sepolia, Arbitrum Sepolia and Solana Devnet using Circle CCTP.",
};

export default function BridgePage() {
  return (
    <div className="shell">
      <PageHead
        eyebrow="Tools"
        title="Testnet bridge planner"
        actions={[
          <span key="1" className="badge">Ethereum Sepolia</span>,
          <span key="2" className="badge">Base Sepolia</span>,
          <span key="3" className="badge">Arbitrum Sepolia</span>,
          <span key="4" className="badge">Solana Devnet</span>,
        ]}
      >
        Pick a source and destination to inspect a testnet-safe CCTP path, estimated gas and finality. Testnet USDC has
        no financial value. This planner never holds funds, builds calldata or signs transactions.
      </PageHead>

      <Bridge />

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Reference</div>
            <h2>How the supported path works</h2>
          </div>
        </div>
        <div className="grid eco-grid">
          {Object.values(ROUTERS).map((r) => (
            <a key={r.key} className="card eco-card" href={r.link} target="_blank" rel="noreferrer">
              <div className="eco-top">
                <span className="eco-logo" style={{ background: "rgba(39,117,202,0.14)" }}>
                  {r.name.slice(0, 1)}
                </span>
                <div>
                  <h3>{r.name}</h3>
                  <div className="faint" style={{ fontSize: 12 }}>{r.kind}</div>
                </div>
              </div>
              <p>{r.blurb}</p>
              <div className="tags">
                <span className="badge">{r.bps} bps</span>
                <span className="badge">{r.trust}</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="card card-pad" style={{ marginBottom: 30 }}>
        <h3>Why every chain here is a test network</h3>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 0 }}>
          Arc&apos;s active public network is Testnet, so pairing it with Ethereum, Base, Arbitrum or Solana mainnet would
          cross network environments and cannot produce a valid transfer. The planner uses Sepolia and Devnet
          counterparts supported by Circle instead.
        </p>
      </section>
    </div>
  );
}
