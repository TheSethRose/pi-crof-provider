/**
 * CrofAI Provider Extension for pi
 *
 * Dynamically fetches the model list from https://crof.ai/v1/models so
 * new models, pricing, and context windows are always up to date.
 *
 * Usage:
 *   CROF_API_KEY=sk-... pi --provider crof --model kimi-k2.6
 *   # or /login -> CrofAI in interactive mode
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

interface CrofAIModel {
	id: string;
	name: string;
	pricing?: { prompt: number; completion: number };
	context_length: number;
	top_provider?: {
		context_length: number | null;
		max_completion_tokens: number | null;
	};
}

interface CrofAccountInfo {
	credits: number;
	usable_requests: number;
}

type DisplayMode = "credits" | "requests" | "both" | "off";

const VISION_MODELS = new Set([
	"kimi-k2.5",
	"kimi-k2.6",
	"kimi-k2.6-precision",
	"gemma-4-31b-it",
]);

const REQUIRES_REASONING_CONTENT = new Set(["deepseek-v4-pro"]);

function isReasoningModel(id: string): boolean {
	return (
		id.startsWith("deepseek") ||
		id.startsWith("kimi") ||
		id.startsWith("qwen") ||
		id === "gemma-4-31b-it"
	);
}

function roundCost(n: number): number {
	return Math.round(n * 1_000_000 * 100) / 100;
}

async function fetchCrofModels(): Promise<NonNullable<Parameters<ExtensionAPI["registerProvider"]>["1"]["models"]> | null> {
	try {
		const res = await fetch("https://crof.ai/v1/models", { signal: AbortSignal.timeout(10000) });
		if (!res.ok) return null;

		const json = (await res.json()) as { data?: CrofAIModel[] };
		const models = json.data ?? [];

		return models.map((m) => {
			const id = m.id;
			const pricing = m.pricing ?? { prompt: 0, completion: 0 };
			const reasoning = isReasoningModel(id);
			const vision = VISION_MODELS.has(id);
			const maxTokens = m.top_provider?.max_completion_tokens ?? m.context_length;

			const model: any = {
				id,
				name: m.name || id,
				reasoning,
				input: vision ? (["text", "image"] as const) : (["text"] as const),
				cost: {
					input: roundCost(pricing.prompt),
					output: roundCost(pricing.completion),
					cacheRead: 0,
					cacheWrite: 0,
				},
				contextWindow: m.context_length,
				maxTokens,
			};

			if (REQUIRES_REASONING_CONTENT.has(id)) {
				model.compat = { requiresReasoningContentOnAssistantMessages: true };
			}

			return model;
		});
	} catch {
		return null;
	}
}

// Minimal fallback if CrofAI API is unreachable
const FALLBACK_MODELS = [
	{
		id: "kimi-k2.6",
		name: "MoonshotAI: Kimi K2.6",
		reasoning: true,
		input: ["text", "image"] as const,
		cost: { input: 0.5, output: 1.99, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 262144,
		maxTokens: 262144,
	},
	{
		id: "deepseek-v4-pro",
		name: "DeepSeek: DeepSeek V4 Pro",
		reasoning: true,
		input: ["text"] as const,
		cost: { input: 1.15, output: 3, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 1000000,
		maxTokens: 131072,
		compat: { requiresReasoningContentOnAssistantMessages: true },
	},
	{
		id: "glm-5.1",
		name: "Z.ai: GLM 5.1",
		reasoning: false,
		input: ["text"] as const,
		cost: { input: 0.45, output: 2.1, cacheRead: 0, cacheWrite: 0 },
		contextWindow: 202752,
		maxTokens: 202752,
	},
];

// ── Dashboard helpers ────────────────────────────────────────────

const USAGE_API_BASE = "https://crof.ai/usage_api";
let lastDashboardFetch = 0;
let dashboardCache: CrofAccountInfo | null = null;
let displayMode: DisplayMode = "both";

function getApiKey(): string | undefined {
	// 1. Try env var first (matches provider registration)
	if (process.env.CROF_API_KEY) return process.env.CROF_API_KEY;

	// 2. Fall back to pi's auth.json (set via /login)
	try {
		const { readFileSync } = require("node:fs");
		const authPath = `${process.env.HOME}/.pi/agent/auth.json`;
		const auth = JSON.parse(readFileSync(authPath, "utf-8"));
		if (auth.crof?.type === "api_key" && auth.crof.key) {
			return auth.crof.key;
		}
	} catch {
		// auth.json missing or unreadable
	}

	return undefined;
}

async function fetchAccountInfo(): Promise<CrofAccountInfo | null> {
	const apiKey = getApiKey();
	if (!apiKey) return null;

	try {
		const res = await fetch(`${USAGE_API_BASE}/`, {
			headers: {
				accept: "application/json",
				authorization: `Bearer ${apiKey}`,
			},
			signal: AbortSignal.timeout(8000),
		});
		if (!res.ok) return null;
		return (await res.json()) as CrofAccountInfo;
	} catch {
		return null;
	}
}

async function refreshAccountInfo(force = false): Promise<CrofAccountInfo | null> {
	const now = Date.now();
	if (!force && now - lastDashboardFetch < 30_000) {
		return dashboardCache;
	}

	dashboardCache = await fetchAccountInfo();
	lastDashboardFetch = now;
	return dashboardCache;
}

function formatStatus(data: CrofAccountInfo | null, mode: DisplayMode): string {
	if (mode === "off" || !data) return "";

	const parts: string[] = [];

	if (mode === "credits" || mode === "both") {
		const creditStr = data.credits < 0
			? `-$${Math.abs(data.credits).toFixed(3)}`
			: `$${data.credits.toFixed(2)}`;
		parts.push(creditStr);
	}

	if (mode === "requests" || mode === "both") {
		parts.push(`${data.usable_requests} req`);
	}

	if (parts.length === 0) return "";
	return `Crof: ${parts.join(" | ")}`;
}

function formatDetailedUsage(data: CrofAccountInfo | null): string {
	if (!data) return "Unable to fetch Crof account info. Is CROF_API_KEY set?";

	const lines: string[] = [
		"CrofAI Account",
		"",
		`Credits:         ${data.credits < 0 ? "-" : ""}$${Math.abs(data.credits).toFixed(4)}`,
		`Usable Requests: ${data.usable_requests}`,
	];

	return lines.join("\n");
}

export default async function (pi: ExtensionAPI) {
	const models = (await fetchCrofModels()) ?? FALLBACK_MODELS;

	pi.registerProvider("crof", {
		baseUrl: "https://crof.ai/v1",
		apiKey: "CROF_API_KEY",
		api: "openai-completions",
		models,
	});

	// ── Status bar integration ─────────────────────────────────────

	async function updateStatus(ctx: any) {
		const data = await refreshAccountInfo();
		const text = formatStatus(data, displayMode);
		if (text) {
			ctx.ui.setStatus("crof", text);
		} else {
			ctx.ui.setStatus("crof", undefined);
		}
	}

	pi.on("session_start", async (_event, ctx) => {
		await updateStatus(ctx);
	});

	pi.on("turn_end", async (_event, ctx) => {
		await updateStatus(ctx);
	});

	pi.on("after_provider_response", async (_event, ctx) => {
		if (Date.now() - lastDashboardFetch > 30_000) {
			await updateStatus(ctx);
		}
	});

	// ── /crof-usage command ────────────────────────────────────────

	pi.registerCommand("crof-usage", {
		description: "Show CrofAI account info (credits + usable requests)",
		handler: async (_args, ctx) => {
			const data = await refreshAccountInfo(true);
			const report = formatDetailedUsage(data);
			ctx.ui.setWidget("crof-usage", report.split("\n"));
			await updateStatus(ctx);
		},
	});

	// ── /crof-config command ───────────────────────────────────────

	pi.registerCommand("crof-config", {
		description: "Configure Crof status bar display (credits, requests, both, off)",
		handler: async (_args, ctx) => {
			const modes: { label: string; value: DisplayMode }[] = [
				{ label: "Credits only", value: "credits" },
				{ label: "Requests only", value: "requests" },
				{ label: "Both", value: "both" },
				{ label: "Off", value: "off" },
			];

			const choice = await ctx.ui.select(
				"Crof status bar display:",
				modes.map((m) => m.label),
			);

			if (!choice) {
				ctx.ui.notify("Cancelled.", "info");
				return;
			}

			const selected = modes.find((m) => m.label === choice);
			if (selected) {
				displayMode = selected.value;
				ctx.ui.notify(`Crof status set to: ${selected.label}`, "success");
				await updateStatus(ctx);
			}
		},
	});
}
