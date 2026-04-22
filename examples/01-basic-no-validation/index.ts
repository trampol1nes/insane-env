import { createEnv } from "@env-supreme/core";

const env = createEnv({ files: [".env.example"], sources: [] });

console.log("env:", env);
console.log("typeof env.PORT:", typeof env.PORT);
console.log("isFrozen:", Object.isFrozen(env));

try {
  (env as Record<string, string>).PORT = "9999";
  console.log("mutation succeeded (unexpected)");
} catch {
  console.log("mutation rejected: frozen ✓");
}
