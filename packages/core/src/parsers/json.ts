import type { EnvMap } from "../types.js";
import { EnvSupremeLoadError } from "../errors.js";

export function parseJson(source: string): EnvMap {
  let data: unknown;
  try {
    data = JSON.parse(source);
  } catch (cause) {
    throw new EnvSupremeLoadError("Failed to parse JSON env source", { cause });
  }
  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    throw new EnvSupremeLoadError(
      "JSON env source must be a plain object at the top level",
    );
  }

  const out: EnvMap = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value === null || value === undefined) continue;
    out[key] =
      typeof value === "string" ? value : JSON.stringify(value);
  }
  return out;
}
