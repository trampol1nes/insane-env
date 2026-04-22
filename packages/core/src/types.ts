export type EnvMap = Record<string, string>;

export type EnvSource = Record<string, string | undefined>;

export type ValidateHook<T> = (raw: EnvMap) => T;

export interface CreateEnvOptions<T = EnvMap> {
  files?: string[];
  sources?: EnvSource[];
  validate?: ValidateHook<T>;
  cwd?: string;
}
