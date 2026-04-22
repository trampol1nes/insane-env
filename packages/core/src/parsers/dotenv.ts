import type { EnvMap } from "../types.js";

const LINE_RE =
  /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/;

export function parseDotenv(source: string): EnvMap {
  const out: EnvMap = {};
  const lines = source.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;

    const match = LINE_RE.exec(line);
    if (!match) continue;
    const key = match[1]!;
    let value = match[2] ?? "";

    if (value.startsWith('"')) {
      const collected = collectQuoted(lines, i, value, '"');
      value = unescapeDouble(collected.value);
      i = collected.endIndex;
    } else if (value.startsWith("'")) {
      const collected = collectQuoted(lines, i, value, "'");
      value = collected.value;
      i = collected.endIndex;
    } else {
      const hashIdx = indexOfUnquotedHash(value);
      if (hashIdx !== -1) value = value.slice(0, hashIdx).trimEnd();
    }

    out[key] = value;
  }

  return out;
}

function collectQuoted(
  lines: string[],
  startIndex: number,
  firstLine: string,
  quote: '"' | "'",
): { value: string; endIndex: number } {
  let buf = firstLine.slice(1);
  if (endsWithUnescapedQuote(buf, quote)) {
    return { value: buf.slice(0, -1), endIndex: startIndex };
  }
  for (let j = startIndex + 1; j < lines.length; j++) {
    const next = lines[j] ?? "";
    buf += "\n" + next;
    if (endsWithUnescapedQuote(buf, quote)) {
      return { value: buf.slice(0, -1), endIndex: j };
    }
  }
  return { value: buf, endIndex: lines.length - 1 };
}

function endsWithUnescapedQuote(s: string, quote: '"' | "'"): boolean {
  if (!s.endsWith(quote)) return false;
  let backslashes = 0;
  for (let i = s.length - 2; i >= 0 && s[i] === "\\"; i--) backslashes++;
  return backslashes % 2 === 0;
}

function unescapeDouble(value: string): string {
  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

function indexOfUnquotedHash(value: string): number {
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "#" && (i === 0 || value[i - 1] === " " || value[i - 1] === "\t")) {
      return i;
    }
  }
  return -1;
}
