#!/usr/bin/env bun
/**
 * Embedding Migration Script
 *
 * Migrates vector database from all-MiniLM-L6-v2 (384d) to BGE-M3 (1024d)
 *
 * Usage:
 *   bun scripts/migrate-embeddings.ts --dry-run     # Preview migration
 *   bun scripts/migrate-embeddings.ts --migrate     # Execute migration
 *   bun scripts/migrate-embeddings.ts --rollback    # Restore from backup
 *   bun scripts/migrate-embeddings.ts --status      # Check current status
 */

import { SessionStore } from '../src/services/sqlite/SessionStore.js';
import { ChromaSync } from '../src/services/sync/ChromaSync.js';
import { SettingsDefaultsManager } from '../src/shared/SettingsDefaultsManager.js';
import { USER_SETTINGS_PATH } from '../src/shared/paths.js';
import path from 'path';
import fs from 'fs';
import os from 'os';

const VECTOR_DB_DIR = path.join(os.homedir(), '.claude-mem', 'vector-db');
const BACKUP_DIR = path.join(os.homedir(), '.claude-mem', 'vector-db-backup');

interface MigrationStats {
  observations: number;
  summaries: number;
  prompts: number;
  estimatedDocs: number;
  estimatedTimeMinutes: number;
}

async function getStats(): Promise<MigrationStats> {
  const db = new SessionStore();

  try {
    const obsCount = db.db.prepare('SELECT COUNT(*) as count FROM observations').get() as { count: number };
    const summaryCount = db.db.prepare('SELECT COUNT(*) as count FROM session_summaries').get() as { count: number };
    const promptCount = db.db.prepare('SELECT COUNT(*) as count FROM user_prompts').get() as { count: number };

    // Estimate: ~3 docs per observation (narrative + text + facts), ~6 per summary, 1 per prompt
    const estimatedDocs = obsCount.count * 3 + summaryCount.count * 6 + promptCount.count;

    // Estimate: ~30 seconds per 1000 documents with BGE-M3
    const estimatedTimeMinutes = Math.ceil((estimatedDocs / 1000) * 0.5);

    return {
      observations: obsCount.count,
      summaries: summaryCount.count,
      prompts: promptCount.count,
      estimatedDocs,
      estimatedTimeMinutes
    };
  } finally {
    db.close();
  }
}

async function checkStatus(): Promise<void> {
  console.log('=== Embedding Migration Status ===\n');

  // Check settings
  const settings = SettingsDefaultsManager.loadFromFile(USER_SETTINGS_PATH);
  const embeddingModel = settings.CLAUDE_MEM_EMBEDDING_MODEL || 'default';
  const embeddingEnabled = settings.CLAUDE_MEM_EMBEDDING_MCP_ENABLED === 'true';
  const embeddingServerPath = settings.CLAUDE_MEM_EMBEDDING_SERVER_PATH || '(not set)';

  console.log('Current Configuration:');
  console.log(`  CLAUDE_MEM_EMBEDDING_MODEL: ${embeddingModel}`);
  console.log(`  CLAUDE_MEM_EMBEDDING_MCP_ENABLED: ${embeddingEnabled}`);
  console.log(`  CLAUDE_MEM_EMBEDDING_SERVER_PATH: ${embeddingServerPath}`);
  console.log();

  // Check vector DB
  const vectorDbExists = fs.existsSync(VECTOR_DB_DIR);
  const backupExists = fs.existsSync(BACKUP_DIR);

  console.log('Vector Database:');
  console.log(`  Path: ${VECTOR_DB_DIR}`);
  console.log(`  Exists: ${vectorDbExists}`);
  if (vectorDbExists) {
    const stats = fs.statSync(VECTOR_DB_DIR);
    console.log(`  Size: ${(getDirSize(VECTOR_DB_DIR) / 1024 / 1024).toFixed(2)} MB`);
  }
  console.log();

  console.log('Backup:');
  console.log(`  Path: ${BACKUP_DIR}`);
  console.log(`  Exists: ${backupExists}`);
  if (backupExists) {
    console.log(`  Size: ${(getDirSize(BACKUP_DIR) / 1024 / 1024).toFixed(2)} MB`);
  }
  console.log();

  // Get migration stats
  const stats = await getStats();
  console.log('Data to Migrate:');
  console.log(`  Observations: ${stats.observations}`);
  console.log(`  Session Summaries: ${stats.summaries}`);
  console.log(`  User Prompts: ${stats.prompts}`);
  console.log(`  Estimated Documents: ~${stats.estimatedDocs}`);
  console.log();

  // Recommendation
  console.log('Recommendation:');
  if (embeddingEnabled && embeddingModel === 'bge-m3') {
    console.log('  ✓ BGE-M3 is already configured');
    if (!backupExists) {
      console.log('  ⚠ No backup exists - run --migrate to create one and rebuild vectors');
    }
  } else {
    console.log('  → Run --migrate to switch to BGE-M3 (1024d) embeddings');
    console.log(`  → Estimated time: ~${stats.estimatedTimeMinutes} minutes`);
  }
}

async function previewMigration(): Promise<void> {
  console.log('=== Embedding Migration Preview ===\n');

  const stats = await getStats();

  console.log('Records to migrate:');
  console.log(`  Observations: ${stats.observations}`);
  console.log(`  Session Summaries: ${stats.summaries}`);
  console.log(`  User Prompts: ${stats.prompts}`);
  console.log();

  console.log(`Estimated documents to re-embed: ~${stats.estimatedDocs}`);
  console.log(`Estimated time: ~${stats.estimatedTimeMinutes} minutes`);
  console.log();

  console.log('Changes:');
  console.log('  • Embedding model: all-MiniLM-L6-v2 (384d) → BGE-M3 (1024d)');
  console.log('  • Vector DB will be backed up to:', BACKUP_DIR);
  console.log('  • All vectors will be recomputed');
  console.log();

  console.log('To execute migration, run:');
  console.log('  bun scripts/migrate-embeddings.ts --migrate');
  console.log();

  console.log('To rollback after migration:');
  console.log('  bun scripts/migrate-embeddings.ts --rollback');
}

async function executeMigration(): Promise<void> {
  console.log('=== Starting Embedding Migration ===\n');

  // Step 1: Backup existing vector DB
  console.log('Step 1: Backing up existing vector database...');
  if (fs.existsSync(VECTOR_DB_DIR)) {
    if (fs.existsSync(BACKUP_DIR)) {
      console.log('  Removing old backup...');
      fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
    }
    fs.cpSync(VECTOR_DB_DIR, BACKUP_DIR, { recursive: true });
    console.log(`  ✓ Backed up to: ${BACKUP_DIR}`);
  } else {
    console.log('  No existing vector database to backup');
  }

  // Step 2: Update settings
  console.log('\nStep 2: Updating settings...');
  const settings = SettingsDefaultsManager.loadFromFile(USER_SETTINGS_PATH);

  // Determine the embedding server path (relative to this script's location)
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const embeddingServerPath = path.join(scriptDir, '..', 'embedding-mcp-server');
  const resolvedEmbeddingServerPath = path.resolve(embeddingServerPath);

  const updatedSettings = {
    ...settings,
    CLAUDE_MEM_EMBEDDING_MODEL: 'bge-m3',
    CLAUDE_MEM_EMBEDDING_MCP_ENABLED: 'true',
    CLAUDE_MEM_EMBEDDING_SERVER_PATH: resolvedEmbeddingServerPath
  };
  fs.writeFileSync(USER_SETTINGS_PATH, JSON.stringify(updatedSettings, null, 2), 'utf-8');
  console.log(`  ✓ Settings updated (embedding server path: ${resolvedEmbeddingServerPath})`);

  // Step 3: Delete old vector DB
  console.log('\nStep 3: Removing old vector database...');
  if (fs.existsSync(VECTOR_DB_DIR)) {
    fs.rmSync(VECTOR_DB_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(VECTOR_DB_DIR, { recursive: true });
  console.log('  ✓ Vector database cleared');

  // Step 4: Get unique projects
  console.log('\nStep 4: Discovering projects...');
  const db = new SessionStore();
  const projects = db.db.prepare('SELECT DISTINCT project FROM observations').all() as { project: string }[];
  console.log(`  Found ${projects.length} project(s): ${projects.map(p => p.project).join(', ')}`);
  db.close();

  // Step 5: Rebuild for each project
  console.log('\nStep 5: Rebuilding vectors with BGE-M3...');
  const startTime = Date.now();

  for (const { project } of projects) {
    console.log(`\n  Processing project: ${project}`);
    try {
      const chromaSync = new ChromaSync(project);
      await chromaSync.ensureBackfilled();
      await chromaSync.close();
      console.log(`  ✓ Project ${project} complete`);
    } catch (error) {
      console.error(`  ✗ Failed to migrate project ${project}:`, error);
      console.log('\n  Rolling back due to error...');
      await rollbackMigration();
      throw error;
    }
  }

  const elapsedMinutes = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log(`\n=== Migration Complete ===`);
  console.log(`Time elapsed: ${elapsedMinutes} minutes`);
  console.log('\nYour vector database is now using BGE-M3 (1024d) embeddings.');
  console.log('To rollback: bun scripts/migrate-embeddings.ts --rollback');
}

async function rollbackMigration(): Promise<void> {
  console.log('=== Rolling Back Migration ===\n');

  if (!fs.existsSync(BACKUP_DIR)) {
    console.error('Error: No backup found at:', BACKUP_DIR);
    console.error('Cannot rollback without a backup.');
    process.exit(1);
  }

  // Step 1: Restore vector DB
  console.log('Step 1: Restoring vector database from backup...');
  if (fs.existsSync(VECTOR_DB_DIR)) {
    fs.rmSync(VECTOR_DB_DIR, { recursive: true, force: true });
  }
  fs.cpSync(BACKUP_DIR, VECTOR_DB_DIR, { recursive: true });
  console.log('  ✓ Vector database restored');

  // Step 2: Restore settings
  console.log('\nStep 2: Restoring settings...');
  const settings = SettingsDefaultsManager.loadFromFile(USER_SETTINGS_PATH);
  const restoredSettings = {
    ...settings,
    CLAUDE_MEM_EMBEDDING_MODEL: 'default',
    CLAUDE_MEM_EMBEDDING_MCP_ENABLED: 'false'
  };
  fs.writeFileSync(USER_SETTINGS_PATH, JSON.stringify(restoredSettings, null, 2), 'utf-8');
  console.log('  ✓ Settings restored to default');

  console.log('\n=== Rollback Complete ===');
  console.log('Your vector database is now using the default embedding model.');
}

function getDirSize(dirPath: string): number {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getDirSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch {
    // Ignore errors
  }
  return size;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--status') || args.length === 0) {
    await checkStatus();
  } else if (args.includes('--dry-run')) {
    await previewMigration();
  } else if (args.includes('--migrate')) {
    await executeMigration();
  } else if (args.includes('--rollback')) {
    await rollbackMigration();
  } else {
    console.log('Usage: bun scripts/migrate-embeddings.ts [--status|--dry-run|--migrate|--rollback]');
    console.log();
    console.log('Options:');
    console.log('  --status    Check current embedding configuration (default)');
    console.log('  --dry-run   Preview migration without making changes');
    console.log('  --migrate   Execute migration to BGE-M3');
    console.log('  --rollback  Restore from backup');
  }
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
