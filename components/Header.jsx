"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ArcLogo, UsdcLogo } from "./Logos";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/screener", label: "Screener" },
  { href: "/bridge", label: "Bridge" },
  { href: "/updates", label: "Updates" },
  { href: "/ecosystem", label: "Ecosystem" },
  { href: "/network", label: "Network" },
];

export default function Header() {
  const path = usePathname();

  return (
    <header className="site-header">
      <div className="shell header-row">
        <Link href="/" className="brand">
          <ArcLogo size={34} />
          <span>
            <span className="brand-name">Arc Early</span>
            <span className="brand-sub">Arc mainnet tools</span>
          </span>
        </Link>

        <nav className="nav">
          {NAV.map((item) => {
            const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? "active" : ""}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions">
          <span className="badge info hide-sm">
            <UsdcLogo size={14} /> USDC gas
          </span>
          <span className="badge pending hide-sm">Mainnet: beta pending</span>
          <ConnectButton
            showBalance={{ smallScreen: false, largeScreen: true }}
            accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
            chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
          />
        </div>
      </div>
    </header>
  );
}
