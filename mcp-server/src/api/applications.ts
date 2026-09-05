import { Hono } from "hono";
import { listApplications, recordApplication, updateApplication, deleteApplication } from "../db/applications";

export const applicationsRouter = new Hono();

applicationsRouter.get("/", async (c) => c.json(await listApplications()));

applicationsRouter.post("/", async (c) => {
  const body = await c.req.json();
  if (!body.company || !body.role) return c.json({ error: "company and role are required" }, 400);
  return c.json(await recordApplication(body));
});

applicationsRouter.patch("/:id", async (c) => {
  const patch = await c.req.json();
  const updated = await updateApplication(c.req.param("id"), patch);
  if (!updated) return c.json({ error: "Not found" }, 404);
  return c.json(updated);
});

applicationsRouter.delete("/:id", async (c) => {
  const deleted = await deleteApplication(c.req.param("id"));
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json(deleted);
});
