import {
  captureAttribution,
  getAttribution,
  type AttributionParams,
} from "@/lib/attribution";

export type TrackPayload = Record<
  string,
  string | number | boolean | undefined | null
>;

/** Reserved in v1 - source site has no cart/checkout. */
export const RESERVED_EVENTS = ["add_to_cart"] as const;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      track: (name: string, payload?: Record<string, unknown>) => void;
      page?: () => void;
    };
  }
}

export function isDebugTracking(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NODE_ENV !== "production") return true;
  try {
    return localStorage.getItem("debug_tracking") === "1";
  } catch {
    return false;
  }
}

export function debugLog(...args: unknown[]): void {
  if (isDebugTracking()) {
    console.log("[OfferLane track]", ...args);
  }
}

function sanitizePayload(
  payload: TrackPayload
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    out[key] = value as string | number | boolean;
  }
  return out;
}

function buildEventData(
  eventName: string,
  payload: TrackPayload = {}
): Record<string, unknown> {
  const attribution = getAttribution();
  return {
    event: eventName,
    ts: Date.now(),
    ...attribution,
    ...sanitizePayload(payload),
  };
}

/** POST to /api/track - sendBeacon first, then fetch keepalive. */
export function deliverToApi(data: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  const body = JSON.stringify(data);
  const url = "/api/track";

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const sent = navigator.sendBeacon(
      url,
      new Blob([body], { type: "application/json" })
    );
    if (sent) {
      debugLog("beacon", data.event, data);
      return;
    }
  }

  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});

  debugLog("fetch keepalive", data.event, data);
}

function pushToPixels(eventName: string, payload: Record<string, unknown>): void {
  window.dataLayer?.push({ ...payload, event: eventName });

  const pixelPayload = sanitizePayload(payload as TrackPayload);
  window.gtag?.("event", eventName, pixelPayload);
  window.fbq?.("trackCustom", eventName, pixelPayload);
  window.ttq?.track(eventName, pixelPayload);
}

/**
 * Track a custom event with persisted UTM / click ids on every payload.
 * `add_to_cart` is intentionally no-op in v1.
 */
export function trackEvent(eventName: string, payload: TrackPayload = {}): void {
  if (typeof window === "undefined") return;
  if ((RESERVED_EVENTS as readonly string[]).includes(eventName)) {
    debugLog("skipped reserved event", eventName);
    return;
  }

  const data = buildEventData(eventName, payload);
  pushToPixels(eventName, data);
  deliverToApi(data);
  debugLog(eventName, data);
}

export type OutboundTrackStep = {
  name: string;
  payload?: TrackPayload;
};

export type TrackOutboundOptions = {
  /** One or more events fired before redirect (e.g. click_deal + outbound_click). */
  events: OutboundTrackStep[];
  url: string;
  /** @default true */
  newTab?: boolean;
};

/**
 * Fire tracking then open partner URL without blocking the user.
 * Uses sendBeacon / fetch keepalive via deliverToApi inside trackEvent.
 */
export function trackOutbound({
  events,
  url,
  newTab = true,
}: TrackOutboundOptions): void {
  if (typeof window === "undefined" || !url) return;

  for (const step of events) {
    trackEvent(step.name, {
      outbound_url: url,
      ...step.payload,
    });
  }

  const navigate = () => {
    if (newTab) {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.location.assign(url);
    }
  };

  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(navigate);
  } else {
    setTimeout(navigate, 0);
  }
}

/** Call on first client load to persist query attribution. */
export { captureAttribution, getAttribution, type AttributionParams };
