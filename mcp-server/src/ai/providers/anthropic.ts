import Anthropic from "@anthropic-ai/sdk";
import type { AIProvider, ToolCallRequest } from "./types";

const DEFAULT_MODEL = "claude-opus-5";

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async callTool({ system, userMessage, toolName, toolDescription, jsonSchema }: ToolCallRequest): Promise<unknown> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system,
      tools: [{ name: toolName, description: toolDescription, input_schema: jsonSchema as Anthropic.Tool["input_schema"] }],
      tool_choice: { type: "tool", name: toolName },
      messages: [{ role: "user", content: userMessage }],
    });

    const toolUse = response.content.find((block) => block.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") return {};

    return toolUse.input;
  }
}
