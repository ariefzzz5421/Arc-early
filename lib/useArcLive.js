"use client";

import { useEffect, useRef, useState } from "react";
import { createPublicClient, webSocket, http, formatUnits } from "viem";
import { arcTestnet, ARC_HTTP, ARC_WS } from "./chains";

const HISTORY = 10;

/**
 * Streams Arc testnet head blocks over the websocket endpoint
 * (eth_subscribe → newHeads) and degrades to HTTP polling if the socket cannot
 * be established. Returns plain JS values — no BigInts leak into React state.
 */
export function useArcLive() {
  const [state, setState] = useState({
    status: "connecting", // connecting | live | error
    transport: "websocket", // websocket | http
    blocks: [],
    gasPriceWei: null,
    error: null,
  });
  const seen = useRef(new Set());

  useEffect(() => {
    let cancelled = false;
    let stopWatching;
    let gasTimer;
    let fallbackStarted = false;

    const stopCurrentTransport = () => {
      clearInterval(gasTimer);
      gasTimer = undefined;
      try {
        stopWatching?.();
      } catch {
        // The transport may already be closed after a socket error.
      }
      stopWatching = undefined;
    };

    const push = (block, transport) => {
      if (cancelled) return;
      const number = Number(block.number);
      if (!Number.isSafeInteger(number)) return;
      if (seen.current.has(number)) return;
      seen.current.add(number);
      while (seen.current.size > HISTORY * 3) {
        const oldest = seen.current.values().next().value;
        seen.current.delete(oldest);
      }

      const entry = {
        number,
        hash: block.hash,
        timestamp: Number(block.timestamp),
        txs: Array.isArray(block.transactions) ? block.transactions.length : 0,
        gasUsed: Number(block.gasUsed ?? 0),
        gasLimit: Number(block.gasLimit ?? 0),
        at: Date.now(),
      };

      setState((s) => ({
        ...s,
        status: "live",
        transport,
        error: null,
        blocks: [entry, ...s.blocks].slice(0, HISTORY),
      }));
    };

    const start = (transport) => {
      if (cancelled) return;
      stopCurrentTransport();
      const client = createPublicClient({
        chain: arcTestnet,
        transport:
          transport === "websocket"
            ? webSocket(ARC_WS, { retryCount: 2, reconnect: { attempts: 5, delay: 2000 } })
            : http(ARC_HTTP),
      });

      stopWatching = client.watchBlocks({
        emitOnBegin: true,
        includeTransactions: false,
        poll: transport === "http",
        pollingInterval: 2000,
        onBlock: (block) => push(block, transport),
        onError: (err) => {
          if (cancelled) return;
          if (transport === "websocket") {
            if (fallbackStarted) return;
            fallbackStarted = true;
            // Socket blocked (proxy, offline) — fall back to one HTTP poller.
            setState((s) => ({ ...s, transport: "http" }));
            start("http");
            return;
          }
          setState((s) => ({ ...s, status: "error", error: err?.message ?? "connection failed" }));
        },
      });

      const readGas = async () => {
        try {
          const gp = await client.getGasPrice();
          if (!cancelled) setState((s) => ({ ...s, gasPriceWei: gp.toString() }));
        } catch {
          /* non-fatal */
        }
      };
      readGas();
      gasTimer = setInterval(readGas, 15000);
    };

    start("websocket");

    return () => {
      cancelled = true;
      stopCurrentTransport();
    };
  }, []);

  const { blocks } = state;
  const head = blocks[0] ?? null;

  // average interval between the blocks we actually received
  let intervalMs = null;
  if (blocks.length > 1) {
    const spans = [];
    for (let i = 0; i < blocks.length - 1; i++) spans.push(blocks[i].at - blocks[i + 1].at);
    intervalMs = spans.reduce((a, b) => a + b, 0) / spans.length;
  }

  const windowTxs = blocks.reduce((a, b) => a + b.txs, 0);
  const windowMs = blocks.length > 1 ? blocks[0].at - blocks[blocks.length - 1].at : 0;
  const tps = windowMs > 0 ? (windowTxs / (windowMs / 1000)) : null;

  const gasPriceUsdc =
    state.gasPriceWei != null ? Number(formatUnits(BigInt(state.gasPriceWei), arcTestnet.nativeCurrency.decimals)) : null;

  return { ...state, head, intervalMs, tps, windowTxs, gasPriceUsdc };
}
