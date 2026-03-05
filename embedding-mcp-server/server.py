#!/usr/bin/env python3
"""
BGE-M3 Embedding MCP Server for claude-mem

Provides BGE-M3 embeddings via MCP protocol.
Uses FlagEmbedding for high-quality multilingual embeddings (1024 dimensions).

Usage:
    python server.py                    # Start server
    uvx --python 3.13 embedding-mcp     # Via uvx (after pip install)
"""

import os
# Force offline mode - use cached model only, no HuggingFace connection
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["TRANSFORMERS_OFFLINE"] = "1"

import json
import asyncio
import logging
from typing import Any

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("embedding-mcp")

# Lazy-loaded model instance
_model = None
_model_name = "BAAI/bge-m3"


def get_model():
    """Lazy load BGE-M3 model to avoid startup overhead."""
    global _model
    if _model is None:
        logger.info(f"Loading BGE-M3 model: {_model_name}")
        try:
            from FlagEmbedding import BGEM3FlagModel
            _model = BGEM3FlagModel(_model_name, use_fp16=True)
            logger.info("BGE-M3 model loaded successfully")
        except ImportError:
            logger.error("FlagEmbedding not installed. Run: pip install FlagEmbedding")
            raise
        except Exception as e:
            logger.error(f"Failed to load BGE-M3 model: {e}")
            raise
    return _model


# Create MCP server
app = Server("embedding-mcp")


@app.list_tools()
async def list_tools() -> list[Tool]:
    """List available embedding tools."""
    return [
        Tool(
            name="embed_texts",
            description="Generate BGE-M3 dense embeddings for a list of texts. Returns 1024-dimensional vectors.",
            inputSchema={
                "type": "object",
                "properties": {
                    "texts": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of texts to embed"
                    },
                    "batch_size": {
                        "type": "integer",
                        "default": 32,
                        "description": "Batch size for encoding (default: 32)"
                    },
                    "max_length": {
                        "type": "integer",
                        "default": 8192,
                        "description": "Maximum token length (default: 8192)"
                    }
                },
                "required": ["texts"]
            }
        ),
        Tool(
            name="embed_query",
            description="Generate BGE-M3 embedding for a single query text. Optimized for retrieval queries.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Query text to embed"
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="get_embedding_info",
            description="Get information about the embedding model",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        )
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    """Handle tool calls."""

    if name == "embed_texts":
        texts = arguments.get("texts", [])
        batch_size = arguments.get("batch_size", 32)
        max_length = arguments.get("max_length", 8192)

        if not texts:
            return [TextContent(
                type="text",
                text=json.dumps({
                    "embeddings": [],
                    "dimensions": 1024,
                    "count": 0
                })
            )]

        try:
            model = get_model()

            # Encode texts - only get dense vectors (Chroma doesn't support sparse)
            outputs = model.encode(
                texts,
                batch_size=batch_size,
                max_length=max_length,
                return_dense=True,
                return_sparse=False,
                return_colbert_vecs=False
            )

            embeddings = outputs['dense_vecs'].tolist()

            logger.info(f"Embedded {len(texts)} texts")

            return [TextContent(
                type="text",
                text=json.dumps({
                    "embeddings": embeddings,
                    "dimensions": 1024,
                    "count": len(embeddings),
                    "model": _model_name
                })
            )]

        except Exception as e:
            logger.error(f"Embedding error: {e}")
            return [TextContent(
                type="text",
                text=json.dumps({
                    "error": str(e),
                    "embeddings": [],
                    "dimensions": 1024,
                    "count": 0
                })
            )]

    elif name == "embed_query":
        query = arguments.get("query", "")

        if not query:
            return [TextContent(
                type="text",
                text=json.dumps({
                    "embedding": [],
                    "dimensions": 1024,
                    "error": "Empty query"
                })
            )]

        try:
            model = get_model()

            # Encode single query
            outputs = model.encode(
                [query],
                return_dense=True,
                return_sparse=False,
                return_colbert_vecs=False
            )

            embedding = outputs['dense_vecs'][0].tolist()

            return [TextContent(
                type="text",
                text=json.dumps({
                    "embedding": embedding,
                    "dimensions": 1024,
                    "model": _model_name
                })
            )]

        except Exception as e:
            logger.error(f"Query embedding error: {e}")
            return [TextContent(
                type="text",
                text=json.dumps({
                    "error": str(e),
                    "embedding": [],
                    "dimensions": 1024
                })
            )]

    elif name == "get_embedding_info":
        return [TextContent(
            type="text",
            text=json.dumps({
                "model": _model_name,
                "dimensions": 1024,
                "max_length": 8192,
                "languages": "100+",
                "fp16": True,
                "features": [
                    "dense_embeddings",
                    "multilingual",
                    "long_context"
                ],
                "note": "Sparse and ColBERT vectors not exposed (Chroma only supports dense)"
            })
        )]

    else:
        raise ValueError(f"Unknown tool: {name}")


async def main():
    """Run the MCP server."""
    logger.info("Starting BGE-M3 Embedding MCP Server")

    # Pre-load the model at startup to avoid timeout on first call
    logger.info("Pre-loading BGE-M3 model (this may take a minute on first run)...")
    try:
        get_model()
        logger.info("Model pre-loaded successfully, server ready")
    except Exception as e:
        logger.error(f"Failed to pre-load model: {e}")
        # Continue anyway - will retry on first call

    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
