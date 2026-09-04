import type { AIProvider } from "./providers/types";
import { AnthropicProvider } from "./providers/anthropic";
import { GlmProvider } from "./providers/glm";

// AI_PROVIDER picks which LLM handles every AI task in this app (delta
// parsing, field mapping, ...). Only one provider's key is required —
// whichever you set AI_PROVIDER to. Defaults to "anthropic".
function buildProvider(): AIProvider {
  const requested = (process.env.AI_PROVIDER ?? "anthropic").toLowerCase();

  if (requested === "glm") {
    const apiKey = process.env.GLM_API_KEY;
    if (!apiKey) throw new Error("AI_PROVIDER=glm but GLM_API_KEY is not set in .env");
    return new GlmProvider(apiKey);
  }

  if (requested === "anthropic") {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("AI_PROVIDER=anthropic but ANTHROPIC_API_KEY is not set in .env");
    return new AnthropicProvider(apiKey);
  }

  throw new Error(`Unknown AI_PROVIDER "${requested}" — expected "anthropic" or "glm"`);
}

let provider: AIProvider | undefined;

export function getProvider(): AIProvider {
  provider ??= buildProvider();
  return provider;
}
