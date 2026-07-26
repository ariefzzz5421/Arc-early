import Link from "next/link";
import { ArcLogo, UsdcLogo } from "./Logos";
import { SITE } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-row">
          <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
            <ArcLogo size={30} />
            <div>
              <div style={{ color: "var(--text)", fontWeight: 650 }}>Arc Early</div>
              <div>Independent tooling · not affiliated with Circle</div>
            </div>
          </div>
          <div className="footer-links">
            <Link href="/screener">Screener</Link>
            <Link href="/bridge">Bridge</Link>
            <Link href="/updates">Updates</Link>
            <Link href="/ecosystem">Ecosystem</Link>
            <Link href="/network">Network</Link>
            <a href="https://docs.arc.io" target="_blank" rel="noreferrer">
              Arc docs ↗
            </a>
            <a href="https://radardex.io/" target="_blank" rel="noreferrer">
              RadarDex ↗
            </a>
          </div>
        </div>
        <p className="disclaimer">
          <UsdcLogo size={13} /> Arc uses USDC as its native gas token. Arc mainnet has not launched — mainnet RPC,
          chain ID and canonical bridge contracts are unpublished, and any site offering live Arc mainnet bridging today
          should be treated as a scam. Screener rows and bridge quotes on this site are estimates for planning only, not
          executable trades, and nothing here is financial advice. Data reviewed {SITE.updated}.
        </p>
      </div>
    </footer>
  );
}
