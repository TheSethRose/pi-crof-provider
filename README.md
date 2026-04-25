# pi CrofAI Provider Extension

Adds [CrofAI](https://crof.ai) as a model provider for [pi](https://github.com/badlogic/pi-mono).

CrofAI is an OpenAI-compatible inference platform hosting models from DeepSeek, MoonshotAI (Kimi), Z.AI (GLM), Google (Gemma), MiniMax, and Qwen.

## Models

| Model | Reasoning | Vision | Context |
|-------|-----------|--------|---------|
| `kimi-k2.6` | Yes | Yes | 262K |
| `kimi-k2.6-precision` | Yes | Yes | 262K |
| `kimi-k2.5` | Yes | Yes | 262K |
| `kimi-k2.5-lightning` | Yes | No | 131K |
| `deepseek-v4-pro` | Yes | No | 1M |
| `deepseek-v3.2` | Yes | No | 164K |
| `glm-5.1` | No | No | 203K |
| `glm-5.1-precision` | No | No | 203K |
| `glm-5` | No | No | 203K |
| `glm-4.7` | No | No | 203K |
| `glm-4.7-flash` | No | No | 203K |
| `gemma-4-31b-it` | Yes | Yes | 262K |
| `qwen3.6-27b` | Yes | No | 262K |
| `qwen3.5-397b-a17b` | Yes | No | 262K |
| `qwen3.5-9b` | Yes | No | 262K |
| `qwen3.5-9b-chat` | Yes | No | 262K |
| `minimax-m2.5` | No | No | 205K |
| `greg` | No | No | 200K |

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
