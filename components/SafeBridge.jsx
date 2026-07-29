"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { ChainIcon, UsdcLogo } from "./Logos";
import { Notice } from "./ui";
import { arcTestnet, USDC_ADDRESS } from "@/lib/chains";
import { hasWalletConnect } from "@/lib/wagmi";

const EXTERNAL_CHAINS = [
  {
    key: "base",
    name: "Base Sepolia",
    kitChain: "Base_Sepolia",
    chainId: 84532,
    gas: "ETH",
    usdc: USDC_ADDRESS.base,
    explorer: "https://sepolia.basescan.org",
    icon: { key: "base", name: "Base Sepolia", color: "#1768ff", short: "B" },
  },
  {
    key: "ethereum",
    name: "Ethereum Sepolia",
    kitChain: "Ethereum_Sepolia",
    chainId: 11155111,
    gas: "ETH",
    usdc: USDC_ADDRESS.ethereum,
    explorer: "https://sepolia.etherscan.io",
    icon: { key: "ethereum", name: "Ethereum Sepolia", color: "#627eea", short: "E" },
  },
  {
    key: "arbitrum",
    name: "Arbitrum Sepolia",
    kitChain: "Arbitrum_Sepolia",
    chainId: 421614,
    gas: "ETH",
    usdc: USDC_ADDRESS.arbitrum,
    explorer: "https://sepolia.arbiscan.io",
    icon: { key: "arbitrum", name: "Arbitrum Sepolia", color: "#28a0f0", short: "A" },
  },
];

const ARC_CHAIN = {
  key: "arc",
  name: "Arc Testnet",
  kitChain: "Arc_Testnet",
  chainId: arcTestnet.id,
  gas: "USDC",
  usdc: undefined,
  explorer: "https://testnet.arcscan.app",
  icon: { key: "arc", name: "Arc Testnet", color: "#8fc0f5", short: "A" },
};

const STEP_LABELS = {
  approve: "Approve USDC",
  burn: "Burn on source",
  fetchAttestation: "Circle attestation",
  mint: "Mint on destination",
  forward: "Circle Forwarder",
};

const TRUSTED_EXPLORER_HOSTS = new Set([
  "testnet.arcscan.app",
  "sepolia.basescan.org",
  "sepolia.etherscan.io",
  "sepolia.arbiscan.io",
]);

function shortAddress(value) {
  if (!value) return "Not connected";
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

function formatBalance(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "0";
  return parsed.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

function sanitizeAmount(value) {
  const next = value.replace(/[^\d.]/g, "");
  const [whole = "", ...parts] = next.split(".");
  const decimals = parts.join("").slice(0, 6);
  return parts.length ? `${whole}.${decimals}` : whole;
}

function friendlyError(error) {
  const message =
    error?.shortMessage || error?.details || error?.message || (typeof error === "string" ? error : "Unknown error");
  const lower = String(message).toLowerCase();

  if (error?.code === 4001 || lower.includes("user rejected") || lower.includes("user denied")) {
    return "You rejected the wallet request. No funds moved.";
  }
  if (lower.includes("insufficient") && lower.includes("balance")) {
    return "Insufficient balance for the amount and network fee.";
  }
  if (lower.includes("max fee must be less than amount")) {
    return "The amount is too small for FAST mode. Use SLOW mode or enter a larger amount.";
  }
  if (lower.includes("switch") && lower.includes("chain")) {
    return "The wallet could not switch networks. Add the source testnet, then try again.";
  }

  return String(message).slice(0, 280);
}

function safeExplorerUrl(value) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && TRUSTED_EXPLORER_HOSTS.has(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function normalizeActivity(payload, id) {
  const values = payload?.values ?? {};
  const data = values?.data ?? {};
  const method = payload?.method || values?.name || "bridge";

  return {
    id,
    method,
    label: STEP_LABELS[method] || method.replace(/([A-Z])/g, " $1"),
    state: values?.state || data?.status || "pending",
    txHash: values?.txHash || data?.txHash || null,
    explorerUrl: safeExplorerUrl(values?.explorerUrl || data?.explorerUrl),
    errorMessage: values?.errorMessage || data?.errorMessage || null,
  };
}

function estimateLines(estimate) {
  const fees = Array.isArray(estimate?.fees) ? estimate.fees : [];
  const gasFees = Array.isArray(estimate?.gasFees) ? estimate.gasFees : [];

  return [
    ...fees.map((fee, index) => ({
      key: `fee-${index}`,
      label:
        fee?.type === "provider"
          ? "CCTP protocol"
          : fee?.type === "forwarder"
            ? "Circle Forwarder"
            : fee?.type || "Bridge fee",
      amount: fee?.amount ?? "—",
      token: fee?.token ?? "USDC",
    })),
    ...gasFees.map((fee, index) => ({
      key: `gas-${index}`,
      label: `Gas${fee?.chain ? ` · ${fee.chain}` : ""}`,
      amount: fee?.amount ?? fee?.gasFee ?? "—",
      token: fee?.token ?? fee?.currency ?? "",
    })),
  ];
}

export default function SafeBridge() {
  const [direction, setDirection] = useState("in");
  const [counterpartyKey, setCounterpartyKey] = useState("base");
  const [amount, setAmount] = useState("10");
  const [speed, setSpeed] = useState("SLOW");
  const [maxFee, setMaxFee] = useState("2");
  const [estimate, setEstimate] = useState(null);
  const [estimateFingerprint, setEstimateFingerprint] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");
  const [activity, setActivity] = useState([]);
  const [result, setResult] = useState(null);

  const kitRef = useRef(null);
  const adapterRef = useRef(null);
  const paramsRef = useRef(null);
  const eventHandlerRef = useRef(null);
  const eventIdRef = useRef(0);

  const { address, chainId, connector, isConnected } = useAccount();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();

  const counterparty = EXTERNAL_CHAINS.find((chain) => chain.key === counterpartyKey) || EXTERNAL_CHAINS[0];
  const sourceChain = direction === "in" ? counterparty : ARC_CHAIN;
  const destinationChain = direction === "in" ? ARC_CHAIN : counterparty;

  const balance = useBalance({
    address,
    chainId: sourceChain.chainId,
    token: sourceChain.usdc,
    query: {
      enabled: Boolean(address),
      refetchInterval: phase === "bridging" ? 5_000 : 20_000,
    },
  });

  const numericAmount = Number(amount);
  const numericBalance = Number(balance.data?.formatted ?? 0);
  const arcGasReserve = sourceChain.key === "arc" ? 0.05 : 0;
  const spendableBalance = Math.max(0, numericBalance - arcGasReserve);
  const validAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const exceedsBalance = Boolean(balance.data && validAmount && numericAmount > spendableBalance);
  const wrongNetwork = isConnected && chainId !== sourceChain.chainId;
  const busy = phase === "estimating" || phase === "bridging" || phase === "retrying" || isSwitching;

  const fingerprint = useMemo(
    () => [direction, counterpartyKey, amount, speed, speed === "FAST" ? maxFee : "", address || ""].join("|"),
    [address, amount, counterpartyKey, direction, maxFee, speed]
  );

  useEffect(() => {
    if (estimateFingerprint && estimateFingerprint !== fingerprint) {
      setEstimate(null);
      setEstimateFingerprint("");
      setConfirmed(false);
      setResult(null);
      setActivity([]);
      setPhase("idle");
      setError("");
    }
  }, [estimateFingerprint, fingerprint]);

  useEffect(() => {
    return () => {
      if (kitRef.current && eventHandlerRef.current) {
        kitRef.current.off("*", eventHandlerRef.current);
      }
    };
  }, []);

  async function getKitAndAdapter() {
    if (!connector || !address) throw new Error("Connect a wallet first.");

    if (chainId !== sourceChain.chainId) {
      await switchChainAsync({ chainId: sourceChain.chainId });
    }

    const provider = await connector.getProvider({ chainId: sourceChain.chainId });
    if (!provider?.request) {
      throw new Error("The selected wallet does not expose a compatible EIP-1193 provider.");
    }

    const [{ BridgeKit }, { createViemAdapterFromProvider }] = await Promise.all([
      import("@circle-fin/bridge-kit"),
      import("@circle-fin/adapter-viem-v2"),
    ]);

    if (!kitRef.current) {
      const kit = new BridgeKit();
      const handler = (payload) => {
        const item = normalizeActivity(payload, ++eventIdRef.current);
        setActivity((current) => [...current.slice(-11), item]);
      };
      kit.on("*", handler);
      kitRef.current = kit;
      eventHandlerRef.current = handler;
    }

    const adapter = await createViemAdapterFromProvider({ provider });
    adapterRef.current = adapter;
    return { kit: kitRef.current, adapter };
  }

  function createParams(adapter) {
    return {
      from: { adapter, chain: sourceChain.kitChain },
      to: {
        chain: destinationChain.kitChain,
        recipientAddress: address,
        useForwarder: true,
      },
      amount,
      token: "USDC",
      config: {
        transferSpeed: speed,
        batchTransactions: false,
        ...(speed === "FAST" ? { maxFee } : {}),
      },
    };
  }

  async function prepareEstimate() {
    setError("");
    setResult(null);
    setActivity([]);
    setConfirmed(false);

    if (!isConnected) {
      setError("Connect a wallet first.");
      return;
    }
    if (!validAmount) {
      setError("Enter a valid USDC amount.");
      return;
    }
    if (exceedsBalance) {
      setError(
        sourceChain.key === "arc"
          ? "Leave at least 0.05 USDC on Arc for source-chain gas."
          : "The bridge amount is higher than your source USDC balance."
      );
      return;
    }
    if (speed === "FAST" && (!Number.isFinite(Number(maxFee)) || Number(maxFee) <= 0)) {
      setError("Set a positive FAST fee cap.");
      return;
    }

    setPhase("estimating");
    try {
      const { kit, adapter } = await getKitAndAdapter();
      const params = createParams(adapter);
      const nextEstimate = await kit.estimate(params);
      paramsRef.current = params;
      setEstimate(nextEstimate);
      setEstimateFingerprint(fingerprint);
      setPhase("review");
    } catch (nextError) {
      setError(friendlyError(nextError));
      setPhase("idle");
    }
  }

  async function executeBridge() {
    if (!confirmed || estimateFingerprint !== fingerprint || !paramsRef.current) {
      setError("Review a fresh estimate and confirm the testnet warning first.");
      return;
    }

    setError("");
    setResult(null);
    setActivity([]);
    setPhase("bridging");

    try {
      if (chainId !== sourceChain.chainId) {
        await switchChainAsync({ chainId: sourceChain.chainId });
      }
      const nextResult = await kitRef.current.bridge(paramsRef.current);
      setResult(nextResult);
      setPhase(nextResult?.state === "success" ? "success" : "failed");
      balance.refetch();
    } catch (nextError) {
      setError(friendlyError(nextError));
      setPhase("failed");
    }
  }

  async function retryBridge() {
    if (!result || !kitRef.current || !adapterRef.current) return;
    setError("");
    setPhase("retrying");

    try {
      const nextResult = await kitRef.current.retry(result, {
        from: adapterRef.current,
        to: adapterRef.current,
      });
      setResult(nextResult);
      setPhase(nextResult?.state === "success" ? "success" : "failed");
      balance.refetch();
    } catch (nextError) {
      setError(friendlyError(nextError));
      setPhase("failed");
    }
  }

  function flipDirection() {
    setDirection((current) => (current === "in" ? "out" : "in"));
    setEstimate(null);
    setEstimateFingerprint("");
    setConfirmed(false);
    setResult(null);
    setActivity([]);
    setError("");
    setPhase("idle");
  }

  function setMaximum() {
    const value = sourceChain.key === "arc" ? spendableBalance : numericBalance;
    setAmount(Math.max(0, value).toFixed(6).replace(/\.?0+$/, ""));
  }

  const lines = estimateLines(estimate);
  const usdcFees = lines
    .filter((line) => String(line.token).toUpperCase() === "USDC")
    .reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
  const estimatedReceive = estimate ? Math.max(0, numericAmount - usdcFees) : null;
  const resultSteps = Array.isArray(result?.steps) ? result.steps : [];
  const visibleActivity =
    activity.length > 0
      ? activity
      : resultSteps.map((step, index) =>
          normalizeActivity({ method: step.name, values: step }, `result-${index}`),
        );

  return (
    <div className="bridge-lab">
      <section className="card bridge-panel">
        <div className="bridge-panel-head">
          <div>
            <div className="eyebrow">Circle CCTP V2 · testnet only</div>
            <h2>Move USDC {direction === "in" ? "into" : "out of"} Arc</h2>
          </div>
          <ConnectButton
            label="Connect wallet"
            showBalance={false}
            chainStatus="icon"
            accountStatus={{ smallScreen: "avatar", largeScreen: "address" }}
          />
        </div>

        <div className="wallet-support">
          <span>Wallet support</span>
          <b>Rabby</b>
          <b>Zerion</b>
          <b>MetaMask</b>
          <b>Coinbase</b>
          <b className={hasWalletConnect ? "wallet-ready" : ""}>
            {hasWalletConnect ? "WalletConnect ready" : "Browser extensions"}
          </b>
        </div>

        <div className="bridge-route-box">
          <div className="bridge-chain-card">
            <span className="faint">From</span>
            <div>
              <ChainIcon chain={sourceChain.icon} size={30} />
              <strong>{sourceChain.name}</strong>
            </div>
            <small>Gas: {sourceChain.gas}</small>
          </div>

          <button className="bridge-flip" type="button" onClick={flipDirection} disabled={busy} aria-label="Flip route">
            ⇄
          </button>

          <div className="bridge-chain-card">
            <span className="faint">To</span>
            <div>
              <ChainIcon chain={destinationChain.icon} size={30} />
              <strong>{destinationChain.name}</strong>
            </div>
            <small>Minted by Circle Forwarder</small>
          </div>
        </div>

        <label className="bridge-field">
          <span>Other testnet</span>
          <select
            value={counterpartyKey}
            onChange={(event) => setCounterpartyKey(event.target.value)}
            disabled={busy}
          >
            {EXTERNAL_CHAINS.map((chain) => (
              <option key={chain.key} value={chain.key}>
                {chain.name}
              </option>
            ))}
          </select>
        </label>

        <div className="bridge-field">
          <div className="bridge-field-label">
            <span>Amount</span>
            <span>
              Balance: {balance.isLoading ? "checking…" : `${formatBalance(balance.data?.formatted)} USDC`}
            </span>
          </div>
          <div className={`bridge-amount ${exceedsBalance ? "invalid" : ""}`}>
            <input
              value={amount}
              inputMode="decimal"
              onChange={(event) => setAmount(sanitizeAmount(event.target.value))}
              disabled={busy}
              aria-label="USDC amount"
            />
            <button type="button" className="chip on" onClick={setMaximum} disabled={!balance.data || busy}>
              Max
            </button>
            <span>
              <UsdcLogo size={18} /> USDC
            </span>
          </div>
          {sourceChain.key === "arc" && (
            <small className="faint">Max automatically keeps 0.05 USDC on Arc for gas.</small>
          )}
        </div>

        <div className="bridge-field">
          <span>Transfer speed</span>
          <div className="bridge-segments">
            <button
              type="button"
              className={speed === "SLOW" ? "on" : ""}
              onClick={() => setSpeed("SLOW")}
              disabled={busy}
            >
              <b>SLOW</b>
              <small>No CCTP fast fee</small>
            </button>
            <button
              type="button"
              className={speed === "FAST" ? "on" : ""}
              onClick={() => setSpeed("FAST")}
              disabled={busy}
            >
              <b>FAST</b>
              <small>Fee deducted from USDC</small>
            </button>
          </div>
        </div>

        {speed === "FAST" && (
          <label className="bridge-field">
            <span>Maximum CCTP fee</span>
            <div className="bridge-amount compact">
              <input
                value={maxFee}
                inputMode="decimal"
                onChange={(event) => setMaxFee(sanitizeAmount(event.target.value))}
                disabled={busy}
                aria-label="Maximum CCTP fee"
              />
              <span>USDC cap</span>
            </div>
          </label>
        )}

        <div className="bridge-summary">
          <div>
            <span>Recipient</span>
            <b className="mono">{shortAddress(address)}</b>
          </div>
          <div>
            <span>Asset</span>
            <b>Native USDC only</b>
          </div>
          <div>
            <span>Destination mint</span>
            <b>Circle Forwarder</b>
          </div>
        </div>

        {wrongNetwork && (
          <button
            className="btn wide"
            type="button"
            disabled={busy}
            onClick={() => switchChainAsync({ chainId: sourceChain.chainId }).catch((nextError) => setError(friendlyError(nextError)))}
          >
            {isSwitching ? "Check your wallet…" : `Switch to ${sourceChain.name}`}
          </button>
        )}

        <button
          className="btn primary wide bridge-primary"
          type="button"
          disabled={busy || !isConnected || !validAmount || exceedsBalance}
          onClick={prepareEstimate}
        >
          {phase === "estimating" ? "Estimating with Circle…" : estimate ? "Refresh estimate" : "Review fees & route"}
        </button>

        {error && (
          <div className="bridge-error" role="alert">
            <b>Bridge stopped safely.</b>
            <span>{error}</span>
          </div>
        )}
      </section>

      <aside className="grid bridge-aside">
        <section className="card card-pad">
          <div className="eyebrow">Pre-flight check</div>
          {!estimate ? (
            <div className="bridge-empty">
              <span>1</span>
              <p>Connect, choose a route, then request a live Circle estimate. No wallet signature happens here.</p>
            </div>
          ) : (
            <>
              <div className="bridge-receive">
                <span>Estimated receive</span>
                <strong>{formatBalance(estimatedReceive)} USDC</strong>
                <small>Exact amount is finalized by Circle after protocol and Forwarder fees.</small>
              </div>

              <div className="bridge-fees">
                {lines.length ? (
                  lines.map((line) => (
                    <div className="kv" key={line.key}>
                      <span className="k">{line.label}</span>
                      <span className="v mono">
                        {line.amount} {line.token}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="kv">
                    <span className="k">Circle estimate</span>
                    <span className="v">No itemized fee returned</span>
                  </div>
                )}
              </div>

              <label className="bridge-confirm">
                <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
                <span>
                  I understand this uses <b>testnet USDC only</b>, and I checked the route, amount, wallet, and fee cap.
                </span>
              </label>

              <button
                className="btn primary wide"
                type="button"
                disabled={!confirmed || busy || estimateFingerprint !== fingerprint}
                onClick={executeBridge}
              >
                {phase === "bridging" ? "Bridge in progress…" : `Bridge ${amount || "0"} USDC`}
              </button>
            </>
          )}
        </section>

        <section className="card card-pad">
          <div className="section-head compact-head">
            <div>
              <div className="eyebrow">Transaction lifecycle</div>
              <h3>Approve → burn → attest → mint</h3>
            </div>
            <span className={`badge ${phase === "success" ? "live" : phase === "failed" ? "risk" : "info"}`}>
              {phase === "success" ? "Complete" : phase === "failed" ? "Needs attention" : "Waiting"}
            </span>
          </div>

          {visibleActivity.length === 0 ? (
            <p className="faint bridge-lifecycle-empty">
              Circle Bridge Kit will publish each step here. Keep this tab open until the destination mint is complete.
            </p>
          ) : (
            <div className="bridge-activity">
              {visibleActivity.map((item) => (
                <div className="bridge-activity-row" key={item.id}>
                  <span className={`bridge-state ${item.state}`}>{item.state === "success" ? "✓" : "•"}</span>
                  <div>
                    <b>{item.label}</b>
                    <small>{item.state}</small>
                  </div>
                  {item.explorerUrl && (
                    <a href={item.explorerUrl} target="_blank" rel="noreferrer">
                      Explorer ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {phase === "success" && (
            <Notice tone="blue">
              <b>Bridge complete.</b> Verify the final mint in Arcscan before using the balance elsewhere.
            </Notice>
          )}

          {phase === "failed" && result && (
            <button className="btn wide" type="button" onClick={retryBridge} disabled={busy}>
              {phase === "retrying" ? "Retrying…" : "Retry incomplete step"}
            </button>
          )}
        </section>

        <Notice>
          <b>Never enter a seed phrase or private key.</b> Arc Early asks only for wallet connection and transaction
          signatures. Reject any prompt whose chain, amount, or contract does not match the review above.
        </Notice>
      </aside>
    </div>
  );
}
