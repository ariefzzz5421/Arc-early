"use client";

import { useMemo, useState } from "react";
import { ECOSYSTEM, ECO_CATEGORIES } from "@/lib/data";
import { RadarDexLogo } from "./Logos";

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
              {p.slug === "radardex" ? (
                <RadarDexLogo size={38} />
              ) : (
                <span
                  className="eco-logo"
                  style={{ background: `${p.color}22`, color: p.color, borderColor: `${p.color}55` }}
                >
                  {p.name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div style={{ minWidth: 0 }}>
                <h3>{p.name}</h3>
                <div className="faint" style={{ fontSize: 12 }}>{p.category}</div>
              </div>
              {p.featured && <span className="badge info" style={{ marginLeft: "auto" }}>Featured</span>}
            </div>
            <p>{p.blurb}</p>
            <div className="tags">
              {p.tags.map((t) => (
                <span key={t} className="badge">
                  {t}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>

      {rows.length === 0 && <div className="card empty">No projects match that search.</div>}
    </div>
  );
}
