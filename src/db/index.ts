// Drizzle client over Neon's serverless HTTP driver.
//
// The neon-http driver is stateless (one HTTP request per query) which suits
// Next.js serverless/edge runtimes — no connection pool to manage. Import `db`
// in Server Components and Server Actions only; never from a client component.
//
// The underlying client is created lazily on first query so that importing this
// module (e.g. during `next build`) doesn't require DATABASE_URL to be set —
// only actually running a query does.

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";
import * as schema from "./schema";

let client: NeonHttpDatabase<typeof schema> | undefined;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (!client) {
    client = drizzle(neon(env.DATABASE_URL), { schema });
  }
  return client;
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    const value = getDb()[prop as keyof NeonHttpDatabase<typeof schema>];
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});

export { schema };
