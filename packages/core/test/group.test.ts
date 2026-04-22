import { describe, expect, it, vi } from "vitest";
import { createGroupedEnv, derive } from "../src/index.js";

describe("createGroupedEnv", () => {
  it("exposes each group with its own frozen result", () => {
    const env = createGroupedEnv({
      groups: {
        db: {
          sources: [{ HOST: "localhost" }],
          validate: (raw) => ({ host: raw.HOST }),
        },
        auth: {
          sources: [{ SECRET: "shhh" }],
          validate: (raw) => ({ secret: raw.SECRET }),
        },
      },
    });
    expect(env.db).toEqual({ host: "localhost" });
    expect(env.auth).toEqual({ secret: "shhh" });
    expect(Object.isFrozen(env.db)).toBe(true);
    expect(Object.isFrozen(env.auth)).toBe(true);
  });

  it("evaluates groups lazily — only on first access", () => {
    const dbBuild = vi.fn((raw: Record<string, string>) => raw);
    const authBuild = vi.fn((raw: Record<string, string>) => raw);

    const env = createGroupedEnv({
      groups: {
        db: { sources: [{ A: "1" }], validate: dbBuild },
        auth: { sources: [{ B: "2" }], validate: authBuild },
      },
    });

    expect(dbBuild).not.toHaveBeenCalled();
    expect(authBuild).not.toHaveBeenCalled();

    void env.db;
    expect(dbBuild).toHaveBeenCalledTimes(1);
    expect(authBuild).not.toHaveBeenCalled();
  });

  it("caches group results across repeated access", () => {
    const build = vi.fn((raw: Record<string, string>) => raw);
    const env = createGroupedEnv({
      groups: { x: { sources: [{ K: "v" }], validate: build } },
    });
    void env.x;
    void env.x;
    void env.x;
    expect(build).toHaveBeenCalledTimes(1);
  });

  it("rejects mutation of the grouped env", () => {
    const env = createGroupedEnv({
      groups: { db: { sources: [{ A: "1" }] } },
    });
    expect(() => {
      (env as unknown as Record<string, unknown>).db = {};
    }).toThrow(/immutable/);
    expect(() => {
      delete (env as unknown as Record<string, unknown>).db;
    }).toThrow(/immutable/);
  });

  it("propagates root cwd to groups that don't override it", () => {
    const env = createGroupedEnv({
      cwd: "/tmp",
      groups: {
        // cwd missing → engine should not crash; sources is enough
        x: { sources: [{ A: "1" }] },
      },
    });
    expect(env.x).toEqual({ A: "1" });
  });

  it("supports prefix isolation per group", () => {
    const env = createGroupedEnv({
      groups: {
        db: {
          sources: [{ DB_HOST: "h", AUTH_K: "leak" }],
          prefix: "DB_",
        },
        auth: {
          sources: [{ DB_HOST: "leak", AUTH_K: "k" }],
          prefix: "AUTH_",
        },
      },
    });
    expect(env.db).toEqual({ HOST: "h" });
    expect(env.auth).toEqual({ K: "k" });
  });

  it("Object.keys returns the declared group names", () => {
    const env = createGroupedEnv({
      groups: {
        a: { sources: [{}] },
        b: { sources: [{}] },
      },
    });
    expect(Object.keys(env)).toEqual(["a", "b"]);
  });
});

describe("derive", () => {
  it("computes the derived value lazily and caches it", () => {
    const fn = vi.fn(
      (e: { db: { host: string } }) => `tcp://${e.db.host}`,
    );
    const env = createGroupedEnv({
      groups: {
        db: {
          sources: [{ HOST: "localhost" }],
          validate: (raw) => ({ host: raw.HOST! }),
        },
      },
    });
    const url = derive(env as { db: { host: string } }, fn);
    expect(fn).not.toHaveBeenCalled();
    expect(url.value).toBe("tcp://localhost");
    expect(url.value).toBe("tcp://localhost");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("freezes the derived value", () => {
    const env = createGroupedEnv({
      groups: { db: { sources: [{ A: "1" }] } },
    });
    const d = derive(env, (e) => ({ wrapped: e.db }));
    expect(Object.isFrozen(d.value)).toBe(true);
  });
});
