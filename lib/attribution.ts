/** Session-persisted ad click / UTM parameters for downstream events. */

export const ATTRIBUTION_STORAGE_KEY = "offerlane_attribution";

export const ATTRIBUTION_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "ttclid",
  "gclid",
] as const;

export type AttributionKey = (typeof ATTRIBUTION_PARAM_KEYS)[number];
export type AttributionParams = Partial<Record<AttributionKey, string>>;

function readStorage(): AttributionParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as AttributionParams;
  } catch {
    return {};
  }
}

function writeStorage(params: AttributionParams): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(params));
  } catch {
    /* quota / private mode */
  }
}

/** Merge URL query params into sessionStorage (first-touch preserved per key). */
export function captureAttribution(search?: string): AttributionParams {
  if (typeof window === "undefined") return {};

  const incoming = new URLSearchParams(search ?? window.location.search);
  const stored = readStorage();
  const merged: AttributionParams = { ...stored };
  let updated = false;

  for (const key of ATTRIBUTION_PARAM_KEYS) {
    const value = incoming.get(key);
    if (value) {
      merged[key] = value;
      updated = true;
    }
  }

  if (updated || Object.keys(merged).length > 0) {
    writeStorage(merged);
  }

  return merged;
}

export function getAttribution(): AttributionParams {
  return readStorage();
}
