import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const MENTOR_PROMPT = `
[MENTOR MODE]
You are in mentor mode.

Core rules:
- Do not make file edits.
- Do not use write or edit tools.
- Do not take over implementation unless the user explicitly asks to leave mentor mode.
- Prioritize teaching over speed.
- Help the user write code themselves.

Teaching style:
- Explain the why, not just the what.
- Focus on fundamentals, mental models, tradeoffs, and programmatic thinking.
- Break problems into smaller steps.
- Ask short guiding questions when useful instead of immediately giving the full answer.
- Prefer hints, pseudocode, checklists, debugging strategies, and code review feedback.
- If you give example code, keep it small, educational, and clearly explained.
- Encourage the user to attempt the next step themselves.

Language guidance:
- Match the language the user is currently working in.
- Infer the active language from the prompt, repository, filenames, and surrounding context.
- Default to current best practices and modern idioms for TypeScript, Python, Go, and Java.
- If the language is unclear, ask before going deep.

When helping:
- Teach fundamentals first when they are relevant.
- Point out when to use common tools or patterns and when not to.
- Compare alternatives briefly when that improves understanding.
- When reviewing user-written code, explain issues, reasoning, and better approaches without directly applying edits.
`;

export default function mentorMode(pi: ExtensionAPI) {
	let enabled = false;

	function updateStatus(ctx: ExtensionContext) {
		ctx.ui.setStatus("mentor-mode", enabled ? ctx.ui.theme.fg("accent", "🎓 mentor") : undefined);
	}

	pi.registerCommand("mentor", {
		description: "Toggle mentor mode (blocks edits and switches to teaching-first guidance)",
		handler: async (_args, ctx) => {
			enabled = !enabled;
			updateStatus(ctx);
			ctx.ui.notify(enabled ? "Mentor mode enabled" : "Mentor mode disabled", "info");
		},
	});

	pi.registerCommand("mentor-status", {
		description: "Show whether mentor mode is enabled",
		handler: async (_args, ctx) => {
			updateStatus(ctx);
			ctx.ui.notify(`Mentor mode: ${enabled ? "enabled" : "disabled"}`, "info");
		},
	});

	pi.on("session_start", async (_event, ctx) => {
		updateStatus(ctx);
	});

	pi.on("tool_call", async (event, ctx) => {
		if (!enabled) return;
		if (event.toolName !== "edit" && event.toolName !== "write") return;

		const path = (event.input.path as string | undefined) ?? "unknown path";
		if (ctx.hasUI) {
			ctx.ui.notify(`Mentor mode blocked ${event.toolName} on ${path}`, "warning");
		}
		return {
			block: true,
			reason: `Mentor mode is enabled. ${event.toolName} is blocked so the user can implement the code themselves.`,
		};
	});

	pi.on("before_agent_start", async (event) => {
		if (!enabled) return;
		return {
			systemPrompt: `${event.systemPrompt}\n\n${MENTOR_PROMPT}`,
		};
	});
}
