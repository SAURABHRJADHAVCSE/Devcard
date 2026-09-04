// A single tool-call request shape shared by every AI task in this app
// (delta parsing, field mapping, ...) so adding a new task never means
// adding a new provider method — just a new caller of callTool().
export interface ToolCallRequest {
  system: string;
  userMessage: string;
  toolName: string;
  toolDescription: string;
  jsonSchema: object;
}

export interface AIProvider {
  // Returns the tool call's raw parsed input — the caller validates it
  // against its own zod schema (providers don't know about app-level types).
  callTool(request: ToolCallRequest): Promise<unknown>;
}
