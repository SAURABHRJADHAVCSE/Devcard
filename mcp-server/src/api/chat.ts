import { Hono } from "hono";
import { z } from "zod";
import { parseMessageToDelta } from "../ai/parser";
import { applyDelta } from "../db/apply-delta";
import { logKnowledgeEvent } from "../db/log-event";

export const chatRouter = new Hono();

const bodySchema = z.object({ message: z.string() });

chatRouter.post("/", async (c) => {
  const { message } = bodySchema.parse(await c.req.json());

  const delta = await parseMessageToDelta(message);
  await logKnowledgeEvent("chat", delta, message);
  const summary = await applyDelta(delta);

  return c.json({ summary });
});
