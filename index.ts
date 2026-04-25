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

export default async function (pi: ExtensionAPI) {
	const models = (await fetchCrofModels()) ?? FALLBACK_MODELS;

	pi.registerProvider("crof", {
		baseUrl: "https://crof.ai/v1",
		apiKey: "CROF_API_KEY",
		api: "openai-completions",
		models,
	});
}
