import { collectEnv } from "./collect.js";
import {
  EnvSupremeLoadError,
  EnvSupremeValidationError,
  NotImplementedError,
} from "./errors.js";
import { deepFreeze } from "./freeze.js";
import type {
  CreateEnvOptions,
  EnvMap,
  EnvSource,
  ValidateHook,
} from "./types.js";

export const VERSION = "0.0.0";

export function createEnv(options?: CreateEnvOptions<EnvMap>): Readonly<EnvMap>;
export function createEnv<T>(options: CreateEnvOptions<T>): Readonly<T>;
export function createEnv<T>(
  options: CreateEnvOptions<T> = {} as CreateEnvOptions<T>,
): Readonly<T> {
  const raw = collectEnv(options as CreateEnvOptions<unknown>);

  let result: unknown;
  if (typeof options.validate === "function") {
    try {
      result = options.validate(raw);
    } catch (cause) {
      throw new EnvSupremeValidationError(
        "Environment validation hook threw an error",
        { cause },
      );
    }
  } else {
    result = raw;
  }

  return deepFreeze(result) as Readonly<T>;
}

export {
  EnvSupremeLoadError,
  EnvSupremeValidationError,
  NotImplementedError,
  deepFreeze,
  collectEnv,
};

export type { CreateEnvOptions, EnvMap, EnvSource, ValidateHook };
