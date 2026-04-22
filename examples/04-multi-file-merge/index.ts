import { createEnv } from "@env-supreme/core";

const env = createEnv({
  files: [".env.example", ".env.local.example"],
  sources: [{ APP_NAME: "from-os" }],
});

console.log(env);
// APP_NAME  -> "from-os"  (sources beat files)
// PORT      -> "4000"     (.env.local overrides .env)
// LOG_LEVEL -> "debug"    (.env.local overrides .env)
