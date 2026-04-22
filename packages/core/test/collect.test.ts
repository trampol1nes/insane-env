import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { collectEnv } from "../src/collect.js";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "envsupreme-"));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("collectEnv", () => {
  it("returns {} when no files and empty sources", () => {
    expect(collectEnv({ sources: [] })).toEqual({});
  });

  it("ignores missing files (ENOENT) silently", () => {
    expect(
      collectEnv({ files: ["does-not-exist.env"], sources: [], cwd: dir }),
    ).toEqual({});
  });

  it("merges files in declaration order — later wins", () => {
    writeFileSync(join(dir, "a.env"), "X=1\nY=base\n");
    writeFileSync(join(dir, "b.env"), "Y=override\nZ=2\n");
    expect(
      collectEnv({ files: ["a.env", "b.env"], sources: [], cwd: dir }),
    ).toEqual({ X: "1", Y: "override", Z: "2" });
  });

  it("sources override files (12-factor: OS wins)", () => {
    writeFileSync(join(dir, "a.env"), "PORT=3000\n");
    expect(
      collectEnv({
        files: ["a.env"],
        sources: [{ PORT: "9000" }],
        cwd: dir,
      }),
    ).toEqual({ PORT: "9000" });
  });

  it("merges multiple sources in order — later wins", () => {
    expect(
      collectEnv({
        sources: [{ A: "1", B: "1" }, { B: "2", C: "2" }, { C: "3" }],
      }),
    ).toEqual({ A: "1", B: "2", C: "3" });
  });

  it("skips undefined values from sources", () => {
    expect(collectEnv({ sources: [{ A: "1", B: undefined }] })).toEqual({
      A: "1",
    });
  });

  it("auto-detects .json files", () => {
    writeFileSync(join(dir, "c.json"), '{"A":"json"}');
    expect(collectEnv({ files: ["c.json"], sources: [], cwd: dir })).toEqual({
      A: "json",
    });
  });

  it("applies prefix filter and strips it", () => {
    expect(
      collectEnv({
        sources: [{ DB_HOST: "h", DB_PORT: "5432", AUTH_KEY: "k" }],
        prefix: "DB_",
      }),
    ).toEqual({ HOST: "h", PORT: "5432" });
  });

  it("defaults source to process.env when sources is undefined", () => {
    process.env.__ENVSUPREME_TEST__ = "yes";
    try {
      const out = collectEnv({});
      expect(out.__ENVSUPREME_TEST__).toBe("yes");
    } finally {
      delete process.env.__ENVSUPREME_TEST__;
    }
  });
});
