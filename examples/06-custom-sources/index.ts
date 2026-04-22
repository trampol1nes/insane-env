import { createEnv } from "@env-supreme/core";

const fakeVault = { DATABASE_PASSWORD: "s3cret", JWT_SECRET: "from-vault" };
const defaults = { DATABASE_PASSWORD: "dev-placeholder", PORT: "3000" };

const env = createEnv({
  sources: [defaults, fakeVault],
});

console.log(env);
// DATABASE_PASSWORD -> "s3cret"     (fakeVault wins, declared later)
// JWT_SECRET        -> "from-vault"
// PORT              -> "3000"
