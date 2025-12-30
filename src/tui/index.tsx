import React from "react";
import { render } from "ink";
import { App } from "./app.js";
import { ChatProvider } from "./chat-context.js";
import type { TUIAgent, TUIOptions } from "./types.js";

export type { TUIOptions, AutoAcceptMode } from "./types.js";
export { useChatContext, ChatProvider } from "./chat-context.js";

/**
 * Create a Claude Code-style TUI for any ToolLoopAgent.
 *
 * @example
 * ```ts
 * import { createTUI } from './tui';
 * import { myAgent } from './agent';
 *
 * // Interactive REPL mode
 * await createTUI(myAgent);
 *
 * // One-shot mode with initial prompt
 * await createTUI(myAgent, {
 *   initialPrompt: "Explain this codebase",
 *   agentOptions: { workingDirectory: process.cwd() }
 * });
 * ```
 */
export async function createTUI(
  agent: TUIAgent,
  options: TUIOptions,
): Promise<void> {
  const { waitUntilExit } = render(
    <ChatProvider
      agent={agent}
      agentOptions={options.agentOptions}
      model={options.header?.model}
      workingDirectory={options.workingDirectory}
    >
      <App options={options} />
    </ChatProvider>,
  );

  await waitUntilExit();
}

/**
 * Render the TUI without waiting for exit.
 * Useful for programmatic control.
 */
export function renderTUI(agent: TUIAgent, options: TUIOptions) {
  return render(
    <ChatProvider
      agent={agent}
      agentOptions={options.agentOptions}
      model={options.header?.model}
      workingDirectory={options.workingDirectory}
    >
      <App options={options} />
    </ChatProvider>,
  );
}

// Re-export components for custom TUI composition
export * from "./components/index.js";

// Re-export transport for custom usage
export { createAgentTransport } from "./transport.js";
