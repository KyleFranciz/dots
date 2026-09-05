import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { Key } from "@mariozechner/pi-tui";

interface PlanStep {
  step: number;
  text: string;
  completed: boolean;
}

type PlanPhase = "planning" | "clarifying" | "ready" | "executing";

interface PlanState {
  enabled: boolean;
  pendingPlan: string | null;
  steps: PlanStep[];
  normalTools: string[];
  phase: PlanPhase;
  currentStepIndex: number;
}

const PLAN_TOOLS = ["read", "bash", "grep", "find", "ls"];

const DESTRUCTIVE_PATTERNS = [
  /\brm\b/i,
  /\bmv\b/i,
  /\bcp\b/i,
  /\bmkdir\b/i,
  /\btouch\b/i,
  /\bchmod\b/i,
  /\bchown\b/i,
  /\bnpm\s+(install|uninstall|update|ci|publish)/i,
  /\byarn\s+(add|remove|install|upgrade)/i,
  /\bpnpm\s+(add|remove|install|upgrade)/i,
  /\bpip\s+(install|uninstall)/i,
  /\bgit\s+(add|commit|push|pull|merge|rebase|reset|checkout|stash|tag)/i,
  /\bsudo\b/i,
  /(^|[^<])>(?!>)/,
  />>/,
];

const SAFE_BASH_PATTERNS = [
  /^\s*cat\b/i,
  /^\s*head\b/i,
  /^\s*tail\b/i,
  /^\s*less\b/i,
  /^\s*more\b/i,
  /^\s*grep\b/i,
  /^\s*find\b/i,
  /^\s*rg\b/i,
  /^\s*fd\b/i,
  /^\s*ls\b/i,
  /^\s*pwd\b/i,
  /^\s*tree\b/i,
  /^\s*git\s+(status|log|diff|show|branch)/i,
  /^\s*npm\s+(list|ls|view|info|outdated|audit)/i,
  /^\s*node\s+--version/i,
  /^\s*python\s+--version/i,
  /^\s*uname\b/i,
  /^\s*whoami\b/i,
  /^\s*date\b/i,
  /^\s*uptime\b/i,
];

function isSafeCommand(command: string): boolean {
  const destructive = DESTRUCTIVE_PATTERNS.some((pattern) => pattern.test(command));
  const safe = SAFE_BASH_PATTERNS.some((pattern) => pattern.test(command));
  return !destructive && safe;
}

function getAssistantText(messages: Array<{ role?: string; content?: unknown }>): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message?.role !== "assistant") continue;

    if (typeof message.content === "string") {
      return message.content;
    }

    if (Array.isArray(message.content)) {
      const text = message.content
        .filter((part): part is { type: string; text: string } => {
          return Boolean(part && typeof part === "object" && "type" in part && "text" in part);
        })
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n")
        .trim();

      return text.length > 0 ? text : null;
    }
  }

  return null;
}

function extractPlan(text: string): { rawPlan: string; steps: PlanStep[] } | null {
  const header = text.match(/\*{0,2}Plan:\*{0,2}\s*\n/i);
  if (!header) return null;

  const planText = text.slice(text.indexOf(header[0]) + header[0].length);
  const numberedPattern = /^\s*(\d+)[.)]\s+(.+)$/gm;
  const steps: PlanStep[] = [];

  for (const match of planText.matchAll(numberedPattern)) {
    const step = Number(match[1]);
    const line = match[2]?.trim();
    if (!Number.isFinite(step) || !line) continue;
    steps.push({ step, text: line, completed: false });
  }

  if (steps.length === 0) return null;

  const rawPlan = steps.map((s) => `${s.step}. ${s.text}`).join("\n");
  return { rawPlan, steps };
}

function isGoAheadText(text: string): boolean {
  const t = text.trim().toLowerCase();
  return ["go ahead", "go-ahead", "next", "next step", "continue", "proceed", "yes"].includes(t);
}

function isRunAllText(text: string): boolean {
  const t = text.trim().toLowerCase();
  return ["run all", "execute all", "do all", "run full plan", "execute full plan"].includes(t);
}

function isRevisePlanText(text: string): boolean {
  const t = text.trim().toLowerCase();
  return t === "revise plan" || t.startsWith("revise plan:");
}

export default function planModeExtension(pi: ExtensionAPI): void {
  let planModeEnabled = false;
  let pendingPlan: string | null = null;
  let steps: PlanStep[] = [];
  let normalTools: string[] = [];
  let phase: PlanPhase = "planning";
  let currentStepIndex = 0;

  const persist = () => {
    pi.appendEntry("plan-mode-state", {
      enabled: planModeEnabled,
      pendingPlan,
      steps,
      normalTools,
      phase,
      currentStepIndex,
    } satisfies PlanState);
  };

  const updateStatus = (ctx: ExtensionContext) => {
    if (planModeEnabled && phase === "planning") {
      ctx.ui.setStatus("plan-mode", ctx.ui.theme.fg("warning", "⏸ plan mode"));
    } else if (planModeEnabled && phase === "clarifying") {
      ctx.ui.setStatus("plan-mode", ctx.ui.theme.fg("warning", "❓ awaiting clarifications"));
    } else if (planModeEnabled && phase === "executing") {
      ctx.ui.setStatus("plan-mode", ctx.ui.theme.fg("accent", "⚙️ executing one approved step"));
    } else if (pendingPlan) {
      ctx.ui.setStatus("plan-mode", ctx.ui.theme.fg("accent", "📋 awaiting go-ahead"));
    } else {
      ctx.ui.setStatus("plan-mode", undefined);
    }

    if (pendingPlan && steps.length > 0 && (phase === "ready" || phase === "executing")) {
      const lines = [ctx.ui.theme.fg("accent", "Plan (step-by-step):")];
      for (let i = 0; i < steps.length; i += 1) {
        const step = steps[i];
        const marker = i < currentStepIndex ? "✅" : i === currentStepIndex ? "👉" : "⬜";
        lines.push(`${marker} ${ctx.ui.theme.fg("muted", `${step.step}.`)} ${step.text}`);
      }
      ctx.ui.setWidget("plan-preview", lines);
    } else {
      ctx.ui.setWidget("plan-preview", undefined);
    }
  };

  const setPlanMode = (ctx: ExtensionContext, enabled: boolean) => {
    planModeEnabled = enabled;

    if (enabled) {
      if (normalTools.length === 0) {
        normalTools = pi.getActiveTools();
      }

      if (!pendingPlan) {
        phase = "planning";
      }

      const available = new Set(pi.getAllTools().map((tool) => tool.name));
      const readonlyTools = PLAN_TOOLS.filter((name) => available.has(name));
      if (phase === "executing") {
        pi.setActiveTools(normalTools);
      } else {
        pi.setActiveTools(readonlyTools);
      }
      ctx.ui.notify("Plan mode enabled: agent will analyze, show steps, ask clarifications, then wait for your go-ahead per step.", "info");
    } else {
      if (normalTools.length > 0) {
        pi.setActiveTools(normalTools);
      }
      ctx.ui.notify("Plan mode disabled.", "info");
    }

    updateStatus(ctx);
    persist();
  };

  pi.registerFlag("plan", {
    description: "Start in plan mode (preview plan + clarifying questions before execution)",
    type: "boolean",
    default: false,
  });

  pi.registerCommand("plan", {
    description: "Enable orchestrated plan mode (optionally pass the task)",
    handler: async (args, ctx) => {
      if (!planModeEnabled) {
        setPlanMode(ctx, true);
      } else {
        updateStatus(ctx);
      }

      if (args.trim()) {
        pi.sendUserMessage(args.trim());
      } else {
        ctx.ui.notify("Plan mode is active. Send your task, and I will plan -> clarify -> wait for go-ahead per step.", "info");
      }
    },
  });

  pi.registerCommand("plan-off", {
    description: "Disable plan mode",
    handler: async (_args, ctx) => setPlanMode(ctx, false),
  });

  pi.registerCommand("plan-show", {
    description: "Show current pending plan",
    handler: async (_args, ctx) => {
      if (!pendingPlan) {
        ctx.ui.notify("No pending plan yet. Enable /plan and ask the agent to produce one.", "info");
        return;
      }

      if (phase !== "ready") {
        ctx.ui.notify("Plan preview is hidden until clarifying questions are fully answered.", "info");
        return;
      }

      pi.sendMessage({
        customType: "plan-preview",
        display: true,
        content: `Plan preview:\n\n${pendingPlan}\n\nReply "go ahead" to execute the next step only (or say "run all").`,
      });
      updateStatus(ctx);
    },
  });

  pi.registerCommand("execute-plan", {
    description: "Execute the currently approved plan",
    handler: async (_args, ctx) => {
      if (!pendingPlan) {
        ctx.ui.notify("No pending plan to execute.", "warning");
        return;
      }

      if (phase === "clarifying") {
        ctx.ui.notify("Wait for the clarifying-question round to finish first.", "warning");
        return;
      }

      setPlanMode(ctx, false);

      const approvedPlan = pendingPlan;
      pendingPlan = null;
      steps = [];
      currentStepIndex = 0;
      phase = "planning";
      updateStatus(ctx);
      persist();

      pi.sendUserMessage(`Execute this approved plan:\n\n${approvedPlan}`);
    },
  });

  const startNextStep = (ctx: ExtensionContext) => {
    if (!planModeEnabled || !pendingPlan || steps.length === 0) {
      ctx.ui.notify("No step-by-step plan is ready.", "warning");
      return;
    }

    if (phase === "clarifying" || phase === "planning") {
      ctx.ui.notify("Finish plan + clarifications first.", "warning");
      return;
    }

    if (currentStepIndex >= steps.length) {
      ctx.ui.notify("All plan steps are already complete.", "info");
      return;
    }

    phase = "executing";
    pi.setActiveTools(normalTools);
    updateStatus(ctx);
    persist();

    const step = steps[currentStepIndex];
    pi.sendUserMessage(
      `Go ahead. Execute ONLY step ${step.step}: ${step.text}\n\nAfter completing this single step, stop and summarize what changed and any follow-up questions.`,
    );
  };

  pi.registerCommand("go-ahead", {
    description: "Execute the next plan step only",
    handler: async (_args, ctx) => {
      startNextStep(ctx);
    },
  });

  pi.registerShortcut(Key.ctrlAlt("p"), {
    description: "Toggle plan mode",
    handler: async (ctx) => setPlanMode(ctx, !planModeEnabled),
  });

  pi.on("input", async (event, ctx) => {
    if (!planModeEnabled || event.source === "extension") {
      return { action: "continue" };
    }

    const text = event.text ?? "";

    if (phase === "ready" && isGoAheadText(text)) {
      startNextStep(ctx);
      return { action: "handled" };
    }

    if (phase === "ready" && isRunAllText(text)) {
      setPlanMode(ctx, false);

      const approvedPlan = pendingPlan;
      pendingPlan = null;
      steps = [];
      currentStepIndex = 0;
      phase = "planning";
      updateStatus(ctx);
      persist();

      if (approvedPlan) {
        pi.sendUserMessage(`Execute this approved plan:\n\n${approvedPlan}`);
      }
      return { action: "handled" };
    }

    if ((phase === "ready" || phase === "clarifying") && isRevisePlanText(text)) {
      phase = "planning";
      currentStepIndex = 0;
      pendingPlan = null;
      steps = [];
      const available = new Set(pi.getAllTools().map((tool) => tool.name));
      const readonlyTools = PLAN_TOOLS.filter((name) => available.has(name));
      pi.setActiveTools(readonlyTools);
      persist();
      updateStatus(ctx);
      return { action: "transform", text: "Revise the plan based on this feedback and output only a numbered plan under a Plan: header. " + text };
    }

    return { action: "continue" };
  });

  pi.on("tool_call", async (event) => {
    if (!planModeEnabled || phase === "executing" || event.toolName !== "bash") return;

    const command = (event.input as { command?: string }).command ?? "";
    if (!isSafeCommand(command)) {
      return {
        block: true,
        reason: `Plan mode only allows read-only bash commands. Blocked: ${command}`,
      };
    }
  });

  pi.on("before_agent_start", async () => {
    if (!planModeEnabled) return;

    if (phase === "planning") {
      return {
        message: {
          customType: "plan-mode-context",
          display: false,
          content: `[PLAN MODE ACTIVE]
You are in read-only planning mode.

Rules:
- Explore and analyze only.
- Do not make edits.
- Produce a numbered plan under a "Plan:" header.
- Do not execute the plan yet.

Format exactly like:
Plan:
1. ...
2. ...
3. ...`,
        },
      };
    }

    if (phase === "clarifying") {
      return {
        message: {
          customType: "plan-clarify-context",
          display: false,
          content: `[CLARIFYING QUESTIONS PHASE]
You already produced a draft plan.
Ask clarifying questions ONE AT A TIME.

Rules:
- Ask exactly one concise clarifying question in this response.
- Wait for the user's answer before asking the next question.
- Do not show or restate the plan yet.
- Do not execute anything.
- If there are no more questions, respond exactly: "No clarifying questions."`,
        },
      };
    }

    return {
      message: {
        customType: "plan-ready-context",
        display: false,
        content: `[PLAN READY - WAITING FOR APPROVAL]
Stay in planning mode only.
If user gives clarification answers, update the plan and present it again under "Plan:".
Do not execute until the user explicitly says "go ahead" (or equivalent).`,
      },
    };
  });

  pi.on("agent_end", async (event, ctx) => {
    if (!planModeEnabled) return;

    const text = getAssistantText(event.messages ?? []);
    if (!text) return;

    if (phase === "planning") {
      const extracted = extractPlan(text);
      if (!extracted) return;

      pendingPlan = extracted.rawPlan;
      steps = extracted.steps;
      currentStepIndex = 0;
      phase = "clarifying";
      persist();
      updateStatus(ctx);

      pi.sendMessage({
        customType: "plan-preview",
        display: true,
        content: "Draft plan captured. Plan preview is hidden until clarifying questions are answered.",
      });

      pi.sendUserMessage(
        "Before any execution, ask me your first clarifying question. Ask one question at a time. If none, say 'No clarifying questions.'",
      );
      return;
    }

    if (phase === "clarifying") {
      const noMoreQuestions = /^\s*no clarifying questions\.?\s*$/im.test(text);
      if (!noMoreQuestions) {
        persist();
        updateStatus(ctx);
        return;
      }

      phase = "ready";
      persist();
      updateStatus(ctx);

      pi.sendMessage({
        customType: "plan-clarification-ready",
        display: true,
        content:
          "Clarifications complete. Here is the plan preview:\n\n" +
          pendingPlan +
          "\n\nReply \"go ahead\" to execute only the next step (or \"run all\").",
      });
      return;
    }

    if (phase === "executing") {
      if (currentStepIndex < steps.length) {
        steps[currentStepIndex] = { ...steps[currentStepIndex], completed: true };
        currentStepIndex += 1;
      }

      if (currentStepIndex >= steps.length) {
        phase = "planning";
        pendingPlan = null;
        steps = [];
        currentStepIndex = 0;
        const available = new Set(pi.getAllTools().map((tool) => tool.name));
        const readonlyTools = PLAN_TOOLS.filter((name) => available.has(name));
        pi.setActiveTools(readonlyTools);
        pi.sendMessage({
          customType: "plan-complete",
          display: true,
          content: "All plan steps are complete.",
        });
      } else {
        phase = "ready";
        const available = new Set(pi.getAllTools().map((tool) => tool.name));
        const readonlyTools = PLAN_TOOLS.filter((name) => available.has(name));
        pi.setActiveTools(readonlyTools);
        pi.sendMessage({
          customType: "plan-next-step",
          display: true,
          content: `Step complete. Reply "go ahead" for next step (${steps[currentStepIndex].step}), or say "run all".`,
        });
      }

      persist();
      updateStatus(ctx);
      return;
    }

    const extracted = extractPlan(text);
    if (extracted) {
      pendingPlan = extracted.rawPlan;
      steps = extracted.steps;
      currentStepIndex = 0;
      persist();
      updateStatus(ctx);
    }
  });

  pi.on("session_start", async (_event, ctx) => {
    const entries = ctx.sessionManager.getEntries();
    const stateEntry = entries
      .filter((entry) => entry.type === "custom" && entry.customType === "plan-mode-state")
      .pop() as { data?: PlanState } | undefined;

    normalTools = pi.getActiveTools();

    if (stateEntry?.data) {
      planModeEnabled = Boolean(stateEntry.data.enabled);
      pendingPlan = stateEntry.data.pendingPlan ?? null;
      steps = stateEntry.data.steps ?? [];
      normalTools = stateEntry.data.normalTools?.length ? stateEntry.data.normalTools : normalTools;
      phase = stateEntry.data.phase ?? (pendingPlan ? "ready" : "planning");
      currentStepIndex = stateEntry.data.currentStepIndex ?? 0;
    }

    if (pi.getFlag("plan") === true) {
      planModeEnabled = true;
      if (!pendingPlan) phase = "planning";
    }

    if (planModeEnabled) {
      setPlanMode(ctx, true);
    } else {
      updateStatus(ctx);
    }
  });
}
