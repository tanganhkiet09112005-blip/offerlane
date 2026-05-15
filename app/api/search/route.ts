import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const site = getSiteConfig();
  const results = q
    ? site.searchMockResults.filter((r) =>
        r.title.toLowerCase().includes(q)
      )
    : site.searchMockResults;
  return NextResponse.json({ results });
}
