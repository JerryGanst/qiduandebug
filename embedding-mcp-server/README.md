# BGE-M3 Embedding MCP Server

MCP server providing BGE-M3 embeddings for claude-mem.

## Features

- **BGE-M3 Model**: 1024-dimensional dense embeddings
- **Multilingual**: 100+ language support
- **Long Context**: Up to 8192 tokens
- **FP16**: Memory-efficient inference (~2-3GB)

## Requirements

- Python 3.10+ (recommended: 3.13)
- ~2-3GB RAM/VRAM for the model
- First run will download the model (~1GB)

## Installation

### Option 1: Direct pip install (Recommended)
```bash
pip install mcp FlagEmbedding torch
```

### Option 2: From this directory
```bash
cd embedding-mcp-server
pip install -e .
```

### Option 3: With GPU support
```bash
pip install mcp FlagEmbedding "torch>=2.0.0"
```

## Usage

### Standalone
```bash
python server.py
```

### Via uvx (recommended)
```bash
uvx --python 3.13 --from . embedding-mcp
```

## MCP Tools

### `embed_texts`
Generate embeddings for multiple texts.

```json
{
  "texts": ["Hello world", "你好世界"],
  "batch_size": 32,
  "max_length": 8192
}
```

Returns:
```json
{
  "embeddings": [[0.1, 0.2, ...], [0.3, 0.4, ...]],
  "dimensions": 1024,
  "count": 2
}
```

### `embed_query`
Generate embedding for a single query.

```json
{
  "query": "What is machine learning?"
}
```

### `get_embedding_info`
Get model information.

## Memory Requirements

- FP16: ~2-3GB GPU/RAM
- First load: ~5-10 seconds
- Encoding: ~100ms per batch of 32

## Integration with claude-mem

Set in `~/.claude-mem/settings.json`:
```json
{
  "CLAUDE_MEM_EMBEDDING_MODEL": "bge-m3",
  "CLAUDE_MEM_EMBEDDING_MCP_ENABLED": "true"
}
```

Then run migration:
```bash
bun scripts/migrate-embeddings.ts --migrate
```
