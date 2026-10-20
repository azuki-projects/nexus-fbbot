#!/usr/bin/env node
/**
 * Nexus FB-Bot Unified Server Runner
 * Runs the Express API backend, Vite frontend middlewares,
 * ws3-fca Facebook bot manager, and persistent JSON storage.
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverTs = path.join(__dirname, 'server.ts');

// If already running with tsx loader hook
if (process.env.__TSX_LOADED__ === 'true') {
  await import('./server.ts');
} else {
  // Spawn with node --import tsx to handle all TypeScript modules seamlessly
  const child = spawn(process.execPath, ['--import', 'tsx', serverTs, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: {
      ...process.env,
      __TSX_LOADED__: 'true'
    }
  });

  child.on('error', (err) => {
    console.error('[server.js] Failed to start server:', err);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    }
    process.exit(code ?? 0);
  });

  // Forward signals
  process.on('SIGINT', () => child.kill('SIGINT'));
  process.on('SIGTERM', () => child.kill('SIGTERM'));
}
