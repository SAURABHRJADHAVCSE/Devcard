import { Hono } from "hono";
import { listJobPlatforms, addJobPlatform, deleteJobPlatform } from "../db/job-platforms";

export const jobPlatformsRouter = new Hono();

jobPlatformsRouter.get("/", async (c) => c.json(await listJobPlatforms()));

jobPlatformsRouter.post("/", async (c) => {
  const { name, baseUrl } = await c.req.json();
  if (!name || !baseUrl) return c.json({ error: "name and baseUrl are required" }, 400);
  return c.json(await addJobPlatform(name, baseUrl));
});

jobPlatformsRouter.delete("/:id", async (c) => {
  const deleted = await deleteJobPlatform(c.req.param("id"));
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json(deleted);
});
