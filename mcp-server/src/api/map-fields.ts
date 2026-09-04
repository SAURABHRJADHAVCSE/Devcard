import { Hono } from "hono";
import { mapFieldsRequestSchema } from "../ai/field-mapper-schema";
import { mapFieldsToProfile } from "../ai/field-mapper";

export const mapFieldsRouter = new Hono();

mapFieldsRouter.post("/", async (c) => {
  const { fields } = mapFieldsRequestSchema.parse(await c.req.json());
  const mappings = await mapFieldsToProfile(fields);
  return c.json({ mappings });
});
