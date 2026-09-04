import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getFullProfile } from "../../db/get-full-profile";

export function registerProfileResources(server: McpServer) {
  server.registerResource(
    "profile",
    "profile://me",
    { title: "Full profile", description: "Complete profile JSON, all tables joined.", mimeType: "application/json" },
    async (uri) => {
      const full = await getFullProfile();
      return {
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(full, null, 2) }],
      };
    },
  );

  server.registerResource(
    "skills",
    "profile://skills",
    { title: "Skills", description: "Skills list grouped by category.", mimeType: "application/json" },
    async (uri) => {
      const full = await getFullProfile();
      const byCategory: Record<string, typeof full.skills> = {};
      for (const skill of full.skills) {
        (byCategory[skill.category] ??= []).push(skill);
      }
      return {
        contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(byCategory, null, 2) }],
      };
    },
  );
}
