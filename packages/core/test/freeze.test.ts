import { describe, expect, it } from "vitest";
import { deepFreeze } from "../src/freeze.js";

describe("deepFreeze", () => {
  it("freezes the top-level object", () => {
    const result = deepFreeze({ a: 1 });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("freezes nested objects recursively", () => {
    const obj = { a: { b: { c: 1 } }, list: [1, { x: "y" }] };
    deepFreeze(obj);
    expect(Object.isFrozen(obj)).toBe(true);
    expect(Object.isFrozen(obj.a)).toBe(true);
    expect(Object.isFrozen(obj.a.b)).toBe(true);
    expect(Object.isFrozen(obj.list)).toBe(true);
    expect(Object.isFrozen(obj.list[1])).toBe(true);
  });

  it("rejects mutation in strict mode", () => {
    const obj = deepFreeze({ a: 1 });
    expect(() => {
      (obj as { a: number }).a = 2;
    }).toThrow();
  });

  it("handles cycles without infinite recursion", () => {
    interface Node {
      child?: Node;
    }
    const a: Node = {};
    const b: Node = { child: a };
    a.child = b;
    expect(() => deepFreeze(a)).not.toThrow();
    expect(Object.isFrozen(a)).toBe(true);
    expect(Object.isFrozen(b)).toBe(true);
  });

  it("skips primitives", () => {
    expect(deepFreeze(42)).toBe(42);
    expect(deepFreeze("hi")).toBe("hi");
    expect(deepFreeze(null)).toBe(null);
  });
});
