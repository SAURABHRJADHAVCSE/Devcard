import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { profile, skills, experiences, projects, education } from "../db/schema";
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

// Mirrors the remove_skill/remove_experience/remove_project/remove_education
// MCP tools (mcp-server/src/mcp/tools/) — same DB operations, exposed over
// HTTP so the dashboard (which talks to this server via fetch, not MCP) can
// delete an entry without going through Claude. Each returns the fresh full
// profile so the dashboard can update its view straight from the response.
profileRouter.delete("/skills/:id", async (c) => {
  const id = c.req.param("id");
  await logKnowledgeEvent("direct", { op: "remove_skill", id });
  await db.delete(skills).where(eq(skills.id, id));
  return c.json(await getFullProfile());
});

profileRouter.delete("/experiences/:id", async (c) => {
  const id = c.req.param("id");
  await logKnowledgeEvent("direct", { op: "remove_experience", id });
  await db.delete(experiences).where(eq(experiences.id, id));
  return c.json(await getFullProfile());
});

profileRouter.delete("/projects/:id", async (c) => {
  const id = c.req.param("id");
  await logKnowledgeEvent("direct", { op: "remove_project", id });
  await db.delete(projects).where(eq(projects.id, id));
  return c.json(await getFullProfile());
});

profileRouter.delete("/education/:id", async (c) => {
  const id = c.req.param("id");
  await logKnowledgeEvent("direct", { op: "remove_education", id });
  await db.delete(education).where(eq(education.id, id));
  return c.json(await getFullProfile());
});
