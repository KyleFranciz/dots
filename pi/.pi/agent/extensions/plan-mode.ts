import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";

interface PlanStep {
  step: number;
  text: string;
}

interface PlanState {
  enabled: boolean;
  execution: boolean;
  plan: string | null;
  steps: PlanStep[];
  normalTools: string[];
}

const READ_ONLY_TOOLS = ["read", "bash", "grep", "find", "ls"];
const DESTRUCTIVE = [
  /\brm\b/i, /\bmv\b/i, /\bcp\b/i, /\bmkdir\b/i, /\btouch\b/i,
  /\bchmod\b/i, /\bchown\b/i, /\b(sudo|npm\s+(install|uninstall|update|ci|publish)|yarn\s+(add|remove|install|upgrade)|pnpm\s+(add|remove|install|upgrade)|pip\s+(install|uninstall))\b/i,
  /\bgit\s+(add|commit|push|pull|merge|rebase|reset|checkout|stash|tag)\b/i,
  /(^|[^<])>(?!>)/, />>/,
];
const SAFE_BASH = [/^\s*(cat|head|tail|less|more|grep|rg|find|fd|ls|pwd|tree)\b/i,
  /^\s*git\s+(status|log|diff|show|branch)\b/i,
  /^\s*npm\s+(list|ls|view|info|outdated|audit)\b/i,
  /^\s*(node|python)\s+--version\b/i, /^\s*(uname|whoami|date|uptime)\b/i];

function safeCommand(command: string): boolean {
  return !DESTRUCTIVE.some((pattern) => pattern.test(command)) && SAFE_BASH.some((pattern) => pattern.test(command));
}

function assistantText(messages: Array<{ role?: string; content?: unknown }>): string | null {
  const message = [...messages].reverse().find((item) => item.role === "assistant");
  if (!message) return null;
  if (typeof message.content === "string") return message.content;
  if (!Array.isArray(message.content)) return null;
  const text = message.content
    .filter((part): part is { type: string; text: string } => Boolean(part && typeof part === "object" && "type" in part && "text" in part))
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n").trim();
  return text || null;
}

function extractPlan(text: string): { raw: string; steps: PlanStep[] } | null {
  const header = text.match(/\*{0,2}Plan:?\*{0,2}\s*\n/i);
  if (!header) return null;
  const steps: PlanStep[] = [];
  for (const match of text.slice((header.index ?? 0) + header[0].length).matchAll(/^\s*(\d+)[.)]\s+(.+)$/gm)) {
    const step = Number(match[1]);
    if (Number.isFinite(step) && match[2]?.trim()) steps.push({ step, text: match[2].trim() });
  }
  return steps.length ? { raw: steps.map((step) => `${step.step}. ${step.text}`).join("\n"), steps } : null;
}

export default function planModeExtension(pi: ExtensionAPI): void {
  let enabled = false;
  let execution = false;
  let plan: string | null = null;
  let steps: PlanStep[] = [];
  let normalTools: string[] = [];

  const persist = () => pi.appendEntry("plan-mode-state", { enabled, execution, plan, steps, normalTools } satisfies PlanState);
  const status = (ctx: ExtensionContext) => {
    ctx.ui.setStatus("plan-mode", enabled
      ? ctx.ui.theme.fg("warning", "⏸ plan")
      : execution ? ctx.ui.theme.fg("accent", "⚙ executing plan") : undefined);
    ctx.ui.setWidget("plan-preview", plan && enabled ? plan.split("\n").map((line) => ctx.ui.theme.fg("muted", line)) : undefined);
  };
  const tools = (names: string[]) => {
    const available = new Set(pi.getAllTools().map((tool) => tool.name));
    return names.filter((name, index) => available.has(name) && names.indexOf(name) === index);
  };
  const setEnabled = (ctx: ExtensionContext, value: boolean) => {
    enabled = value;
    if (value) {
      if (!normalTools.length) normalTools = pi.getActiveTools();
      pi.setActiveTools(tools(READ_ONLY_TOOLS));
      ctx.ui.notify("Plan mode enabled. Read-only exploration; no files will be changed.", "info");
    } else {
      pi.setActiveTools(normalTools.length ? normalTools : pi.getActiveTools());
      ctx.ui.notify("Plan mode disabled. Full tool access restored.", "info");
    }
    status(ctx);
    persist();
  };
  const toggle = (ctx: ExtensionContext) => setEnabled(ctx, !enabled);

  pi.registerFlag("plan", { description: "Start in read-only plan mode", type: "boolean", default: false });
  pi.registerCommand("plan", { description: "Toggle read-only plan mode", handler: async (_args, ctx) => toggle(ctx) });
  pi.registerCommand("plan-off", { description: "Disable plan mode", handler: async (_args, ctx) => setEnabled(ctx, false) });

  pi.registerShortcut("shift+tab", {
    description: "Cycle normal, plan, and learn modes",
    handler: async (ctx) => {
      const learnState = ctx.sessionManager.getEntries()
        .filter((item) => item.type === "custom" && item.customType === "learn-mode-state")
        .pop() as { data?: { enabled?: boolean } } | undefined;
      if (learnState?.data?.enabled) {
        pi.sendUserMessage("/learn-off");
      } else if (enabled) {
        setEnabled(ctx, false);
        pi.sendUserMessage("/learn");
      } else {
        setEnabled(ctx, true);
      }
    },
  });

  pi.on("tool_call", async (event) => {
    if (!enabled || execution || event.toolName !== "bash") return;
    const command = (event.input as { command?: string }).command ?? "";
    if (!safeCommand(command)) return { block: true, reason: `Plan mode only allows read-only bash commands. Disable plan mode first.\nCommand: ${command}` };
  });

  pi.on("before_agent_start", async () => {
    if (enabled) return { message: { customType: "plan-mode-context", display: false, content: `[PLAN MODE ACTIVE]\nYou are in read-only planning mode. Explore the codebase and understand the request, but do not edit files or run mutating commands. End with a concise numbered plan under exactly a "Plan:" header. Do not execute the plan.` } };
    if (execution && plan) return { message: { customType: "plan-execution-context", display: false, content: `[EXECUTING APPROVED PLAN]\nImplement the approved plan below. Work through it in order, make the necessary changes, and verify the result.\n\n${plan}` } };
  });

  pi.on("agent_end", async (event, ctx) => {
    if (execution) {
      execution = false;
      plan = null;
      steps = [];
      persist();
      status(ctx);
      return;
    }
    if (!enabled) return;
    const text = assistantText(event.messages ?? []);
    const extracted = text && extractPlan(text);
    if (!extracted) return;
    plan = extracted.raw;
    steps = extracted.steps;
    persist();
    status(ctx);
    const choice = await ctx.ui.select("Plan ready — what next?", ["Execute plan", "Refine plan", "Stay in plan mode"]);
    if (choice === "Execute plan") {
      execution = true;
      setEnabled(ctx, false);
      status(ctx);
      persist();
      pi.sendUserMessage(`Execute this approved plan:\n\n${plan}`);
    } else if (choice === "Refine plan") {
      const feedback = await ctx.ui.editor("How should the plan change?", "");
      if (feedback?.trim()) pi.sendUserMessage(`Revise the plan using this feedback. Stay read-only and output only the updated numbered plan under a Plan: header.\n\n${feedback.trim()}`);
    }
  });

  pi.on("session_start", async (_event, ctx) => {
    const entry = ctx.sessionManager.getEntries().filter((item) => item.type === "custom" && item.customType === "plan-mode-state").pop() as { data?: PlanState } | undefined;
    normalTools = pi.getActiveTools();
    if (entry?.data) ({ enabled, execution, plan, steps, normalTools } = entry.data);
    if (pi.getFlag("plan") === true) enabled = true;
    if (enabled) pi.setActiveTools(tools(READ_ONLY_TOOLS));
    status(ctx);
  });
}
