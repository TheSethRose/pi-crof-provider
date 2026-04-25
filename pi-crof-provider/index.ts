/**
 * CrofAI Provider Extension for pi
 *
 * Adds CrofAI (https://crof.ai) as a model provider.
 * CrofAI is an OpenAI-compatible inference platform hosting models from
 * DeepSeek, MoonshotAI (Kimi), Z.AI (GLM), Google (Gemma), MiniMax, and Qwen.
 *
 * Usage:
 *   # Copy to extensions directory
 *   cp -r pi-crof-provider ~/.pi/agent/extensions/
 *
 *   # Or load directly
 *   pi -e ./pi-crof-provider
 *
 *   # Then use /login or set CROF_API_KEY
 *   CROF_API_KEY=sk-... pi --provider crof --model kimi-k2.6
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.registerProvider("crof", {
		baseUrl: "https://crof.ai/v1",
		apiKey: "CROF_API_KEY",
		api: "openai-completions",

		models: [
			{
				id: "deepseek-v3.2",
				name: "DeepSeek: DeepSeek V3.2",
				reasoning: true,
				input: ["text"],
				cost: { input: 0.28, output: 0.38, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 163840,
				maxTokens: 163840,
			},
			{
				id: "deepseek-v4-pro",
				name: "DeepSeek: DeepSeek V4 Pro",
				reasoning: true,
				input: ["text"],
				cost: { input: 1.15, output: 3, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 1000000,
				maxTokens: 131072,
				compat: { requiresReasoningContentOnAssistantMessages: true },
			},
			{
				id: "gemma-4-31b-it",
				name: "Google: Gemma 4 31B",
				reasoning: true,
				input: ["text", "image"],
				cost: { input: 0.1, output: 0.3, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 262144,
				maxTokens: 262144,
			},
			{
				id: "glm-4.7",
				name: "Z.AI: GLM 4.7",
				reasoning: false,
				input: ["text"],
				cost: { input: 0.25, output: 1.1, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 202752,
				maxTokens: 202752,
			},
			{
				id: "glm-4.7-flash",
				name: "Z.AI: GLM 4.7 Flash",
				reasoning: false,
				input: ["text"],
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 202752,
				maxTokens: 131072,
			},
			{
				id: "glm-5",
				name: "Z.ai: GLM 5",
				reasoning: false,
				input: ["text"],
				cost: { input: 0.48, output: 1.9, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 202752,
				maxTokens: 202752,
			},
			{
				id: "glm-5.1",
				name: "Z.ai: GLM 5.1",
				reasoning: false,
				input: ["text"],
				cost: { input: 0.45, output: 2.1, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 202752,
				maxTokens: 202752,
			},
			{
				id: "glm-5.1-precision",
				name: "Z.ai: GLM 5.1 (Precision)",
				reasoning: false,
				input: ["text"],
				cost: { input: 0.8, output: 2.9, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 202752,
				maxTokens: 202752,
			},
			{
				id: "greg",
				name: "Experiment!: Greg",
				reasoning: false,
				input: ["text"],
				cost: { input: 0.3, output: 0.3, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 200000,
				maxTokens: 200000,
			},
			{
				id: "kimi-k2.5",
				name: "MoonshotAI: Kimi K2.5",
				reasoning: true,
				input: ["text", "image"],
				cost: { input: 0.35, output: 1.7, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 262144,
				maxTokens: 262144,
			},
			{
				id: "kimi-k2.5-lightning",
				name: "MoonshotAI: Kimi K2.5 (Lightning)",
				reasoning: true,
				input: ["text"],
				cost: { input: 1, output: 3, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 131072,
				maxTokens: 32768,
			},
			{
				id: "kimi-k2.6",
				name: "MoonshotAI: Kimi K2.6",
				reasoning: true,
				input: ["text", "image"],
				cost: { input: 0.5, output: 1.99, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 262144,
				maxTokens: 262144,
			},
			{
				id: "kimi-k2.6-precision",
				name: "MoonshotAI: Kimi K2.6 (Precision)",
				reasoning: true,
				input: ["text", "image"],
				cost: { input: 0.55, output: 2.7, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 262144,
				maxTokens: 262144,
			},
			{
				id: "minimax-m2.5",
				name: "MiniMax: MiniMax M2.5",
				reasoning: false,
				input: ["text"],
				cost: { input: 0.11, output: 0.95, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 204800,
				maxTokens: 131072,
			},
			{
				id: "qwen3.5-397b-a17b",
				name: "Qwen: Qwen3.5 397B A17B",
				reasoning: true,
				input: ["text"],
				cost: { input: 0.35, output: 1.75, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 262144,
				maxTokens: 262144,
			},
			{
				id: "qwen3.5-9b",
				name: "Qwen: Qwen3.5 9B",
				reasoning: true,
				input: ["text"],
				cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 262144,
				maxTokens: 262144,
			},
			{
				id: "qwen3.5-9b-chat",
				name: "Qwen: Qwen3.5 9B (Chat)",
				reasoning: true,
				input: ["text"],
				cost: { input: 0.04, output: 0.15, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 262144,
				maxTokens: 262144,
			},
			{
				id: "qwen3.6-27b",
				name: "Qwen: Qwen3.6 27B",
				reasoning: true,
				input: ["text"],
				cost: { input: 0.2, output: 1.5, cacheRead: 0, cacheWrite: 0 },
				contextWindow: 262144,
				maxTokens: 262144,
			},
		],
	});
}
