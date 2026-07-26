import { PageHead, Notice } from "@/components/ui";
import { CopyRow, AddTestnetButton } from "@/components/NetworkTools";
import LiveNetwork from "@/components/LiveNetwork";
import { UsdcLogo, ArcLogo } from "@/components/Logos";
import { ARC_NETWORKS } from "@/lib/data";

export const metadata = {
  title: "Network",
  description: "Arc network parameters — chain ID, RPC, explorer, faucet — plus the mainnet status and USDC gas notes.",
};

export default function NetworkPage() {
  const t = ARC_NETWORKS.testnet;
  const m = ARC_NETWORKS.mainnet;

  return (
    <div className="shell">
      <PageHead eyebrow="Reference" title="Connect to Arc">
        Arc is an EVM Layer 1 built by Circle for stablecoin finance, with USDC as the native gas token. The public
        testnet is live; mainnet parameters have not been published. Always cross-check these values against the official
        Arc docs before pointing real infrastructure at them.
      </PageHead>

      <div style={{ marginBottom: 26 }}>
        <LiveNetwork />
      </div>

      <div className="grid split" style={{ paddingBottom: 26 }}>
        <div className="card card-pad grid" style={{ gap: 16 }}>
          <div className="pill-row">
            <ArcLogo size={34} />
            <div>
              <h2>{t.label}</h2>
              <div className="faint" style={{ fontSize: 12.5 }}>{t.consensus}</div>
            </div>
            <span className="badge live" style={{ marginLeft: "auto" }}>
              <span className="dot" /> live
            </span>
          </div>

          <CopyRow label="Chain ID" value={String(t.chainId)} />
          <CopyRow label="Chain ID (hex)" value={t.chainIdHex} />
          <CopyRow label="RPC endpoint" value={t.rpc} href={t.rpc} />
          <CopyRow label="WebSocket" value={t.ws} />
          <CopyRow label="Block explorer" value={t.explorer} href={t.explorer} />
          <CopyRow label="Faucet" value={t.faucet} href={t.faucet} />

          <div className="grid" style={{ gap: 8 }}>
            <div className="kv">
              <span className="k">Gas token</span>
              <span className="v pill-row" style={{ gap: 6 }}>
                <UsdcLogo size={15} /> USDC
              </span>
            </div>
            <div className="kv">
              <span className="k">Block time</span>
              <span className="v">{t.blockTime}</span>
            </div>
            <div className="kv">
              <span className="k">Finality</span>
              <span className="v">sub-second, deterministic</span>
            </div>
          </div>

          <AddTestnetButton />
          <p className="faint" style={{ fontSize: 12.5, margin: 0, lineHeight: 1.55 }}>
            Wallets handle custom gas tokens differently, and published sources disagree on whether Arc&apos;s USDC gas
            unit is exposed with 6 or 18 decimals — balances may display oddly. Confirm the decimals on{" "}
            <a href="https://docs.arc.io/arc/references/connect-to-arc" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
              docs.arc.io
            </a>{" "}
            before you rely on a displayed balance or hard-code it anywhere.
          </p>
        </div>

        <div className="grid" style={{ gap: 16 }}>
          <div className="card card-pad grid" style={{ gap: 14 }}>
            <div className="pill-row">
              <h2>{m.label}</h2>
              <span className="badge pending" style={{ marginLeft: "auto" }}>
                beta pending
              </span>
            </div>
            <div className="grid" style={{ gap: 8 }}>
              <div className="kv">
                <span className="k">Chain ID</span>
                <span className="v faint">unpublished</span>
              </div>
              <div className="kv">
                <span className="k">RPC</span>
                <span className="v faint">unpublished</span>
              </div>
              <div className="kv">
                <span className="k">Explorer</span>
                <span className="v faint">unpublished</span>
              </div>
              <div className="kv">
                <span className="k">Target window</span>
                <span className="v">Summer 2026 (beta)</span>
              </div>
              <div className="kv">
                <span className="k">Gas token</span>
                <span className="v">USDC</span>
              </div>
            </div>
            <Notice>{m.note}</Notice>
          </div>

          <div className="card card-pad">
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Official links
            </div>
            <div className="grid" style={{ gap: 8 }}>
              {[
                ["Arc documentation", "https://docs.arc.io"],
                ["Connect to Arc", "https://docs.arc.io/arc/references/connect-to-arc"],
                ["Circle — Arc announcement", "https://www.circle.com/blog/introducing-arc-an-open-layer-1-blockchain-purpose-built-for-stablecoin-finance"],
                ["Circle CCTP docs", "https://developers.circle.com/cctp"],
                ["Testnet explorer", "https://testnet.arcscan.app"],
                ["USDC faucet", "https://faucet.circle.com"],
              ].map(([label, href]) => (
                <a key={href} className="kv" href={href} target="_blank" rel="noreferrer">
                  <span className="k">{label}</span>
                  <span className="v">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="card card-pad" style={{ marginBottom: 34 }}>
        <h3>What makes Arc different</h3>
        <p className="muted" style={{ fontSize: 13.5 }}>
          Gas is denominated in USDC, so transaction costs are dollar-priced and predictable rather than swinging with a
          volatile native asset. Consensus runs on Malachite, a Tendermint-based BFT engine with deterministic
          sub-second finality. The chain ships with a built-in FX engine for 24/7 payment-versus-payment stablecoin
          settlement and opt-in, compliance-friendly privacy — the design targets institutional settlement rather than
          general-purpose DeFi. Per the whitepaper, initial ARC supply is 10B tokens: 60% ecosystem, 25% Circle, 15%
          long-term reserves.
        </p>
        <p className="faint" style={{ fontSize: 12.5, marginBottom: 0 }}>
          Arc Early is an independent project and is not affiliated with, endorsed by, or operated by Circle.
        </p>
      </section>
    </div>
  );
}
