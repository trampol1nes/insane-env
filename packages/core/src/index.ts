export const VERSION = "0.0.0";

export type EnvMap = Record<string, string>;

export interface EnvSupremeOptions {
  files?: string[];
  validate?: <T>(env: EnvMap) => T;
}

export {};
