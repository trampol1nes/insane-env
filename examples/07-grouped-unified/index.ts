import { createGroupedEnv, derive } from "@env-supreme/core";
import { z } from "zod";

const dbSchema = z.object({
  HOST: z.string(),
  PORT: z.coerce.number().int().positive(),
  NAME: z.string(),
});

const authSchema = z.object({
  JWT_SECRET: z.string().min(8),
  TOKEN_TTL: z.coerce.number().int().positive(),
});

const env = createGroupedEnv({
  groups: {
    database: {
      files: [".env.example"],
      sources: [],
      prefix: "DB_",
      validate: (raw) => dbSchema.parse(raw),
    },
    auth: {
      files: [".env.example"],
      sources: [],
      prefix: "AUTH_",
      validate: (raw) => authSchema.parse(raw),
    },
    redis: {
      files: [".env.example"],
      sources: [],
    },
  },
});

console.log("== lazy eval proof ==");
let touched = 0;
const counted = createGroupedEnv({
  groups: {
    a: {
      files: [".env.example"],
      sources: [],
      validate: (raw) => {
        touched++;
        return raw;
      },
    },
    b: {
      files: [".env.example"],
      sources: [],
      validate: (raw) => {
        touched++;
        return raw;
      },
    },
  },
});
void counted.a;
console.log("after accessing .a only, groups evaluated =", touched); // 1
void counted.a;
console.log("accessing .a again (cached) =", touched); // still 1
void counted.b;
console.log("after accessing .b =", touched); // 2

console.log("\n== unified groups ==");
console.log("db:", env.database);
console.log("auth.JWT_SECRET:", env.auth.JWT_SECRET);
console.log("redis raw REDIS_URL:", env.redis.REDIS_URL);

console.log("\n== derive: cross-group reference ==");
const connectionUrl = derive(
  env,
  (e) => `postgres://${e.database.HOST}:${e.database.PORT}/${e.database.NAME}`,
);
console.log("connectionUrl (lazy):", connectionUrl.value);

try {
  (env as unknown as { database: unknown }).database = {};
} catch (e) {
  console.log("\ngrouped env is immutable ✓", (e as Error).message);
}
