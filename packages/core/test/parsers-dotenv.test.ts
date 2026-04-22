import { describe, expect, it } from "vitest";
import { parseDotenv } from "../src/parsers/dotenv.js";

describe("parseDotenv", () => {
  it("parses simple key=value pairs", () => {
    expect(parseDotenv("PORT=3000\nNAME=app")).toEqual({
      PORT: "3000",
      NAME: "app",
    });
  });

  it("ignores blank lines and # comments", () => {
    const out = parseDotenv("\n# top comment\nA=1\n\n# inner\nB=2\n");
    expect(out).toEqual({ A: "1", B: "2" });
  });

  it("strips inline comments after whitespace", () => {
    expect(parseDotenv("A=1 # trailing")).toEqual({ A: "1" });
  });

  it("preserves # inside double quotes", () => {
    expect(parseDotenv('A="value # not a comment"')).toEqual({
      A: "value # not a comment",
    });
  });

  it("supports the `export` prefix", () => {
    expect(parseDotenv("export FOO=bar")).toEqual({ FOO: "bar" });
  });

  it("handles double-quoted multiline values with escapes", () => {
    const out = parseDotenv('PEM="-----BEGIN-----\\nLINE\\n-----END-----"');
    expect(out.PEM).toBe("-----BEGIN-----\nLINE\n-----END-----");
  });

  it("handles single-quoted values literally (no escape processing)", () => {
    expect(parseDotenv("A='no \\n escape'")).toEqual({ A: "no \\n escape" });
  });

  it("handles real multiline single-quoted strings", () => {
    const out = parseDotenv("KEY='line1\nline2'");
    expect(out.KEY).toBe("line1\nline2");
  });

  it("skips malformed lines silently", () => {
    expect(parseDotenv("not-an-assignment\nA=1")).toEqual({ A: "1" });
  });
});
