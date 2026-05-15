import { NextResponse } from "next/server";

const MAX_EVENT_NAME = 64;
const MAX_BODY_BYTES = 16_384;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, error: "payload_too_large" },
        { status: 413 }
      );
    }

    let body: unknown;
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      return NextResponse.json(
        { success: false, error: "invalid_json" },
        { status: 400 }
      );
    }

    if (!isPlainObject(body)) {
      return NextResponse.json(
        { success: false, error: "invalid_body" },
        { status: 400 }
      );
    }

    const eventName =
      typeof body.event === "string" ? body.event.trim() : "";

    if (!eventName || eventName.length > MAX_EVENT_NAME) {
      return NextResponse.json(
        { success: false, error: "invalid_event_name" },
        { status: 400 }
      );
    }

    const payload = {
      event: eventName,
      ts: typeof body.ts === "number" ? body.ts : Date.now(),
      ...body,
    };

    if (process.env.NODE_ENV !== "production") {
      console.log("[track]", payload);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "server_error" },
      { status: 500 }
    );
  }
}
