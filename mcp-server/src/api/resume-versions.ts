import { Hono } from "hono";
import { tailorResume } from "../ai/tailor-resume";
import { listResumeVersions, getResumeVersion, saveResumeVersion, deleteResumeVersion } from "../db/resume-versions";
import { logKnowledgeEvent } from "../db/log-event";

export const resumeVersionsRouter = new Hono();

// Analysis only — never saves anything. The dashboard shows this result
// (summary/matchedSkills/missingSkills/suggestedProjects) for the user to
// review and edit before a separate POST / actually persists a version.
resumeVersionsRouter.post("/tailor", async (c) => {
  const { jobDescription, requiredSkills } = await c.req.json();
  if (!jobDescription || typeof jobDescription !== "string") {
    return c.json({ error: "jobDescription is required" }, 400);
  }
  const result = await tailorResume(jobDescription, requiredSkills);
  return c.json(result);
});

resumeVersionsRouter.get("/", async (c) => {
  return c.json(await listResumeVersions());
});

resumeVersionsRouter.get("/:id", async (c) => {
  const version = await getResumeVersion(c.req.param("id"));
  if (!version) return c.json({ error: "Not found" }, 404);
  return c.json(version);
});

resumeVersionsRouter.post("/", async (c) => {
  const body = await c.req.json();
  if (!body.name || typeof body.name !== "string") {
    return c.json({ error: "name is required" }, 400);
  }
  await logKnowledgeEvent("direct", { op: "save_resume_version", name: body.name });
  const version = await saveResumeVersion(body);
  return c.json(version);
});

resumeVersionsRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  await logKnowledgeEvent("direct", { op: "remove_resume_version", id });
  const deleted = await deleteResumeVersion(id);
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json(deleted);
});
