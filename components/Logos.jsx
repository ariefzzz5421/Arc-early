import Image from "next/image";

/** Brand marks supplied by the project owner. */

export function ArcLogo({ size = 36, rounded = true }) {
  return (
    <Image
      src="/brand/arc.jpg"
      alt="Arc"
      width={size}
      height={size}
      sizes={`${size}px`}
      priority={size >= 100}
      style={{
        display: "block",
        flexShrink: 0,
        borderRadius: rounded ? Math.max(8, Math.round(size * 0.22)) : 0,
        objectFit: "cover",
      }}
    />
  );
}

export function UsdcLogo({ size = 22 }) {
  return (
    <Image
      src="/brand/usdc.png"
      alt="USDC"
      width={size}
      height={size}
      sizes={`${size}px`}
      style={{ display: "block", flexShrink: 0, objectFit: "contain" }}
    />
  );
}

export function RadarDexLogo({ size = 34 }) {
  return (
    <Image
      src="/ecosystem/radardex.svg"
      alt="RadarDex"
      width={size}
      height={size}
      sizes={`${size}px`}
      style={{ display: "block", flexShrink: 0, borderRadius: Math.round(size * 0.24) }}
    />
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
