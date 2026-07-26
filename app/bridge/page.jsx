import Bridge from "@/components/Bridge";
import { PageHead } from "@/components/ui";
import { ROUTERS } from "@/lib/data";

export const metadata = {
  title: "Bridge",
  description:
    "Compare USDC bridge routes between Arc, Ethereum L1, Base, Robinhood Chain, Arbitrum and Solana — CCTP V2, Arc canonical, Stargate and Across.",
};

export default function BridgePage() {
  return (
    <div className="shell">
      <PageHead
        eyebrow="Tools"
        title="Bridge router"
        actions={[
          <span key="1" className="badge">Ethereum L1</span>,
          <span key="2" className="badge">Base</span>,
          <span key="3" className="badge">Robinhood Chain</span>,
          <span key="4" className="badge">Arbitrum</span>,
          <span key="5" className="badge">Solana</span>,
        ]}
      >
        Pick a source and destination, and Arc Early ranks every router that can carry native USDC between them — fees,
        gas, time to finality and the trust assumption you take on. It plans routes; it never holds funds or signs
        transactions.
      </PageHead>

      <Bridge />

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Reference</div>
            <h2>How each router works</h2>
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
        <h3>Why Robinhood Chain takes two legs</h3>
        <p className="muted" style={{ fontSize: 13.5, marginBottom: 0 }}>
          Robinhood Chain is an Arbitrum Orbit rollup and is not a Circle CCTP domain, so native USDC cannot be burned
          and minted directly into it. Routes through it settle Arc ⇄ Arbitrum One over CCTP first, then hop the Orbit
          canonical bridge — which is why the quotes show a higher flat cost and a longer finality window than the Base
          or Ethereum legs.
        </p>
      </section>
    </div>
  );
}
