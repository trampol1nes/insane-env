import { describe, expect, it } from "vitest";
import { createEnv, EnvSupremeValidationError } from "../src/index.js";

describe("createEnv", () => {
  it("returns a frozen raw EnvMap when no validate hook is provided", () => {
    const env = createEnv({ sources: [{ A: "1", B: "2" }] });
    expect(env).toEqual({ A: "1", B: "2" });
    expect(Object.isFrozen(env)).toBe(true);
  });

  it("runs the validate hook and returns its result, deeply frozen", () => {
    const env = createEnv({
      sources: [{ PORT: "3000", FLAGS: "a,b" }],
      validate: (raw) => ({
        port: Number(raw.PORT),
        flags: raw.FLAGS!.split(","),
      }),
    });
    expect(env.port).toBe(3000);
    expect(env.flags).toEqual(["a", "b"]);
    expect(Object.isFrozen(env)).toBe(true);
    expect(Object.isFrozen(env.flags)).toBe(true);
  });

  it("never mutates process.env, even when hook coerces values", () => {
    const before = process.env.__SAFE__;
    process.env.__SAFE__ = "5";
    try {
      const env = createEnv({
        validate: (raw) => ({ n: Number(raw.__SAFE__) }),
      });
      expect(typeof env.n).toBe("number");
      expect(typeof process.env.__SAFE__).toBe("string");
      expect(process.env.__SAFE__).toBe("5");
    } finally {
      if (before === undefined) delete process.env.__SAFE__;
      else process.env.__SAFE__ = before;
    }
  });

  it("wraps hook errors in EnvSupremeValidationError with original cause", () => {
    const inner = new Error("boom");
    let caught: unknown;
    try {
      createEnv({
        sources: [{}],
        validate: () => {
          throw inner;
        },
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(EnvSupremeValidationError);
    expect((caught as EnvSupremeValidationError).cause).toBe(inner);
  });

  it("preserves the inferred return type from the hook (compile-time check)", () => {
    const env = createEnv({
      sources: [{ X: "42" }],
      validate: (raw) => ({ x: Number(raw.X) }),
    });
    const x: number = env.x;
    expect(x).toBe(42);
  });

  it("supports calling with no options", () => {
    const env = createEnv();
    expect(Object.isFrozen(env)).toBe(true);
  });
});
