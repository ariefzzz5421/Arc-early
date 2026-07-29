import SafeBridge from "@/components/SafeBridge";
import { Notice, PageHead, Stat } from "@/components/ui";

export const metadata = {
  title: "Arc Testnet USDC Bridge",
  description:
    "Bridge testnet USDC between Arc Testnet, Base Sepolia, Ethereum Sepolia and Arbitrum Sepolia using Circle CCTP V2.",
};

const FLOW = [
  {
    step: "01",
    title: "Connect your own wallet",
    body: "Rabby, Zerion, MetaMask, Coinbase and other EIP-1193 wallets stay self-custodial. Arc Early never receives a key.",
  },
  {
    step: "02",
    title: "Estimate before signing",
    body: "Circle Bridge Kit validates the route and returns protocol, Forwarder and gas costs before any transaction starts.",
  },
  {
    step: "03",
    title: "Approve and burn USDC",
    body: "Your wallet signs only on the selected source testnet. SLOW is the default; FAST has an explicit fee cap.",
  },
  {
    step: "04",
    title: "Forward and verify the mint",
    body: "Circle Forwarder submits the destination mint, so a new Arc user does not need an existing Arc gas balance.",
  },
];

export default function BridgePage() {
  return (
    <div className="shell">
      <PageHead
        eyebrow="Bridge"
        title="Bridge USDC to Arc safely"
        actions={[
          <span className="badge live" key="testnet">
            Testnet live
          </span>,
          <span className="badge info" key="protocol">
            Circle CCTP V2
          </span>,
          <span className="badge" key="asset">
            Native USDC only
          </span>,
        ]}
      >
        Move testnet USDC between Arc Testnet and supported Sepolia networks. The route is restricted to Circle&apos;s
        canonical burn-and-mint path, shows a live estimate before signing, and uses Circle Forwarder for the destination
        mint.
      </PageHead>

      <SafeBridge />

      <div className="grid stats bridge-stats">
        <Stat label="Arc network" value="Testnet" sub="chain ID 5042002" kind="good" />
        <Stat label="Canonical route" value="CCTP V2" sub="no wrapped USDC" kind="info" />
        <Stat label="Destination gas" value="Forwarded" sub="fee shown before signing" kind="info" />
        <Stat label="Mainnet funds" value="Blocked" sub="no Arc mainnet route in this UI" kind="good" />
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow">Verified flow</div>
            <h2>What happens after you click Bridge</h2>
          </div>
          <a
            className="btn sm"
            href="https://docs.arc.io/app-kit/quickstarts/bridge-tokens-across-blockchains"
            target="_blank"
            rel="noreferrer"
          >
            Circle quickstart ↗
          </a>
        </div>

        <div className="grid bridge-flow-grid">
          {FLOW.map((item) => (
            <article className="card bridge-flow-card" key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card card-pad bridge-source-note">
        <div>
          <div className="eyebrow">Why this route</div>
          <h3>CCTP for one bridge; Gateway for a reusable unified balance</h3>
          <p className="muted">
            The deposit → indexer wait → burn intent → attestation → mint flow in the supplied screenshot describes
            Circle Gateway. That is useful when a user wants to deposit once and spend a unified USDC balance repeatedly.
            For a direct wallet-to-wallet bridge, Circle&apos;s Bridge Kit is the smaller and safer path because it
            orchestrates CCTP approval, burn, attestation and mint with built-in recovery.
          </p>
        </div>
        <div className="bridge-source-links">
          <a href="https://docs.arc.io/app-kit/bridge" target="_blank" rel="noreferrer">
            Arc Bridge Kit docs ↗
          </a>
          <a
            href="https://developers.circle.com/cctp/concepts/supported-chains-and-domains"
            target="_blank"
            rel="noreferrer"
          >
            Circle supported domains ↗
          </a>
          <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer">
            Official Arcscan ↗
          </a>
          <a href="https://arc.exploreme.pro/" target="_blank" rel="noreferrer">
            Community explorer ↗
          </a>
        </div>
      </section>

      <Notice>
        <b>Testnet only.</b> Testnet USDC has no cash value. The community explorer can help inspect activity, but Arc
        Early takes network and contract truth only from Arc and Circle documentation, then links final transactions to
        the official Arcscan explorer.
      </Notice>

      <div style={{ height: 30 }} />
    </div>
  );
}
