import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;

console.log(
  "PRISMA CONFIG DEBUG:",
  databaseUrl
    ? `${databaseUrl.slice(0, 20)}...`
    : "DATABASE_URL MISSING"
);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});