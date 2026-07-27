import { NextResponse } from "next/server";
import { fetchRadarDexTokens } from "@/lib/radardex";

export async function GET() {
  const payload = await fetchRadarDexTokens();
  if (payload.status === "live") {
    return NextResponse.json(
      payload,
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      },
    );
  }

  return NextResponse.json(payload, {
    status: 503,
    headers: { "Cache-Control": "no-store" },
  });
}
