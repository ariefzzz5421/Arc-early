"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPublicClient, fallback, formatUnits, http, webSocket } from "viem";
import { ARC_HTTP, ARC_HTTP_FALLBACKS, ARC_WS, arcTestnet } from "./chains";

const ACTIVITY_LIMIT = 60;
const BALANCE_INTERVAL_MS = 15_000;
const DECIMALS = arcTestnet.nativeCurrency.decimals;

const toUsdc = (wei) => Number(formatUnits(wei, DECIMALS));

const emptyCounters = () => ({
  txs: 0,
  sent: 0,
  received: 0,
  inUsdc: 0,
  outUsdc: 0,
  lastBlock: null,
  lastAt: null,
});

/** Read-only HTTP client used for balances/nonces, batched into one request. */
function createReadClient() {
  const endpoints = [ARC_HTTP, ...ARC_HTTP_FALLBACKS];
  return createPublicClient({
    chain: arcTestnet,
    transport: fallback(endpoints.map((url) => http(url, { batch: true }))),
  });
}

/**
 * Live wallet tracker.
 *
 * Subscribes to Arc head blocks over the websocket endpoint (eth_subscribe →
 * newHeads, full transaction bodies) and matches every transaction against the
 * tracked address set, so activity is counted as it lands rather than polled
 * after the fact. If the socket cannot be opened the same watcher degrades to
 * HTTP polling. Balances and all-time transaction counts come from a separate
 * batched HTTP client.
 *
 * No BigInt reaches React state, and nothing here invents a value: an address
 * with no reachable data stays `null` rather than falling back to a sample.
 */
export function useWalletTracker(wallets) {
  const addresses = useMemo(
    () => wallets.map((wallet) => wallet.address.toLowerCase()),
    [wallets],
  );
  const addressKey = addresses.join(",");

  const addressRef = useRef(new Set(addresses));
  useEffect(() => {
    addressRef.current = new Set(addresses);
  }, [addressKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const [stream, setStream] = useState({
    status: "connecting", // connecting | live | error
    transport: "websocket", // websocket | http
    error: null,
    head: null,
    scanned: 0,
    startedAt: null,
    activity: [],
    counters: {},
  });

  const [balances, setBalances] = useState({});
  const [balanceState, setBalanceState] = useState({ status: "loading", error: null, updatedAt: null });

  const readClientRef = useRef(null);
  const refreshRef = useRef(() => {});

  /* ---------------- balances + all-time tx counts ---------------- */

  const refreshBalances = useCallback(async () => {
    const client = readClientRef.current;
    const list = addressRef.current;
    if (!client || list.size === 0) {
      setBalanceState({ status: "ready", error: null, updatedAt: Date.now() });
      return;
    }

    const targets = [...list];
    const results = await Promise.all(
      targets.map(async (address) => {
        try {
          const [balance, nonce] = await Promise.all([
            client.getBalance({ address }),
            client.getTransactionCount({ address }),
          ]);
          return [address, { balanceUsdc: toUsdc(balance), nonce: Number(nonce), error: false }];
        } catch {
          return [address, null];
        }
      }),
    );

    const next = {};
    let failures = 0;
    for (const [address, value] of results) {
      if (value) next[address] = value;
      else failures += 1;
    }

    setBalances((current) => ({ ...current, ...next }));
    setBalanceState({
      status: failures === targets.length ? "error" : "ready",
      error: failures > 0 ? `${failures} of ${targets.length} wallets could not be read` : null,
      updatedAt: Date.now(),
    });
  }, []);

  useEffect(() => {
    refreshRef.current = refreshBalances;
  }, [refreshBalances]);

  useEffect(() => {
    if (!readClientRef.current) readClientRef.current = createReadClient();
    let cancelled = false;

    const tick = () => {
      if (!cancelled) refreshBalances();
    };

    tick();
    const timer = setInterval(tick, BALANCE_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [addressKey, refreshBalances]);

  // Drop cached rows for wallets that are no longer tracked.
  useEffect(() => {
    setBalances((current) => {
      const kept = {};
      for (const address of addresses) {
        if (current[address]) kept[address] = current[address];
      }
      return kept;
    });
  }, [addressKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------------- live head stream ---------------- */

  useEffect(() => {
    let cancelled = false;
    let stopWatching;
    let fellBack = false;
    let pendingRefresh;

    // `emitOnBegin` fires again when the watcher restarts on the HTTP fallback,
    // and a reconnecting socket can replay a head. Counting a block twice would
    // inflate every total, so each block number is only ever processed once.
    const seenBlocks = new Set();

    const stopTransport = () => {
      try {
        stopWatching?.();
      } catch {
        // Socket may already be closed after an error.
      }
      stopWatching = undefined;
    };

    const handleBlock = (block, transport) => {
      if (cancelled) return;
      const number = Number(block.number);
      if (!Number.isSafeInteger(number)) return;
      if (seenBlocks.has(number)) return;
      seenBlocks.add(number);
      while (seenBlocks.size > 400) {
        seenBlocks.delete(seenBlocks.values().next().value);
      }

      const tracked = addressRef.current;
      const txs = Array.isArray(block.transactions) ? block.transactions : [];
      const matches = [];

      for (const tx of txs) {
        if (typeof tx !== "object" || tx === null) continue;
        const from = tx.from?.toLowerCase() ?? null;
        const to = tx.to?.toLowerCase() ?? null;
        const isFrom = from && tracked.has(from);
        const isTo = to && tracked.has(to);
        if (!isFrom && !isTo) continue;

        const value = toUsdc(tx.value ?? 0n);
        // A self-transfer is recorded once for each side so the counters stay
        // honest about what the wallet did.
        if (isFrom) matches.push({ address: from, direction: "out", tx, value, number });
        if (isTo) matches.push({ address: to, direction: "in", tx, value, number });
      }

      const at = Date.now();

      setStream((current) => {
        const counters = matches.length ? { ...current.counters } : current.counters;
        const activity = matches.length ? [...current.activity] : current.activity;

        for (const match of matches) {
          const previous = counters[match.address] || emptyCounters();
          counters[match.address] = {
            txs: previous.txs + 1,
            sent: previous.sent + (match.direction === "out" ? 1 : 0),
            received: previous.received + (match.direction === "in" ? 1 : 0),
            inUsdc: previous.inUsdc + (match.direction === "in" ? match.value : 0),
            outUsdc: previous.outUsdc + (match.direction === "out" ? match.value : 0),
            lastBlock: match.number,
            lastAt: at,
          };

          activity.unshift({
            key: `${match.tx.hash}-${match.direction}`,
            hash: match.tx.hash,
            blockNumber: match.number,
            address: match.address,
            direction: match.direction,
            counterparty: match.direction === "out" ? match.tx.to ?? null : match.tx.from ?? null,
            value: match.value,
            contractCall: Boolean(match.tx.input && match.tx.input !== "0x"),
            at,
          });
        }

        return {
          ...current,
          status: "live",
          transport,
          error: null,
          startedAt: current.startedAt ?? at,
          scanned: current.scanned + 1,
          head: {
            number,
            timestamp: Number(block.timestamp),
            txs: txs.length,
            at,
          },
          counters,
          activity: activity === current.activity ? activity : activity.slice(0, ACTIVITY_LIMIT),
        };
      });

      // A matched transaction moved value, so re-read balances shortly after.
      if (matches.length && !pendingRefresh) {
        pendingRefresh = setTimeout(() => {
          pendingRefresh = undefined;
          refreshRef.current?.();
        }, 1200);
      }
    };

    const start = (transport) => {
      if (cancelled) return;
      stopTransport();

      const client = createPublicClient({
        chain: arcTestnet,
        transport:
          transport === "websocket"
            ? webSocket(ARC_WS, { retryCount: 2, reconnect: { attempts: 5, delay: 2000 } })
            : http(ARC_HTTP),
      });

      stopWatching = client.watchBlocks({
        emitOnBegin: true,
        includeTransactions: true,
        poll: transport === "http",
        pollingInterval: 2000,
        onBlock: (block) => handleBlock(block, transport),
        onError: (error) => {
          if (cancelled) return;
          if (transport === "websocket" && !fellBack) {
            fellBack = true;
            setStream((current) => ({ ...current, transport: "http" }));
            start("http");
            return;
          }
          if (transport === "websocket") return;
          setStream((current) => ({
            ...current,
            status: "error",
            error: error?.message ?? "connection failed",
          }));
        },
      });
    };

    start("websocket");

    return () => {
      cancelled = true;
      clearTimeout(pendingRefresh);
      stopTransport();
    };
  }, []);

  /* ---------------- derived rows + overall totals ---------------- */

  const rows = useMemo(
    () =>
      wallets.map((wallet) => {
        const chain = balances[wallet.address] || null;
        const live = stream.counters[wallet.address] || emptyCounters();
        return {
          ...wallet,
          balanceUsdc: chain ? chain.balanceUsdc : null,
          nonce: chain ? chain.nonce : null,
          live,
          netUsdc: live.inUsdc - live.outUsdc,
        };
      }),
    [wallets, balances, stream.counters],
  );

  const totals = useMemo(() => {
    let balanceUsdc = 0;
    let balanceKnown = 0;
    let reportedUsd = 0;
    let allTimeTxs = 0;
    let allTimeKnown = 0;
    let liveTxs = 0;
    let inUsdc = 0;
    let outUsdc = 0;
    let active = 0;

    for (const row of rows) {
      if (row.balanceUsdc != null) {
        balanceUsdc += row.balanceUsdc;
        balanceKnown += 1;
      }
      if (row.nonce != null) {
        allTimeTxs += row.nonce;
        allTimeKnown += 1;
      }
      if (row.reportedUsd != null) reportedUsd += row.reportedUsd;
      liveTxs += row.live.txs;
      inUsdc += row.live.inUsdc;
      outUsdc += row.live.outUsdc;
      if (row.live.txs > 0) active += 1;
    }

    return {
      wallets: rows.length,
      balanceUsdc: balanceKnown > 0 ? balanceUsdc : null,
      balanceKnown,
      reportedUsd,
      allTimeTxs: allTimeKnown > 0 ? allTimeTxs : null,
      allTimeKnown,
      liveTxs,
      inUsdc,
      outUsdc,
      netUsdc: inUsdc - outUsdc,
      active,
    };
  }, [rows]);

  const uptimeMs = stream.startedAt ? Date.now() - stream.startedAt : 0;

  return {
    ...stream,
    rows,
    totals,
    uptimeMs,
    balanceState,
    refresh: refreshBalances,
  };
}
