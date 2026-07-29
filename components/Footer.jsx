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
            <Link href="/memecoins">Memecoins</Link>
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
          chain ID and production bridge parameters are unpublished. The bridge executes testnet CCTP routes only and
          blocks mainnet funds. RadarDex market rows are live third-party data; token identity and values are not
          guaranteed. The legacy screener remains clearly labeled sample data, and nothing here is financial advice.
          Data reviewed {SITE.updated}.
        </p>
      </div>
    </footer>
  );
}
