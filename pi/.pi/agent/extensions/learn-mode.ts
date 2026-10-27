import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

type LearnState = { enabled: boolean; normalTools: string[] };

const READ_ONLY_TOOLS = ["read", "bash", "grep", "find", "ls"];
const SAFE_BASH = [
  /^\s*(cat|head|tail|less|more|grep|rg|find|fd|ls|pwd|tree)\b/i,
  /^\s*git\s+(status|log|diff|show|branch)\b/i,
  /^\s*(go|node|python|java|javac|rustc|cargo)\s+--version\b/i,
  /^\s*(uname|whoami|date|uptime)\b/i,
];

const LEARN_PROMPT = `
[LEARN MODE]
You are in a read-only, teaching-first learning mode.

Non-negotiable rules:
- Never edit or write files, and never run commands that mutate source, dependencies, git state, or project data.
- Do not take over implementation. The learner should write the solution themselves.
- You may inspect code and local documentation, then explain what you found.

Teaching approach:
- Start with the learner's goal and current level; ask one focused question when context is missing.
- Explain mental models and the "why" before syntax. Connect language behavior to what happens at runtime, in memory, in the compiler, and across processes when relevant.
- For code questions, guide with decomposition, hints, pseudocode, small examples, and checks rather than handing over a complete implementation.
- Make tradeoffs explicit: correctness, complexity, performance, reliability, security, operability, and maintainability.
- For library documentation, identify the relevant concept/API, explain its contract and lifecycle, show a minimal example, and call out version or configuration assumptions. Prefer repository documentation; do not invent APIs.
- For system design, clarify requirements and constraints first, then work through boundaries, data flow, APIs, storage, consistency, failure modes, scaling, observability, security, and deployment. Compare alternatives and explain when each is appropriate.
- Encourage the learner to predict an outcome or propose the next step before revealing it. End substantial lessons with a short recap and a small exercise or verification question.
- Match the active language and use modern idioms. Default to Go, TypeScript, Python, and Java when the language is unclear.
`;

function safeCommand(command: string): boolean {
  return SAFE_BASH.some((pattern) => pattern.test(command));
}

export default function learnMode(pi: ExtensionAPI): void {
  let enabled = false;
  let normalTools: string[] = [];

  const availableReadOnlyTools = () => {
    const available = new Set(pi.getAllTools().map((tool) => tool.name));
    return READ_ONLY_TOOLS.filter((name) => available.has(name));
  };

  const updateStatus = (ctx: ExtensionContext) => {
    ctx.ui.setStatus("learn-mode", enabled ? ctx.ui.theme.fg("accent", "🎓 learn") : undefined);
  };

  const setEnabled = (ctx: ExtensionContext, value: boolean) => {
    enabled = value;
    if (value) {
      if (!normalTools.length) normalTools = pi.getActiveTools();
      pi.setActiveTools(availableReadOnlyTools());
      ctx.ui.notify("Learn mode enabled. Read-only teaching; files cannot be changed.", "info");
    } else {
      pi.setActiveTools(normalTools.length ? normalTools : pi.getActiveTools());
      ctx.ui.notify("Learn mode disabled. Normal tool access restored.", "info");
    }
    updateStatus(ctx);
    pi.appendEntry("learn-mode-state", { enabled, normalTools } satisfies LearnState);
  };

  pi.registerFlag("learn", { description: "Start in read-only learning mode", type: "boolean", default: false });
  pi.registerCommand("learn", { description: "Toggle read-only learning mode", handler: async (_args, ctx) => setEnabled(ctx, !enabled) });
  pi.registerCommand("learn-off", { description: "Disable learning mode", handler: async (_args, ctx) => setEnabled(ctx, false) });
  pi.registerCommand("learn-status", { description: "Show learning mode status", handler: async (_args, ctx) => {
    updateStatus(ctx);
    ctx.ui.notify(`Learn mode: ${enabled ? "enabled" : "disabled"}`, "info");
  } });

  pi.on("tool_call", async (event) => {
    if (!enabled) return;
    if (!READ_ONLY_TOOLS.includes(event.toolName)) {
      return { block: true, reason: "Learn mode only allows read-only tools. Disable learn mode first." };
    }
    if (event.toolName !== "bash") return;
    const command = (event.input as { command?: string }).command ?? "";
    if (!safeCommand(command)) {
      return { block: true, reason: `Learn mode only allows read-only inspection commands. Disable learn mode first.\nCommand: ${command}` };
    }
  });

  pi.on("before_agent_start", async (event) => {
    if (!enabled) return;
    return { systemPrompt: `${event.systemPrompt}\n\n${LEARN_PROMPT}` };
  });

  pi.on("session_start", async (_event, ctx) => {
    normalTools = pi.getActiveTools();
    const entry = ctx.sessionManager.getEntries()
      .filter((item) => item.type === "custom" && item.customType === "learn-mode-state")
      .pop() as { data?: LearnState } | undefined;
    if (entry?.data) ({ enabled, normalTools } = entry.data);
    if (pi.getFlag("learn") === true) enabled = true;
    if (enabled) pi.setActiveTools(availableReadOnlyTools());
    updateStatus(ctx);
  });
}
