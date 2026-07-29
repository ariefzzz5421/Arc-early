/**
 * Wallet tracker registry.
 *
 * SEED_WALLETS are the whale/trader profiles supplied for this build. The
 * `reportedUsd` figure is the portfolio size quoted on the wallet's RadarDex
 * profile at the time it was added — it is a third-party reference number, not
 * a live value, and the tracker never mixes it into the on-chain numbers it
 * reads itself.
 */

const RADARDEX_PROFILE = "https://radardex.io/#profile/";

export const SEED_WALLETS = [
  {
    address: "0x24dd638d1be36bce5802216c6e8513dc3d5fa97e",
    label: "Whale 1",
    reportedUsd: 30_000,
  },
  {
    address: "0xe0c5755ba2d2a9428548e27f676c3ba1dfd97d17",
    label: "Whale 2",
    reportedUsd: 2_000,
  },
  {
    address: "0xff530642b6b945f27ef486f7120e31ad017db890",
    label: "Whale 3",
    reportedUsd: 2_500,
  },
  {
    address: "0x1c4ffe77c1c643aba26c2ee236f9e8e12f51615d",
    label: "Whale 4",
    reportedUsd: 13_000,
  },
].map((wallet) => ({
  ...wallet,
  seed: true,
  reportedSource: "RadarDex profile",
  profileUrl: `${RADARDEX_PROFILE}${wallet.address}`,
}));

export const STORAGE_KEY = "arc-early:wallet-tracker:v1";

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

export function isAddress(value) {
  return ADDRESS_RE.test(String(value || "").trim());
}

export function normalizeAddress(value) {
  return String(value || "").trim().toLowerCase();
}

export function shortAddress(address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function profileUrl(address) {
  return `${RADARDEX_PROFILE}${normalizeAddress(address)}`;
}

/**
 * Effective tracked list = seeds the user has not removed, then their own
 * additions. Seed metadata always wins so a future edit to SEED_WALLETS reaches
 * people who already have state in localStorage.
 */
export function resolveWallets(stored) {
  const removed = new Set((stored?.removed || []).map(normalizeAddress));
  const added = Array.isArray(stored?.added) ? stored.added : [];

  const list = SEED_WALLETS.filter((wallet) => !removed.has(wallet.address));
  const seen = new Set(list.map((wallet) => wallet.address));

  for (const entry of added) {
    const address = normalizeAddress(entry?.address);
    if (!isAddress(address) || seen.has(address)) continue;
    seen.add(address);
    list.push({
      address,
      label: String(entry?.label || "").slice(0, 32) || shortAddress(address),
      reportedUsd: null,
      seed: false,
      addedAt: Number(entry?.addedAt) || null,
      profileUrl: profileUrl(address),
    });
  }

  return list;
}

export function readStored() {
  if (typeof window === "undefined") return { added: [], removed: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { added: [], removed: [] };
    const parsed = JSON.parse(raw);
    return {
      added: Array.isArray(parsed?.added) ? parsed.added : [],
      removed: Array.isArray(parsed?.removed) ? parsed.removed : [],
    };
  } catch {
    return { added: [], removed: [] };
  }
}

export function writeStored(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode / quota — tracking still works for the current session.
  }
}
