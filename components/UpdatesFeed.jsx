"use client";

import { useMemo, useState } from "react";
import { UPDATES } from "@/lib/data";

const TAGS = ["All", "Mainnet", "Testnet", "Ecosystem", "Security"];

const toneClass = (tone) => (tone === "good" ? "live" : tone === "warn" ? "pending" : "info");

export default function UpdatesFeed() {
  const [tag, setTag] = useState("All");

  const rows = useMemo(() => (tag === "All" ? UPDATES : UPDATES.filter((u) => u.tag === tag)), [tag]);

  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="chips">
        {TAGS.map((t) => (
          <button key={t} type="button" className={`chip ${tag === t ? "on" : ""}`} onClick={() => setTag(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="timeline">
        {rows.map((u) => (
          <article key={u.title} className="card update">
            <div className="when">
              <div className="mono">{u.date}</div>
              <span className={`badge ${toneClass(u.tone)}`} style={{ marginTop: 8 }}>
                {u.tag}
              </span>
            </div>
            <div>
              <h3>{u.title}</h3>
              <p>{u.body}</p>
              <a className="btn sm" href={u.source.url} target="_blank" rel="noreferrer">
                {u.source.label} ↗
              </a>
            </div>
          </article>
        ))}
      </div>

      {rows.length === 0 && <div className="card empty">Nothing filed under {tag} yet.</div>}
    </div>
  );
}
