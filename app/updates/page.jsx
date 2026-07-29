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
        <b>Scam watch:</b> Arc mainnet is not public. Only use testnet routes whose chain, token and contracts match
        docs.arc.io and Circle documentation; reject any wallet prompt that claims to move real funds to Arc mainnet.
      </Notice>

      <div style={{ marginTop: 22, paddingBottom: 30 }}>
        <UpdatesFeed />
      </div>
    </div>
  );
}
