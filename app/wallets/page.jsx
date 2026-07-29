import WalletTracker from "@/components/WalletTracker";
import { Notice, PageHead } from "@/components/ui";
import { SEED_WALLETS } from "@/lib/wallets";

export const metadata = {
  title: "Wallet tracker",
  description:
    "Track whale and trader wallets on Arc live — balances, all-time transaction counts and every matched transaction as it lands.",
};

export default function WalletsPage() {
  return (
    <div className="shell">
      <PageHead
        eyebrow="Live wallet tracking"
        title="Whale & trader tracker"
        actions={[
          <span className="badge live" key="live">
            <span className="dot" /> newHeads stream
          </span>,
          <span className="badge info" key="seed">
            {SEED_WALLETS.length} seeded wallets
          </span>,
          <span className="badge" key="storage">
            Browser-local watchlist
          </span>,
        ]}
      >
        Every tracked address is matched against each incoming Arc block over the RPC websocket, so activity is counted
        as it happens. Balances and all-time transaction counts are read straight from the chain — Arc Early does not
        substitute sample numbers when a value cannot be read.
      </PageHead>

      <Notice tone="blue">
        The four seeded wallets come from RadarDex whale profiles, and the <b>Reported</b> column is the portfolio size
        quoted there. RadarDex labels its market as Arc mainnet while this app reads Arc&apos;s public testnet, so the
        reported figure and the live on-chain balance describe different networks and are kept in separate columns —
        never summed.
      </Notice>

      <div style={{ marginTop: 18, paddingBottom: 30 }}>
        <WalletTracker />
      </div>
    </div>
  );
}
