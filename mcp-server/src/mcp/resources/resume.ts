import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getFullProfile, formatResumeMarkdown } from "../../db/get-full-profile";

export function registerResumeResource(server: McpServer) {
  server.registerResource(
    "resume",
    "profile://resume",
    { title: "Resume (markdown)", description: "Profile formatted as clean markdown.", mimeType: "text/markdown" },
    async (uri) => {
      const full = await getFullProfile();
      return {
        contents: [{ uri: uri.href, mimeType: "text/markdown", text: formatResumeMarkdown(full) }],
      };
    },
  );
}
