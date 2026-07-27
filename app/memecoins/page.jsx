import MemecoinMarket from "@/components/MemecoinMarket";
import { RadarDexLogo } from "@/components/Logos";
import { Notice, PageHead } from "@/components/ui";
import { fetchRadarDexTokens } from "@/lib/radardex";

export const metadata = {
  title: "Memecoins",
  description: "Live community-token market data from RadarDex, with price, liquidity, volume and activity.",
};

export default async function MemecoinsPage() {
  const data = await fetchRadarDexTokens();

  return (
    <div className="shell">
      <PageHead
        eyebrow="Live market data"
        title="Arc memecoin radar"
        actions={[
          <span className="badge live" key="live">
            <span className="dot" /> RadarDex feed
          </span>,
          <span className="badge" key="refresh">
            60s refresh
          </span>,
        ]}
      >
        Track community tokens indexed by RadarDex. Every row is fetched from the data service used by radardex.io;
        Arc Early does not replace unavailable values with sample numbers.
      </PageHead>

      <div className="card card-pad radar-source">
        <RadarDexLogo size={48} />
        <div>
          <h2>RadarDex live index</h2>
          <p className="muted">
            Search, sort and open a contract directly in RadarDex. Token names, symbols and icons are user-supplied and
            are not endorsements.
          </p>
        </div>
        <a className="btn" href="https://radardex.io/" target="_blank" rel="noreferrer">
          Open RadarDex ↗
        </a>
      </div>

      <Notice>
        <b>High risk:</b> Arc&apos;s official site still says the network is on public testnet ahead of mainnet launch.
        RadarDex labels its market as mainnet, so verify the network and contract in the official Arc explorer before
        connecting a wallet. Never treat an unverified symbol such as “USDC” as proof of authenticity.
      </Notice>

      <div style={{ marginTop: 18, paddingBottom: 30 }}>
        <MemecoinMarket initialData={data} />
      </div>
    </div>
  );
}
