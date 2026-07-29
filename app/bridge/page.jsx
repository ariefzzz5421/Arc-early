import GatewayRoutes from "@/components/GatewayRoutes";
import { ArcLogo, UsdcLogo } from "@/components/Logos";
import { Notice, PageHead, Stat } from "@/components/ui";
import { fetchGatewayRoutes } from "@/lib/gateway";

export const metadata = {
  title: "Mainnet Bridge Status",
  description:
    "Live Circle Gateway route check for Arc mainnet — supported domains, published contract addresses and the deposit-to-mint flow.",
};

const OFFICIAL_DETAILS = [
  {
    label: "Current public network",
    value: "Public Testnet",
    note: "Live and permissionless · chain ID 5042002",
    source: "https://docs.arc.io/arc/concepts/deployment-model",
  },
  {
    label: "Private mainnet",
    value: "Upcoming",
    note: "Production network for real-value flows",
    source: "https://docs.arc.io/arc/concepts/deployment-model",
  },
  {
    label: "Public mainnet",
    value: "Upcoming",
    note: "Public RPC, chain ID and explorer not published",
    source: "https://docs.arc.io/arc/concepts/deployment-model",
  },
  {
    label: "Canonical USDC route",
    value: "CCTP",
    note: "Burn and mint; Arc Testnet is domain 26",
    source: "https://docs.arc.io/integrate/infrastructure/bridges",
  },
];

export default async function BridgePage() {
  const routes = await fetchGatewayRoutes();

  return (
    <div className="shell">
      <PageHead
        eyebrow="Mainnet readiness"
        title="Arc mainnet bridge"
        actions={[
          <span className="badge pending" key="status">
            Coming soon
          </span>,
          <span className="badge live" key="check">
            <span className="dot" /> Live route check
          </span>,
        ]}
      >
        This page checks Circle&apos;s production Gateway API on every load and reports whether Arc is a published
        route yet, with the contract addresses Circle serves for every chain that is. Arc Early enables a production
        bridge only once Arc appears in that list — no simulated quotes, wallet prompts or transaction buttons before
        then.
      </PageHead>

      <div style={{ marginBottom: 20 }}>
        <GatewayRoutes initialData={routes} />
      </div>

      <section className="bridge-coming card">
        <div className="bridge-coming-mark">
          <ArcLogo size={96} />
          <span className="bridge-line" aria-hidden="true" />
          <UsdcLogo size={68} />
        </div>
        <div>
          <div className="eyebrow">Status checked against official docs</div>
          <h2>Mainnet bridge is coming soon</h2>
          <p className="muted">
            Arc&apos;s official deployment model lists Public Testnet as live and both Private Mainnet and Public
            Mainnet as upcoming, which matches what the Gateway API reports above. When those two sources disagree with
            an endpoint someone hands you, trust these two. An unlisted RPC or Gateway contract has not been published
            by Circle or Arc, however confidently it is shared.
          </p>
          <div className="pill-row">
            <a
              className="btn primary"
              href="https://docs.arc.io/arc/concepts/deployment-model"
              target="_blank"
              rel="noreferrer"
            >
              Check Arc deployment status ↗
            </a>
            <a
              className="btn"
              href="https://developers.circle.com/cctp/concepts/supported-chains-and-domains"
              target="_blank"
              rel="noreferrer"
            >
              Check CCTP support ↗
            </a>
          </div>
        </div>
      </section>

      <div className="grid stats bridge-stats">
        <Stat
          label="Bridge state"
          value={routes.arc.mainnetSupported ? "Route published" : "Coming soon"}
          sub={routes.arc.mainnetSupported ? "Arc listed by Circle Gateway" : "waiting for official mainnet route"}
          kind={routes.arc.mainnetSupported ? "good" : "pending"}
        />
        <Stat
          label="Arc mainnet domain"
          value={routes.arc.mainnet ? String(routes.arc.mainnet.domain) : "Not public"}
          sub={routes.arc.mainnet ? "published by Circle" : "no Circle-published domain"}
          kind={routes.arc.mainnet ? "good" : "pending"}
        />
        <Stat
          label="Arc testnet domain"
          value={routes.arc.testnet ? String(routes.arc.testnet.domain) : "—"}
          sub={routes.arc.testnet ? "live on Gateway testnet" : "not reported"}
          kind="info"
        />
        <Stat label="Mainnet asset safety" value="Disabled" sub="no wallet transaction can be started" kind="good" />
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Latest official details</div>
            <h2>What is available today</h2>
          </div>
          <span className="badge">Reviewed July 27, 2026</span>
        </div>
        <div className="grid eco-grid">
          {OFFICIAL_DETAILS.map((detail) => (
            <a className="card eco-card" href={detail.source} target="_blank" rel="noreferrer" key={detail.label}>
              <div className="eyebrow">{detail.label}</div>
              <h3>{detail.value}</h3>
              <p>{detail.note}</p>
              <span className="badge info">Official source ↗</span>
            </a>
          ))}
        </div>
      </section>

      <Notice>
        <b>Do not deposit real funds yet.</b> A site claiming an Arc mainnet bridge before Arc publishes matching chain
        parameters and contracts may be unsafe. This page intentionally fails closed and will remain read-only.
      </Notice>

      <div style={{ height: 30 }} />
    </div>
  );
}
