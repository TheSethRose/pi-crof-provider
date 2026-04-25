# pi CrofAI Provider Extension

Adds [CrofAI](https://crof.ai) as a model provider for [pi](https://github.com/badlogic/pi-mono).

CrofAI is an OpenAI-compatible inference platform hosting models from DeepSeek, MoonshotAI (Kimi), Z.AI (GLM), Google (Gemma), MiniMax, and Qwen.

## Models

Models are fetched dynamically from `https://crof.ai/v1/models` at startup, so the list is always current. A small fallback set is included if the API is unreachable.

Popular models include:

| Model | Reasoning | Vision | Context |
|-------|-----------|--------|---------|
| `kimi-k2.6` | Yes | Yes | 262K |
| `deepseek-v4-pro` | Yes | No | 1M |
| `glm-5.1` | No | No | 203K |
| `gemma-4-31b-it` | Yes | Yes | 262K |
| `qwen3.6-27b` | Yes | No | 262K |

## Install

### Option 1: Copy to extensions directory

```bash
git clone https://github.com/TheSethRose/pi-crof-provider.git ~/.pi/agent/extensions/pi-crof-provider
```

### Option 2: Load directly

```bash
pi -e /path/to/pi-crof-provider
```

## Auth

### API Key (recommended)

Get your API key from [crof.ai](https://crof.ai) and either:

- Set the environment variable: `export CROF_API_KEY=sk-...`
- Or use `/login` in interactive mode and select **CrofAI**

### CLI

```bash
export CROF_API_KEY="sk-..."
pi --provider crof --model kimi-k2.6
```

### Interactive

```
/login
# Select CrofAI, enter API key

/model
# Select any CrofAI model
```

## License

MIT
