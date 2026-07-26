export function PageHead({ eyebrow, title, children, actions }) {
  return (
    <div className="page-head">
      <div className="shell" style={{ padding: 0 }}>
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h1 style={{ marginTop: 8 }}>{title}</h1>
        {children ? <p>{children}</p> : <div style={{ height: 18 }} />}
        {actions ? <div className="pill-row" style={{ marginBottom: 20 }}>{actions}</div> : null}
      </div>
    </div>
  );
}

export function Stat({ label, value, sub, kind = "info", icon }) {
  const color =
    kind === "good" ? "var(--up)" : kind === "pending" ? "var(--warn)" : kind === "down" ? "var(--down)" : "var(--text)";
  return (
    <div className="card stat">
      <div className="label">
        {icon}
        {label}
      </div>
      <div className="value" style={{ color }}>
        {value}
      </div>
      {sub ? <div className="sub">{sub}</div> : null}
    </div>
  );
}

export function Sparkline({ points, color = "#2fd48f", width = 96, height = 28 }) {
  if (!points || points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(height - ((p - min) / span) * height).toFixed(1)}`)
    .join(" ");
  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function TokenBadge({ token, size = 30 }) {
  return (
    <span
      className="token-logo"
      style={{ width: size, height: size, background: `${token.color}22`, color: token.color, borderColor: `${token.color}55` }}
    >
      {token.symbol.slice(0, 2)}
    </span>
  );
}

export function Notice({ children, tone = "warn" }) {
  return (
    <div className={tone === "blue" ? "notice blue" : "notice"}>
      <span aria-hidden="true">{tone === "blue" ? "ℹ" : "⚠"}</span>
      <div>{children}</div>
    </div>
  );
}
