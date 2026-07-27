"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ECOSYSTEM, ECO_CATEGORIES } from "@/lib/data";

export default function EcosystemGrid() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ECOSYSTEM.filter((p) => {
      if (cat !== "All" && p.category !== cat) return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        p.blurb.toLowerCase().includes(needle) ||
        p.tags.some((t) => t.toLowerCase().includes(needle))
      );
    });
  }, [cat, q]);

  return (
    <div className="grid" style={{ gap: 18 }}>
      <div className="toolbar card" style={{ borderBottom: "1px solid var(--line)" }}>
        <input
          className="input search"
          placeholder="Search projects, tags…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="chips">
          {ECO_CATEGORIES.map((c) => (
            <button key={c} type="button" className={`chip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid eco-grid">
        {rows.map((p) => (
          <a key={p.slug} className="card eco-card" href={p.url} target="_blank" rel="noreferrer">
            <div className="eco-top">
              <span className="eco-logo" style={{ background: `${p.color}18`, borderColor: `${p.color}55` }}>
                <Image src={p.logo} alt={`${p.name} logo`} width={38} height={38} sizes="38px" />
              </span>
              <div style={{ minWidth: 0 }}>
                <h3>{p.name}</h3>
                <div className="faint" style={{ fontSize: 12 }}>{p.category}</div>
              </div>
              {p.featured && <span className="badge info" style={{ marginLeft: "auto" }}>Featured</span>}
            </div>
            <p>{p.blurb}</p>
            <div className="eco-stats">
              {p.stats.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
            <div className="tags">
              {p.tags.map((t) => (
                <span key={t} className="badge">
                  {t}
                </span>
              ))}
              <span className="badge info">{p.sourceLabel} ↗</span>
            </div>
          </a>
        ))}
      </div>

      {rows.length === 0 && <div className="card empty">No projects match that search.</div>}
    </div>
  );
}
