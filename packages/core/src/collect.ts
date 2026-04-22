import { readFileSync } from "node:fs";
import { extname, isAbsolute, resolve } from "node:path";
import { EnvSupremeLoadError } from "./errors.js";
import { parseDotenv } from "./parsers/dotenv.js";
import { parseJson } from "./parsers/json.js";
import { parseYaml } from "./parsers/yaml.js";
import type { CreateEnvOptions, EnvMap, EnvSource } from "./types.js";

export function collectEnv(options: CreateEnvOptions<unknown>): EnvMap {
  const cwd = options.cwd ?? process.cwd();
  const merged: EnvMap = {};

  for (const file of options.files ?? []) {
    const absolute = isAbsolute(file) ? file : resolve(cwd, file);
    const fileMap = readAndParse(absolute);
    Object.assign(merged, fileMap);
  }

  const sources: EnvSource[] =
    options.sources ?? [process.env as EnvSource];

  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) continue;
      merged[key] = value;
    }
  }

  if (options.prefix) {
    return applyPrefix(merged, options.prefix);
  }
  return merged;
}

function applyPrefix(map: EnvMap, prefix: string): EnvMap {
  const out: EnvMap = {};
  for (const [key, value] of Object.entries(map)) {
    if (!key.startsWith(prefix)) continue;
    out[key.slice(prefix.length)] = value;
  }
  return out;
}

function readAndParse(path: string): EnvMap {
  let content: string;
  try {
    content = readFileSync(path, "utf8");
  } catch (cause) {
    const err = cause as NodeJS.ErrnoException;
    if (err.code === "ENOENT") return {};
    throw new EnvSupremeLoadError(`Failed to read env file: ${path}`, { cause });
  }

  const ext = extname(path).toLowerCase();
  switch (ext) {
    case ".json":
      return parseJson(content);
    case ".yaml":
    case ".yml":
      return parseYaml(content);
    case ".env":
    case "":
      return parseDotenv(content);
    default:
      return parseDotenv(content);
  }
}
