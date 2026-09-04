import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerProfileTools } from "./tools/profile";
import { registerSkillTools } from "./tools/skills";
import { registerExperienceTools } from "./tools/experience";
import { registerProjectTools } from "./tools/projects";
import { registerEducationTools } from "./tools/education";
import { registerCertificationTools } from "./tools/certifications";
import { registerPdfTools } from "./tools/pdf";
import { registerChatTools } from "./tools/chat";
import { registerProfileResources } from "./resources/profile";
import { registerResumeResource } from "./resources/resume";

export function createMcpServer() {
  const server = new McpServer({ name: "devcard", version: "0.1.0" });

  registerProfileTools(server);
  registerSkillTools(server);
  registerExperienceTools(server);
  registerProjectTools(server);
  registerEducationTools(server);
  registerCertificationTools(server);
  registerPdfTools(server);
  registerChatTools(server);
  registerProfileResources(server);
  registerResumeResource(server);

  return server;
}
