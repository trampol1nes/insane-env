import { deepFreeze } from "./freeze.js";
import type {
  CreateGroupedEnvOptions,
  Derived,
  GroupedEnv,
  GroupOptions,
} from "./types.js";

type EnvFactory = (opts: GroupOptions<unknown>) => unknown;

export function makeGroupedEnv<
  G extends Record<string, GroupOptions<unknown>>,
>(
  options: CreateGroupedEnvOptions<G>,
  buildOne: EnvFactory,
): GroupedEnv<G> {
  const groupNames = Object.keys(options.groups);
  const cache = new Map<string, unknown>();

  const target = Object.create(null) as Record<string, unknown>;

  const handler: ProxyHandler<typeof target> = {
    get(_, key) {
      if (typeof key !== "string") return undefined;
      if (cache.has(key)) return cache.get(key);
      const groupOpts = options.groups[key];
      if (!groupOpts) return undefined;
      const merged: GroupOptions<unknown> = { ...groupOpts };
      if (merged.cwd === undefined && options.cwd !== undefined) {
        merged.cwd = options.cwd;
      }
      const value = buildOne(merged);
      cache.set(key, value);
      return value;
    },
    has(_, key) {
      return typeof key === "string" && key in options.groups;
    },
    ownKeys() {
      return groupNames;
    },
    getOwnPropertyDescriptor(_, key) {
      if (typeof key !== "string" || !(key in options.groups)) return undefined;
      return {
        enumerable: true,
        configurable: true,
        writable: false,
        value: handler.get!(target, key, target),
      };
    },
    set() {
      throw new TypeError(
        "Grouped env is immutable; assignment is not permitted",
      );
    },
    deleteProperty() {
      throw new TypeError(
        "Grouped env is immutable; deletion is not permitted",
      );
    },
    defineProperty() {
      throw new TypeError(
        "Grouped env is immutable; defineProperty is not permitted",
      );
    },
  };

  return new Proxy(target, handler) as GroupedEnv<G>;
}

export function derive<G, T>(env: G, fn: (e: G) => T): Derived<T> {
  let computed: Readonly<T> | undefined;
  let resolved = false;
  return Object.freeze({
    get value(): Readonly<T> {
      if (!resolved) {
        computed = deepFreeze(fn(env));
        resolved = true;
      }
      return computed as Readonly<T>;
    },
  });
}
