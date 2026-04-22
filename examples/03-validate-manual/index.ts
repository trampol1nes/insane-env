import { createEnv, EnvSupremeValidationError } from "@env-supreme/core";

interface Config {
  port: number;
  retries: number;
  featureFlags: readonly string[];
}

const env = createEnv({
  files: [".env.example"],
  validate: (raw): Config => {
    const port = Number(raw.PORT);
    if (!Number.isInteger(port) || port <= 0) {
      throw new Error(`PORT must be a positive integer, got ${raw.PORT}`);
    }
    const retries = Number(raw.RETRIES);
    if (!Number.isInteger(retries) || retries < 0) {
      throw new Error(`RETRIES must be a non-negative integer, got ${raw.RETRIES}`);
    }
    const featureFlags = (raw.FEATURE_FLAGS ?? "").split(",").filter(Boolean);
    return { port, retries, featureFlags };
  },
});

console.log("env:", env);
console.log("featureFlags is frozen:", Object.isFrozen(env.featureFlags));

try {
  createEnv({
    sources: [{ PORT: "not-a-number" }],
    validate: (raw) => {
      const p = Number(raw.PORT);
      if (Number.isNaN(p)) throw new Error("PORT not numeric");
      return { port: p };
    },
  });
} catch (err) {
  console.log("caught:", err instanceof EnvSupremeValidationError);
  console.log("cause:", (err as EnvSupremeValidationError).cause);
}
