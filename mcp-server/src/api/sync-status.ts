import { Hono } from "hono";
import { db } from "../db/client";
import { syncStatus } from "../db/schema";

const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // a day without a sync counts as stale

export const syncStatusRouter = new Hono();

syncStatusRouter.get("/", async (c) => {
  const rows = await db.select().from(syncStatus);
  const now = Date.now();
  return c.json(
    rows.map((row) => ({
      platform: row.platform,
      lastSynced: row.lastSyncedAt,
      isStale: now - row.lastSyncedAt.getTime() > STALE_AFTER_MS,
    })),
  );
});

syncStatusRouter.post("/:platform", async (c) => {
  const platform = c.req.param("platform");
  const now = new Date();
  await db
    .insert(syncStatus)
    .values({ platform, lastSyncedAt: now })
    .onConflictDoUpdate({ target: syncStatus.platform, set: { lastSyncedAt: now } });

  return c.json({ platform, lastSynced: now, isStale: false });
});
