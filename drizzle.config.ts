import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso", // important — not "sqlite"
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});
