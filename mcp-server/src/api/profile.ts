import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { profile } from "../db/schema";
import { getFullProfile } from "../db/get-full-profile";
import { logKnowledgeEvent } from "../db/log-event";

export const profileRouter = new Hono();

profileRouter.get("/", async (c) => {
  const full = await getFullProfile();
  return c.json(full);
});

profileRouter.patch("/", async (c) => {
  const updates = await c.req.json();
  await logKnowledgeEvent("direct", { op: "update_profile", ...updates });

  const [exists] = await db.select().from(profile).where(eq(profile.id, "me")).limit(1);
  if (exists) {
    await db.update(profile).set(updates).where(eq(profile.id, "me"));
  } else {
    await db.insert(profile).values({ ...updates, id: "me", name: updates.name ?? "" });
  }

  const full = await getFullProfile();
  return c.json(full.profile);
});
