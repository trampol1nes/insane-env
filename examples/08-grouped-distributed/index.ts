import { createEnv } from "@env-supreme/core";

export const dbEnv = createEnv({
  files: [".env.example"],
  sources: [],
  prefix: "DB_",
  validate: (raw) => ({
    host: raw.HOST ?? "",
    port: Number(raw.PORT),
  }),
});

export const authEnv = createEnv({
  files: [".env.example"],
  sources: [],
  prefix: "AUTH_",
  validate: (raw) => ({
    jwtSecret: raw.JWT_SECRET ?? "",
  }),
});

console.log("dbEnv:", dbEnv);
console.log("authEnv:", authEnv);
console.log("dbEnv has no JWT_SECRET:", "jwtSecret" in dbEnv);
console.log("authEnv has no host:", "host" in authEnv);
console.log("both frozen:", Object.isFrozen(dbEnv) && Object.isFrozen(authEnv));
