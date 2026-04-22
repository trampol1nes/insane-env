import { describe, expect, it } from "vitest";
import { parseJson } from "../src/parsers/json.js";
import { parseYaml } from "../src/parsers/yaml.js";
import { EnvSupremeLoadError, NotImplementedError } from "../src/errors.js";

describe("parseJson", () => {
  it("parses string values directly", () => {
    expect(parseJson('{"A":"1","B":"2"}')).toEqual({ A: "1", B: "2" });
  });

  it("stringifies non-string leaves", () => {
    expect(parseJson('{"PORT":3000,"DEBUG":true,"L":[1,2]}')).toEqual({
      PORT: "3000",
      DEBUG: "true",
      L: "[1,2]",
    });
  });

  it("skips null/undefined values", () => {
    expect(parseJson('{"A":"x","B":null}')).toEqual({ A: "x" });
  });

  it("throws EnvSupremeLoadError on invalid JSON", () => {
    expect(() => parseJson("not json")).toThrow(EnvSupremeLoadError);
  });

  it("rejects non-object top-level", () => {
    expect(() => parseJson('["a","b"]')).toThrow(EnvSupremeLoadError);
    expect(() => parseJson('"hello"')).toThrow(EnvSupremeLoadError);
  });
});

describe("parseYaml (stub)", () => {
  it("throws NotImplementedError until §4.5 lands", () => {
    expect(() => parseYaml("k: v")).toThrow(NotImplementedError);
  });
});
