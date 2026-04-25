import path from "path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: "postgresql://neondb_owner:npg_lxs4fZQhzKy5@ep-old-sky-amg3myeo-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
  migrate: {
    async adapter() {
      const { PrismaPg } = await import("@prisma/adapter-pg");
      return new PrismaPg({
        connectionString: "postgresql://neondb_owner:npg_lxs4fZQhzKy5@ep-old-sky-amg3myeo-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
      });
    },
  },
});