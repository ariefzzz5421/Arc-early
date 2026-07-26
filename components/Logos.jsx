/**
 * Brand marks used across Arc Early, drawn inline as SVG so the site stays
 * dependency-free and the logos stay crisp at any size.
 */

export function ArcLogo({ size = 36, rounded = true }) {
  const id = "arcgrad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Arc"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#123a63" />
          <stop offset="55%" stopColor="#0b2547" />
          <stop offset="100%" stopColor="#050f22" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="38%" stopColor="#eef2f7" />
          <stop offset="62%" stopColor="#b9c4d2" />
          <stop offset="100%" stopColor="#8f9dae" />
        </linearGradient>
      </defs>
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        rx={rounded ? 22 : 0}
        fill={`url(#${id}-bg)`}
      />
      <path
        d="M18 88 V47 A32 32 0 0 1 82 47 V70 C82 81 73.5 88.5 62.5 88.5 C56 88.5 51 86.5 47.5 83.5
           C55.5 80.5 60 74.5 60 66 V48 A11 11 0 0 0 38 48 V88 Z"
        fill={`url(#${id}-metal)`}
      />
    </svg>
  );
}

export function UsdcLogo({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label="USDC"
      style={{ display: "block", flexShrink: 0 }}
    >
      <circle cx="48" cy="48" r="48" fill="#2775CA" />
      <g fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round">
        <path d="M21.1 21.1 A38 38 0 0 0 21.1 74.9" />
        <path d="M74.9 21.1 A38 38 0 0 1 74.9 74.9" />
        <path d="M60 37.5 C60 30.5 53.5 26 45.5 26 C37.5 26 31 30 31 36.5 C31 43 36.5 45.5 45.5 47.5 C54.5 49.5 60.5 52.5 60.5 59.5 C60.5 66.5 54 71 45.5 71 C37 71 30.5 66 30.5 59" />
        <path d="M45.5 18 V26 M45.5 71 V79" />
      </g>
    </svg>
  );
}

export function RadarDexLogo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="RadarDex">
      <defs>
        <linearGradient id="rdx" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9b8bff" />
          <stop offset="100%" stopColor="#5a3ff0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#rdx)" />
      <g fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.95">
        <path d="M32 46 A14 14 0 0 1 18 32" />
        <path d="M32 53 A21 21 0 0 1 11 32" opacity="0.6" />
        <path d="M32 32 L47 17" />
      </g>
      <circle cx="32" cy="32" r="3.5" fill="#fff" />
    </svg>
  );
}

/** Small circular chain badge used in the bridge + tables. */
export function ChainIcon({ chain, size = 26 }) {
  const style = {
    width: size,
    height: size,
    background: chain?.color || "#334",
    fontSize: Math.round(size * 0.42),
  };
  if (chain?.key === "arc") {
    return <ArcLogo size={size} />;
  }
  return (
    <span className="chain-icon" style={style}>
      {chain?.short || "?"}
    </span>
  );
}
