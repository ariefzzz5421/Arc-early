import UpdatesFeed from "@/components/UpdatesFeed";
import { PageHead, Stat, Notice } from "@/components/ui";
import { NETWORK_STATS } from "@/lib/data";

export const metadata = {
  title: "Mainnet watch",
  description: "Dated, sourced updates on Circle's Arc blockchain — testnet milestones, ecosystem launches and the mainnet beta window.",
};

export default function UpdatesPage() {
  return (
    <div className="shell">
      <PageHead eyebrow="Mainnet watch" title="Latest from Arc">
        Every entry is dated and links to its source. Arc is still on public testnet — the mainnet beta window is summer
        2026, gated on testnet results and regulatory readiness, and Circle has not published mainnet network parameters.
      </PageHead>

      <div className="grid stats" style={{ marginBottom: 24 }}>
        {NETWORK_STATS.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      <Notice>
        <b>Scam watch:</b> third-party sites advertising live Arc mainnet access or an &ldquo;Arc Bridge&rdquo; are
        fraudulent. There is no mainnet to bridge to yet — verify every endpoint against docs.arc.io before connecting a
        wallet.
      </Notice>

      <div style={{ marginTop: 22, paddingBottom: 30 }}>
        <UpdatesFeed />
      </div>
    </div>
  );
}
