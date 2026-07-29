/**
 * Circle Gateway route discovery.
 *
 * Gateway is the burn-and-mint path people actually use to move USDC onto a new
 * chain: deposit into the GatewayWallet on a source chain, wait for Circle to
 * finalize the deposit, sign an EIP-712 burn intent, exchange it for an
 * attestation, then submit the mint yourself on the destination.
 *
 * Every address and domain id below is read live from Circle's own API rather
 * than hardcoded here, because the whole point of this module is to answer
 * "is this route real yet?" without anyone having to trust a number typed into
 * this repo. If Circle has not published a domain, the app says so.
 */

const GATEWAY_INFO = {
  mainnet: "https://gateway-api.circle.com/v1/info",
  testnet: "https://gateway-api-testnet.circle.com/v1/info",
};

const DOCS = {
  guide: "https://developers.circle.com/gateway/concepts/technical-guide",
  domains: "https://developers.circle.com/cctp/concepts/supported-chains-and-domains",
  finality: "https://developers.circle.com/cctp/concepts/finality-and-block-confirmations",
  deployment: "https://docs.arc.io/arc/concepts/deployment-model",
};

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

const asAddress = (value) => (ADDRESS_RE.test(String(value || "")) ? String(value) : null);

function normalizeDomain(entry) {
  const domain = Number(entry?.domain);
  if (!Number.isInteger(domain)) return null;

  const tokensOf = (contract) =>
    Array.isArray(contract?.supportedTokens)
      ? contract.supportedTokens.map((token) => String(token).slice(0, 12)).filter(Boolean)
      : [];

  return {
    domain,
    chain: String(entry?.chain || "Unknown").slice(0, 40),
    network: String(entry?.network || "").slice(0, 40),
    wallet: asAddress(entry?.walletContract?.address),
    minter: asAddress(entry?.minterContract?.address),
    tokens: [...new Set([...tokensOf(entry?.walletContract), ...tokensOf(entry?.minterContract)])],
  };
}

/** Arc-specific match. Guards against "Arbitrum", which also starts with "ar". */
const isArc = (row) => /^arc\b/i.test(row.chain) || /^arc\b/i.test(row.network);

async function fetchInfo(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Gateway API returned HTTP ${response.status}`);

    const payload = await response.json();
    const domains = Array.isArray(payload?.domains)
      ? payload.domains.map(normalizeDomain).filter(Boolean)
      : [];

    return { ok: true, domains, version: payload?.version ?? null };
  } catch (error) {
    return {
      ok: false,
      domains: [],
      message:
        error?.name === "AbortError"
          ? "Circle's Gateway API did not respond before the timeout."
          : "Circle's Gateway API is temporarily unreachable.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Reads both Gateway environments and reports whether Arc is a live route.
 *
 * `arcMainnet` is non-null only when Circle itself lists an Arc mainnet domain.
 * Until then the bridge stays closed — an Arc mainnet RPC or Gateway contract
 * that does not appear here has not been published by Circle, whoever is
 * circulating it.
 */
export async function fetchGatewayRoutes() {
  const [mainnet, testnet] = await Promise.all([fetchInfo(GATEWAY_INFO.mainnet), fetchInfo(GATEWAY_INFO.testnet)]);

  const arcMainnet = mainnet.domains.find(isArc) ?? null;
  const arcTestnet = testnet.domains.find(isArc) ?? null;

  const reachable = mainnet.ok || testnet.ok;

  return {
    status: reachable ? "live" : "unavailable",
    source: "Circle Gateway API",
    docs: DOCS,
    fetchedAt: new Date().toISOString(),
    message: reachable ? null : mainnet.message || testnet.message,
    mainnet: {
      ok: mainnet.ok,
      endpoint: GATEWAY_INFO.mainnet,
      count: mainnet.domains.length,
      domains: mainnet.domains,
      message: mainnet.message ?? null,
    },
    testnet: {
      ok: testnet.ok,
      endpoint: GATEWAY_INFO.testnet,
      count: testnet.domains.length,
      domains: testnet.domains,
      message: testnet.message ?? null,
    },
    arc: {
      mainnet: arcMainnet,
      testnet: arcTestnet,
      // The only condition under which this app would open a mainnet bridge.
      mainnetSupported: Boolean(arcMainnet),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Reference: the burn-intent payload Gateway signs                    */
/* ------------------------------------------------------------------ */

/**
 * EIP-712 field layout for a Gateway burn intent, in the order the contracts
 * encode it. Reproduced here as reference for anyone building the mint step —
 * getting the field order wrong is the usual reason an attestation request is
 * rejected. Source: Circle's Gateway technical guide.
 */
export const TRANSFER_SPEC_FIELDS = [
  ["version", "uint32"],
  ["sourceDomain", "uint32"],
  ["destinationDomain", "uint32"],
  ["sourceContract", "bytes32"],
  ["destinationContract", "bytes32"],
  ["sourceToken", "bytes32"],
  ["destinationToken", "bytes32"],
  ["sourceDepositor", "bytes32"],
  ["destinationRecipient", "bytes32"],
  ["sourceSigner", "bytes32"],
  ["destinationCaller", "bytes32"],
  ["value", "uint256"],
  ["salt", "bytes32"],
  ["hookData", "bytes"],
];

export const BURN_INTENT_FIELDS = [
  ["maxBlockHeight", "uint256"],
  ["maxFee", "uint256"],
  ["spec", "TransferSpec"],
];

/**
 * The five steps, with the details that actually cost people money the first
 * time. Sourced from Circle's Gateway and CCTP documentation.
 */
export const GATEWAY_STEPS = [
  {
    title: "Deposit on the source chain",
    body: "Approve USDC, then call deposit on the GatewayWallet contract. The balance stays yours — availableBalance reads it straight back. Nothing is burned or surrendered at this point.",
    detail: "GatewayWallet · deposit(token, amount)",
  },
  {
    title: "Wait for Circle's indexer",
    body: "A deposit is only credited after source-chain finality. For OP Stack chains such as Base, Circle waits for the L1 block carrying the batch to finalize — roughly 20 minutes. Until then the API reports a zero balance even though the chain shows the deposit.",
    detail: "~65 L1 blocks after the batch posts",
  },
  {
    title: "Sign a burn intent",
    body: "An EIP-712 message authorizing Circle to burn part of your Gateway balance on the source chain and mint it to you on the destination. Signed off-chain, costs no gas, and must come from an EOA — smart-contract (EIP-1271) signatures are rejected.",
    detail: "BurnIntent { maxBlockHeight, maxFee, spec }",
  },
  {
    title: "Exchange it for an attestation",
    body: "Submit the signed intent to the Gateway API. Circle validates it and returns an attestation — a signed permission slip. Attestations expire, so treat one as short-lived and mint promptly.",
    detail: "POST /v1/transfer · expires in ~10 min",
  },
  {
    title: "Submit the mint yourself",
    body: "This is the step that trips people. Circle does not mint for you: you take the attestation and call gatewayMint on the minter contract. That is a transaction on the destination chain, so you need gas there first — and on Arc gas is paid in USDC, meaning you need USDC on Arc to receive USDC on Arc.",
    detail: "GatewayMinter · gatewayMint(bytes, bytes)",
  },
];

/**
 * Trustless exit path, worth knowing before depositing: Gateway is
 * non-custodial, and if the API were ever unavailable you can withdraw on-chain
 * without it — after an enforced delay.
 */
export const WITHDRAWAL_DELAY_DAYS = 7;
