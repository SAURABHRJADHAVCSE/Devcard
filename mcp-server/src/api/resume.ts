import { Hono } from "hono";
import { getFullProfile, formatResumeMarkdown } from "../db/get-full-profile";

export const resumeRouter = new Hono();

resumeRouter.get("/", async (c) => {
  const full = await getFullProfile();
  return c.text(formatResumeMarkdown(full), 200, { "Content-Type": "text/markdown; charset=utf-8" });
});
