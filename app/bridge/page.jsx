import { ArcLogo, UsdcLogo } from "@/components/Logos";
import { Notice, PageHead, Stat } from "@/components/ui";

export const metadata = {
  title: "Mainnet Bridge Status",
  description:
    "Arc mainnet bridge readiness based on Arc and Circle's official deployment and CCTP documentation.",
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

export default function BridgePage() {
  return (
    <div className="shell">
      <PageHead
        eyebrow="Mainnet readiness"
        title="Arc mainnet bridge"
        actions={[
          <span className="badge pending" key="status">
            Coming soon
          </span>,
          <span className="badge info" key="source">
            Official Arc status
          </span>,
        ]}
      >
        Arc Early will only enable a production bridge after Arc publishes mainnet network parameters and an official
        router exposes a supported route. No simulated quotes, wallet prompts or transaction buttons are shown before
        that point.
      </PageHead>

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
            Arc&apos;s official deployment model currently lists Public Testnet as live and both Private Mainnet and
            Public Mainnet as upcoming. Circle&apos;s CCTP matrix lists Arc Testnet—not Arc Mainnet—as a supported
            domain. That means there is no official public mainnet router for this app to connect to yet.
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
        <Stat label="Bridge state" value="Coming soon" sub="waiting for official mainnet route" kind="pending" />
        <Stat label="Mainnet parameters" value="Not public" sub="no confirmed chain ID or RPC" kind="pending" />
        <Stat label="Live CCTP domain" value="26" sub="Arc Testnet only" kind="info" />
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
