import { NextResponse } from "next/server";
import { fetchGatewayRoutes } from "@/lib/gateway";

export async function GET() {
  const payload = await fetchGatewayRoutes();

  if (payload.status === "live") {
    return NextResponse.json(payload, {
      headers: {
        // Route support changes when Circle deploys a domain, not by the second.
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
      },
    });
  }

  return NextResponse.json(payload, {
    status: 503,
    headers: { "Cache-Control": "no-store" },
  });
}
