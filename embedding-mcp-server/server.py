#!/usr/bin/env python3
"""
BGE-M3 Embedding MCP Server for claude-mem

Provides BGE-M3 embeddings via MCP protocol, plus Chroma operations
with custom embeddings (bypassing chroma-mcp's limitation of no custom embeddings).

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
from pathlib import Path

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("embedding-mcp")

# Lazy-loaded instances
_model = None
_model_name = "BAAI/bge-m3"
_chroma_clients = {}  # data_dir -> chromadb.PersistentClient


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


def get_chroma_client(data_dir: str):
    """Get or create a persistent Chroma client for the given data directory."""
    global _chroma_clients
    if data_dir not in _chroma_clients:
        try:
            import chromadb
            _chroma_clients[data_dir] = chromadb.PersistentClient(path=data_dir)
            logger.info(f"Chroma client created for: {data_dir}")
        except ImportError:
            logger.error("chromadb not installed. Run: pip install chromadb")
            raise
    return _chroma_clients[data_dir]


def compute_embeddings(texts: list[str], batch_size: int = 32, max_length: int = 8192) -> list[list[float]]:
    """Compute BGE-M3 embeddings for a list of texts."""
    model = get_model()
    outputs = model.encode(
        texts,
        batch_size=batch_size,
        max_length=max_length,
        return_dense=True,
        return_sparse=False,
        return_colbert_vecs=False
    )
    return outputs['dense_vecs'].tolist()


# Default Chroma data directory
DEFAULT_DATA_DIR = os.path.join(os.path.expanduser("~"), ".claude-mem", "vector-db")

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
        ),
        Tool(
            name="chroma_add_with_embeddings",
            description="Add documents to a Chroma collection with BGE-M3 embeddings. Computes embeddings and stores them directly, bypassing chroma-mcp's limitation.",
            inputSchema={
                "type": "object",
                "properties": {
                    "collection_name": {
                        "type": "string",
                        "description": "Name of the Chroma collection"
                    },
                    "documents": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of text documents to add"
                    },
                    "ids": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of unique IDs for each document"
                    },
                    "metadatas": {
                        "type": "array",
                        "items": {"type": "object"},
                        "description": "Optional list of metadata dicts for each document"
                    },
                    "data_dir": {
                        "type": "string",
                        "description": "Chroma data directory (default: ~/.claude-mem/vector-db)"
                    }
                },
                "required": ["collection_name", "documents", "ids"]
            }
        ),
        Tool(
            name="chroma_query_with_embeddings",
            description="Query a Chroma collection using BGE-M3 query embedding. Returns semantically similar documents.",
            inputSchema={
                "type": "object",
                "properties": {
                    "collection_name": {
                        "type": "string",
                        "description": "Name of the Chroma collection"
                    },
                    "query": {
                        "type": "string",
                        "description": "Query text to search for"
                    },
                    "n_results": {
                        "type": "integer",
                        "default": 10,
                        "description": "Number of results to return (default: 10)"
                    },
                    "where": {
                        "type": "object",
                        "description": "Optional metadata filter (Chroma where clause)"
                    },
                    "include": {
                        "type": "array",
                        "items": {"type": "string"},
                        "default": ["documents", "metadatas", "distances"],
                        "description": "What to include in results"
                    },
                    "data_dir": {
                        "type": "string",
                        "description": "Chroma data directory (default: ~/.claude-mem/vector-db)"
                    }
                },
                "required": ["collection_name", "query"]
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
            embeddings = compute_embeddings(texts, batch_size, max_length)

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
                    "long_context",
                    "chroma_direct_access"
                ],
                "note": "Supports direct Chroma add/query with custom BGE-M3 embeddings"
            })
        )]

    elif name == "chroma_add_with_embeddings":
        collection_name = arguments.get("collection_name", "")
        documents = arguments.get("documents", [])
        ids = arguments.get("ids", [])
        metadatas = arguments.get("metadatas", None)
        data_dir = arguments.get("data_dir", DEFAULT_DATA_DIR)

        if not collection_name or not documents or not ids:
            return [TextContent(
                type="text",
                text=json.dumps({"error": "collection_name, documents, and ids are required"})
            )]

        if len(documents) != len(ids):
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"documents ({len(documents)}) and ids ({len(ids)}) must have same length"})
            )]

        try:
            # Compute BGE-M3 embeddings
            embeddings = compute_embeddings(documents)

            # Add to Chroma with custom embeddings
            client = get_chroma_client(data_dir)
            collection = client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )

            # Filter out duplicate IDs
            existing = collection.get(ids=ids, include=[])
            existing_ids = set(existing["ids"]) if existing["ids"] else set()

            new_indices = [i for i, id in enumerate(ids) if id not in existing_ids]
            if not new_indices:
                return [TextContent(
                    type="text",
                    text=json.dumps({
                        "added": 0,
                        "skipped": len(ids),
                        "dimensions": 1024,
                        "message": "All documents already exist"
                    })
                )]

            new_ids = [ids[i] for i in new_indices]
            new_docs = [documents[i] for i in new_indices]
            new_embeddings = [embeddings[i] for i in new_indices]
            new_metadatas = [metadatas[i] for i in new_indices] if metadatas else None

            add_kwargs = {
                "ids": new_ids,
                "documents": new_docs,
                "embeddings": new_embeddings
            }
            if new_metadatas:
                add_kwargs["metadatas"] = new_metadatas

            collection.add(**add_kwargs)

            logger.info(f"Added {len(new_ids)} docs with BGE-M3 embeddings to {collection_name}")

            return [TextContent(
                type="text",
                text=json.dumps({
                    "added": len(new_ids),
                    "skipped": len(ids) - len(new_ids),
                    "dimensions": 1024,
                    "collection": collection_name,
                    "model": _model_name
                })
            )]

        except Exception as e:
            logger.error(f"Chroma add error: {e}")
            return [TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]

    elif name == "chroma_query_with_embeddings":
        collection_name = arguments.get("collection_name", "")
        query = arguments.get("query", "")
        n_results = arguments.get("n_results", 10)
        where = arguments.get("where", None)
        include = arguments.get("include", ["documents", "metadatas", "distances"])
        data_dir = arguments.get("data_dir", DEFAULT_DATA_DIR)

        if not collection_name or not query:
            return [TextContent(
                type="text",
                text=json.dumps({"error": "collection_name and query are required"})
            )]

        try:
            # Compute BGE-M3 query embedding
            model = get_model()
            outputs = model.encode(
                [query],
                return_dense=True,
                return_sparse=False,
                return_colbert_vecs=False
            )
            query_embedding = outputs['dense_vecs'][0].tolist()

            # Query Chroma with custom embedding
            client = get_chroma_client(data_dir)
            collection = client.get_collection(collection_name)

            query_kwargs = {
                "query_embeddings": [query_embedding],
                "n_results": n_results,
                "include": include
            }
            if where:
                query_kwargs["where"] = where

            results = collection.query(**query_kwargs)

            logger.info(f"Queried {collection_name} with BGE-M3, got {len(results.get('ids', [[]])[0])} results")

            return [TextContent(
                type="text",
                text=json.dumps(results)
            )]

        except Exception as e:
            logger.error(f"Chroma query error: {e}")
            return [TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
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
