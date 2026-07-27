import Link from "next/link";
import EcosystemGrid from "@/components/EcosystemGrid";
import { PageHead, Stat } from "@/components/ui";
import { RadarDexLogo } from "@/components/Logos";

export const metadata = {
  title: "Ecosystem",
  description:
    "Recognizable Arc ecosystem projects with official logos, concise product details and source-backed network stats.",
};

export default function EcosystemPage() {
  return (
    <div className="shell">
      <PageHead
        eyebrow="Official directory + community market"
        title="Arc ecosystem"
        actions={[
          <a
            className="badge info"
            href="https://www.arc.io/ecosystem"
            target="_blank"
            rel="noreferrer"
            key="directory"
          >
            Official Arc directory ↗
          </a>,
          <span className="badge" key="reviewed">
            Reviewed July 27, 2026
          </span>,
        ]}
      >
        A practical map of organizations listed in Arc&apos;s official ecosystem directory, plus RadarDex as a clearly
        marked third-party community market. Each card uses the project logo published by Arc or the project itself and
        summarizes what the product does.
      </PageHead>

      <div className="grid stats">
        <Stat label="Official directory" value="99" sub="organizations listed by Arc" kind="info" />
        <Stat label="Weekly transactions" value="10.62M" sub="Arc public testnet · Jul 16–22" kind="good" />
        <Stat label="Weekly accounts" value="23,493" sub="Arc public testnet · Jul 16–22" kind="info" />
        <Stat label="Avg. transaction cost" value="$0.005" sub="Arc public testnet · official snapshot" kind="info" />
      </div>

      <section className="card card-pad ecosystem-feature">
        <div className="ecosystem-feature-copy">
          <div className="pill-row">
            <RadarDexLogo size={48} />
            <div>
              <div className="eyebrow" style={{ color: "#b4a6ff" }}>
                Community data source
              </div>
              <h2>RadarDex live market index</h2>
            </div>
          </div>
          <p className="muted">
            Arc Early now reads RadarDex&apos;s live token feed for prices, liquidity, volume, transactions and traders.
            This listing is separate from Arc&apos;s official ecosystem directory and is not an endorsement.
          </p>
          <div className="pill-row">
            <Link className="btn primary" href="/memecoins">
              Open live memecoins
            </Link>
            <a className="btn" href="https://radardex.io/" target="_blank" rel="noreferrer">
              Visit RadarDex ↗
            </a>
          </div>
        </div>
        <div className="eco-stats feature-stats">
          <div><span>Data</span><strong>Live API</strong></div>
          <div><span>Refresh</span><strong>60 seconds</strong></div>
          <div><span>Fallback</span><strong>Unavailable state</strong></div>
          <div><span>Trust</span><strong>Third-party feed</strong></div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 30 }}>
        <div className="section-head">
          <div>
            <div className="eyebrow">Recognizable projects</div>
            <h2>What each project does</h2>
          </div>
          <span className="badge">No invented TVL or volume</span>
        </div>
        <EcosystemGrid />
      </section>
    </div>
  );
}
