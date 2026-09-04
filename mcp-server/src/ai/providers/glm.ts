import type { AIProvider, ToolCallRequest } from "./types";

// glm-4.7-flash is z.ai's free tier (glm-5.3 is paid, $1.4/$4.4 per MTok) —
// default to free so a key with no balance still works; override via
// GLM_MODEL once you're on a funded plan and want the flagship model.
// glm-4.7-flash was overloaded (429/1305) when this was tested; glm-4.5-flash
// worked reliably — set GLM_MODEL=glm-4.5-flash if you hit that.
const DEFAULT_MODEL = "glm-4.7-flash";
const ENDPOINT = "https://api.z.ai/api/paas/v4/chat/completions";

interface GlmChatCompletionResponse {
  choices?: {
    message?: {
      tool_calls?: { function: { name: string; arguments: string } }[];
    };
  }[];
}

// GLM (z.ai) has no official Anthropic-shaped SDK, so this talks to its
// OpenAI-compatible chat-completions endpoint directly. One real difference
// from the Anthropic provider: GLM's tool_choice only supports "auto" (no
// forced tool-calling), so the model can legally reply with plain text
// instead of a tool call — callers treat an empty/missing tool call as "no
// mapping found" rather than an error.
export class GlmProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = process.env.GLM_MODEL ?? DEFAULT_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async callTool({ system, userMessage, toolName, toolDescription, jsonSchema }: ToolCallRequest): Promise<unknown> {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMessage },
        ],
        tools: [
          {
            type: "function",
            function: { name: toolName, description: toolDescription, parameters: jsonSchema },
          },
        ],
        tool_choice: "auto",
      }),
    });

    if (!res.ok) {
      throw new Error(`GLM API error ${res.status}: ${await res.text()}`);
    }

    const body = (await res.json()) as GlmChatCompletionResponse;
    const toolCall = body.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) return {};

    return JSON.parse(toolCall.function.arguments);
  }
}
