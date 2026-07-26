import EcosystemGrid from "@/components/EcosystemGrid";
import { PageHead } from "@/components/ui";
import { RadarDexLogo } from "@/components/Logos";
import { ECOSYSTEM } from "@/lib/data";

export const metadata = {
  title: "Ecosystem",
  description: "Projects building on Circle's Arc L1 — DEXs and launchpads including RadarDex, payment rails, privacy infrastructure, NFTs and memes.",
};

export default function EcosystemPage() {
  const radar = ECOSYSTEM.find((p) => p.slug === "radardex");

  return (
    <div className="shell">
      <PageHead eyebrow="Directory" title="Arc ecosystem">
        DEXs, launchpads, payment rails, privacy infrastructure and NFT projects building on Arc. Several of the payments
        entries came out of Circle&apos;s 2026 developer grant cohort. Links go to each project&apos;s own site — always
        confirm a contract address on-chain before you trade.
      </PageHead>

      <a
        className="card card-pad"
        href={radar.url}
        target="_blank"
        rel="noreferrer"
        style={{ display: "block", marginBottom: 24, borderColor: "rgba(123,97,255,0.4)" }}
      >
        <div className="split grid" style={{ alignItems: "center" }}>
          <div>
            <div className="pill-row" style={{ marginBottom: 12 }}>
              <RadarDexLogo size={44} />
              <div>
                <div className="eyebrow" style={{ color: "#b4a6ff" }}>Featured ecosystem partner</div>
                <h2 style={{ marginTop: 4 }}>RadarDex — DEX &amp; token scanner</h2>
              </div>
            </div>
            <p className="muted" style={{ marginBottom: 12 }}>{radar.blurb}</p>
            <div className="tags">
              {radar.tags.map((t) => (
                <span key={t} className="badge">
                  {t}
                </span>
              ))}
              <span className="badge info">radardex.io ↗</span>
            </div>
          </div>
          <div className="grid" style={{ gap: 8 }}>
            <div className="kv">
              <span className="k">Launch venue</span>
              <span className="v">Uniswap v3 on Arc</span>
            </div>
            <div className="kv">
              <span className="k">Bonding curve</span>
              <span className="v">None — pool live instantly</span>
            </div>
            <div className="kv">
              <span className="k">Migration step</span>
              <span className="v">None</span>
            </div>
            <div className="kv">
              <span className="k">Extras</span>
              <span className="v">Trading leaderboard, referrals</span>
            </div>
            <div className="kv">
              <span className="k">Formerly</span>
              <span className="v">ArcDEXScan (rebranded July 2026)</span>
            </div>
          </div>
        </div>
      </a>

      <div style={{ paddingBottom: 30 }}>
        <EcosystemGrid />
      </div>
    </div>
  );
}
