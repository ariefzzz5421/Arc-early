import Link from "next/link";
import { ArcLogo, UsdcLogo, RadarDexLogo } from "@/components/Logos";
import { Stat, Notice } from "@/components/ui";
import Screener from "@/components/Screener";
import LiveNetwork from "@/components/LiveNetwork";
import { NETWORK_STATS, UPDATES, ECOSYSTEM, ARC_NETWORKS } from "@/lib/data";

const FEATURES = [
  {
    href: "/memecoins",
    icon: "◉",
    title: "Live memecoins",
    body: "Real RadarDex market rows with price, liquidity, volume, transactions, traders and contract links.",
  },
  {
    href: "/bridge",
    icon: "⇄",
    title: "Safe testnet bridge",
    body: "Bridge native testnet USDC through Circle CCTP V2 with fee review, wallet validation and Forwarder minting.",
  },
  {
    href: "/updates",
    icon: "◈",
    title: "Mainnet watch",
    body: "Every dated Arc milestone with a source link, from the public testnet launch through the upcoming mainnet phases.",
  },
  {
    href: "/ecosystem",
    icon: "⬡",
    title: "Ecosystem",
    body: "Official project logos, concise product summaries and source-backed Arc network statistics.",
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
    body: "Open the third-party source used by the live memecoin route and verify token contracts directly.",
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
              <span className="badge pending">Mainnet · upcoming</span>
              <span className="badge info">
                <UsdcLogo size={13} /> Gas paid in USDC
              </span>
            </div>
            <h1>
              Get early on <span style={{ color: "#8fc0f5" }}>Arc</span>.
            </h1>
            <p className="lead">
              Arc Early is an independent toolkit for Circle&apos;s stablecoin L1 — live RadarDex community-token data,
              a safe USDC testnet bridge, an official ecosystem map and sourced network updates.
            </p>
            <div className="hero-cta">
              <Link className="btn primary" href="/memecoins">
                Open live memecoins
              </Link>
              <Link className="btn" href="/bridge">
                Bridge status
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
            <h2>Sample Arc pairs by volume</h2>
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
                USDC bridge
              </div>
              <div className="kv">
                <span className="k">Status</span>
                <span className="v" style={{ color: "var(--up)" }}>Testnet live</span>
              </div>
              <div className="kv">
                <span className="k">Route</span>
                <span className="v faint" style={{ fontWeight: 500 }}>Circle CCTP V2</span>
              </div>
              <div className="kv">
                <span className="k">Mainnet funds</span>
                <span className="v faint" style={{ fontWeight: 500 }}>Blocked</span>
              </div>
              <Link className="btn sm" href="/bridge" style={{ marginTop: 14 }}>
                Open bridge →
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
