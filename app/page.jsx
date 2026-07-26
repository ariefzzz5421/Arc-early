import Link from "next/link";
import { ArcLogo, UsdcLogo, RadarDexLogo } from "@/components/Logos";
import { Stat, Notice } from "@/components/ui";
import Screener from "@/components/Screener";
import LiveNetwork from "@/components/LiveNetwork";
import { NETWORK_STATS, UPDATES, ECOSYSTEM, ARC_NETWORKS, CHAINS } from "@/lib/data";

const FEATURES = [
  {
    href: "/screener",
    icon: "◎",
    title: "Screener",
    body: "Sort every Arc pair by volume, liquidity, FDV, holders and age — with thin-liquidity and fresh-launch flags surfaced up front.",
  },
  {
    href: "/bridge",
    icon: "⇄",
    title: "Bridge router",
    body: "Compare CCTP V2, the Arc canonical bridge, Stargate and Across across Ethereum L1, Base, Robinhood Chain, Arbitrum and Solana.",
  },
  {
    href: "/updates",
    icon: "◈",
    title: "Mainnet watch",
    body: "Every dated Arc milestone with a source link, from the testnet launch through the summer 2026 mainnet beta window.",
  },
  {
    href: "/ecosystem",
    icon: "⬡",
    title: "Ecosystem",
    body: "DEXs, launchpads, payment rails, privacy infra and NFT projects building on Arc — including RadarDex.",
  },
  {
    href: "/network",
    icon: "⌘",
    title: "Network info",
    body: "Chain IDs, RPC endpoints, explorer and faucet links, plus the wallet gotchas around USDC-denominated gas.",
  },
  {
    href: "https://radardex.io/",
    icon: "◐",
    title: "RadarDex ↗",
    body: "Scan, launch and trade Arc tokens. Launches go straight into Uniswap v3 — no bonding curve, no migration.",
    external: true,
  },
];

export default function DashboardPage() {
  const radar = ECOSYSTEM.find((e) => e.slug === "radardex");
  const latest = UPDATES.slice(0, 3);

  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <div className="pill-row" style={{ marginBottom: 16 }}>
              <span className="badge live">
                <span className="dot" /> Testnet live
              </span>
              <span className="badge pending">Mainnet beta · summer 2026</span>
              <span className="badge info">
                <UsdcLogo size={13} /> Gas paid in USDC
              </span>
            </div>
            <h1>
              Get early on <span style={{ color: "#8fc0f5" }}>Arc</span>.
            </h1>
            <p className="lead">
              Arc Early is an independent toolkit for Circle&apos;s stablecoin L1 — a token screener, a cross-chain USDC
              bridge router, an ecosystem map and a sourced feed of everything happening on the road to mainnet.
            </p>
            <div className="hero-cta">
              <Link className="btn primary" href="/screener">
                Open screener
              </Link>
              <Link className="btn" href="/bridge">
                Bridge USDC
              </Link>
              <Link className="btn" href="/updates">
                Mainnet watch
              </Link>
            </div>
          </div>
          <div className="hero-mark">
            <ArcLogo size={228} />
          </div>
        </div>
      </section>

      <section className="shell" style={{ paddingBottom: 8 }}>
        <div className="grid stats">
          {NETWORK_STATS.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>
      </section>

      <section className="shell" style={{ paddingTop: 18 }}>
        <LiveNetwork />
      </section>

      <section className="shell section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Tools</div>
            <h2>Everything in one place</h2>
          </div>
        </div>
        <div className="feature">
          {FEATURES.map((f) =>
            f.external ? (
              <a key={f.title} className="card feature-card" href={f.href} target="_blank" rel="noreferrer">
                <div className="ico">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </a>
            ) : (
              <Link key={f.title} className="card feature-card" href={f.href}>
                <div className="ico">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </Link>
            )
          )}
        </div>
      </section>

      <section className="shell section" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div>
            <div className="eyebrow">Screener</div>
            <h2>Top Arc pairs by volume</h2>
          </div>
          <Link className="btn sm" href="/screener">
            All pairs →
          </Link>
        </div>
        <Screener limit={5} compactMode />
        <p className="faint" style={{ fontSize: 12.5, marginTop: 10 }}>
          Sample rows — Arc mainnet has no public price feed yet.
        </p>
      </section>

      <section className="shell section" style={{ paddingTop: 0 }}>
        <div className="grid split">
          <div>
            <div className="section-head">
              <div>
                <div className="eyebrow">Mainnet watch</div>
                <h2>Latest from Arc</h2>
              </div>
              <Link className="btn sm" href="/updates">
                All updates →
              </Link>
            </div>
            <div className="timeline">
              {latest.map((u) => (
                <article key={u.title} className="card update">
                  <div className="when">{u.date}</div>
                  <div>
                    <h3>{u.title}</h3>
                    <p>{u.body}</p>
                    <div className="tags">
                      <span className={`badge ${u.tone === "good" ? "live" : u.tone === "warn" ? "pending" : "info"}`}>
                        {u.tag}
                      </span>
                      <a className="faint" href={u.source.url} target="_blank" rel="noreferrer">
                        {u.source.label} ↗
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="grid" style={{ gap: 16 }}>
            <div className="section-head">
              <div>
                <div className="eyebrow">Featured</div>
                <h2>Ecosystem spotlight</h2>
              </div>
            </div>

            <a className="card eco-card" href={radar.url} target="_blank" rel="noreferrer">
              <div className="eco-top">
                <RadarDexLogo size={38} />
                <div>
                  <h3>{radar.name}</h3>
                  <div className="faint" style={{ fontSize: 12 }}>{radar.category}</div>
                </div>
              </div>
              <p>{radar.blurb}</p>
              <div className="tags">
                {radar.tags.map((t) => (
                  <span key={t} className="badge">
                    {t}
                  </span>
                ))}
              </div>
            </a>

            <div className="card card-pad">
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                Bridge coverage
              </div>
              <div className="grid" style={{ gap: 8 }}>
                {CHAINS.slice(0, 4).map((c) => (
                  <div key={c.key} className="kv">
                    <span className="k">{c.name}</span>
                    <span className="v faint" style={{ fontWeight: 500 }}>{c.kind}</span>
                  </div>
                ))}
              </div>
              <Link className="btn sm" href="/bridge" style={{ marginTop: 14 }}>
                Open bridge router →
              </Link>
            </div>

            <Notice>
              <b>{ARC_NETWORKS.mainnet.note}</b>
            </Notice>
          </div>
        </div>
      </section>
    </>
  );
}
