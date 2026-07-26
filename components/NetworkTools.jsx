"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import { arcTestnet } from "@/lib/chains";

export function CopyRow({ label, value, href }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid" style={{ gap: 6 }}>
      <div className="faint" style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
      <div className="copy-field">
        {href ? (
          <a className="mono" href={href} target="_blank" rel="noreferrer" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {value}
          </a>
        ) : (
          <span className="mono">{value}</span>
        )}
        <button className="btn sm" type="button" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/**
 * Uses wagmi's switchChain — the connector issues wallet_switchEthereumChain and
 * falls back to wallet_addEthereumChain with the Arc chain definition when the
 * wallet doesn't know the network yet. The wallet still prompts for approval.
 */
export function AddTestnetButton() {
  const { isConnected, chainId } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();
  const onArc = chainId === arcTestnet.id;

  if (!isConnected) {
    return (
      <div className="grid" style={{ gap: 8 }}>
        <ConnectButton label="Connect wallet to add Arc" showBalance={false} chainStatus="none" />
        <div className="faint" style={{ fontSize: 12.5 }}>
          Connect first, then Arc Early can hand the network details to your wallet.
        </div>
      </div>
    );
  }

  return (
    <div className="grid" style={{ gap: 8 }}>
      <button
        className="btn primary"
        type="button"
        disabled={isPending || onArc}
        onClick={() => switchChain({ chainId: arcTestnet.id })}
      >
        {onArc ? "Connected to Arc Testnet" : isPending ? "Check your wallet…" : "Add / switch to Arc Testnet"}
      </button>
      {error && <div className="faint" style={{ fontSize: 12.5 }}>{error.shortMessage || error.message}</div>}
    </div>
  );
}
