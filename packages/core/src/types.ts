export type EnvMap = Record<string, string>;

export type EnvSource = Record<string, string | undefined>;

export type ValidateHook<T> = (raw: EnvMap) => T;

export interface CreateEnvOptions<T = EnvMap> {
  files?: string[];
  sources?: EnvSource[];
  validate?: ValidateHook<T>;
  cwd?: string;
  prefix?: string;
}

export interface GroupOptions<T = EnvMap> extends CreateEnvOptions<T> {}

export interface CreateGroupedEnvOptions<
  G extends Record<string, GroupOptions<unknown>>,
> {
  groups: G;
  cwd?: string;
}

export type GroupedEnv<G extends Record<string, GroupOptions<unknown>>> = {
  readonly [K in keyof G]: G[K] extends GroupOptions<infer T>
    ? Readonly<T>
    : never;
};

export interface Derived<T> {
  readonly value: Readonly<T>;
}

