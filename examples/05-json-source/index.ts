import { createEnv } from "@env-supreme/core";

const env = createEnv({
  files: ["config.json"],
  sources: [],
});

console.log(env);
// Non-string JSON values are stringified so everything reaching `validate()`
// is a uniform EnvMap — the validate hook then coerces to the real target type.
