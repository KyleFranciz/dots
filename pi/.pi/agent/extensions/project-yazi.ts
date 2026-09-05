import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { SessionManager } from "@earendil-works/pi-coding-agent";

function pickProjectWithYazi(startDir: string): string | null {
	const cwdFile = resolve(tmpdir(), `pi-project-yazi-${randomUUID()}.cwd`);

	try {
		writeFileSync(cwdFile, "", "utf8");

		const result = spawnSync("yazi", [startDir, "--cwd-file", cwdFile], {
			cwd: startDir,
			stdio: "inherit",
			env: process.env,
		});

		if (result.error) throw result.error;

		const selected = readFileSync(cwdFile, "utf8").trim();
		return selected || null;
	} finally {
		rmSync(cwdFile, { force: true });
	}
}

export default function (pi: ExtensionAPI) {
	pi.registerCommand("project", {
		description: "Pick a project with yazi and switch pi to it",
		handler: async (args, ctx) => {
			if (ctx.mode !== "tui") {
				ctx.ui.notify("/project requires interactive mode", "error");
				return;
			}

			const requested = args.trim();
			const startDir = requested ? resolve(ctx.cwd, requested) : ctx.cwd;
			if (!existsSync(startDir)) {
				ctx.ui.notify(`Path not found: ${startDir}`, "error");
				return;
			}

			const target = await ctx.ui.custom<string | null>((tui, _theme, _kb, done) => {
				tui.stop();
				process.stdout.write("\x1b[2J\x1b[H");

				try {
					done(pickProjectWithYazi(startDir));
				} finally {
					tui.start();
					tui.requestRender(true);
				}

				return { render: () => [], invalidate: () => {} };
			});

			if (!target) {
				ctx.ui.notify("No project selected", "info");
				return;
			}

			if (!existsSync(target)) {
				ctx.ui.notify(`Selected path not found: ${target}`, "error");
				return;
			}

			const finalCwd = lstatSync(target).isDirectory() ? target : dirname(target);
			const currentSessionFile = ctx.sessionManager.getSessionFile();
			const targetSessionManager = SessionManager.continueRecent(finalCwd);
			const targetSessionFile = targetSessionManager.getSessionFile();

			if (!targetSessionFile) {
				ctx.ui.notify(`Could not open or create a session for ${finalCwd}`, "error");
				return;
			}

			if (currentSessionFile === targetSessionFile) {
				ctx.ui.notify(`Already in ${finalCwd}`, "info");
				return;
			}

			const result = await ctx.switchSession(targetSessionFile, {
				withSession: async (replacementCtx) => {
					replacementCtx.ui.notify(`Switched project: ${finalCwd}`, "info");
				},
			});

			if (result.cancelled) {
				ctx.ui.notify("Project switch cancelled", "info");
			}
		},
	});
}
