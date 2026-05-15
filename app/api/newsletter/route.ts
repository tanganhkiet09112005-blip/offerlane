import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, placement, store } = await request.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (process.env.NODE_ENV === "development") {
      console.log("[newsletter]", { email, placement, store });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
