import { NotImplementedError } from "../errors.js";
import type { EnvMap } from "../types.js";

export function parseYaml(_source: string): EnvMap {
  throw new NotImplementedError(
    "YAML parsing is not yet implemented. Scheduled for proposal §4.4.",
  );
}
