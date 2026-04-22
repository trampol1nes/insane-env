import { createEnv } from "@env-supreme/core";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().positive(),
  DEBUG: z.enum(["true", "false"]).transform((v) => v === "true"),
  DATABASE_URL: z.string().url(),
});

process.env.PORT = "3000";

const env = createEnv({
  files: [".env.example"],
  validate: (raw) => schema.parse(raw),
});

console.log("env:", env);
console.log("PORT is number:", typeof env.PORT === "number");
console.log("DEBUG is boolean:", typeof env.DEBUG === "boolean");
console.log(
  "process.env.PORT is still raw string:",
  JSON.stringify(process.env.PORT),
);
