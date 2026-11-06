#!/usr/bin/env node
/**
 * Poll /customization for changes and rebuild the frontend when it changes.
 * Polling is used instead of inotify so bind mounts work on Docker Desktop
 * (macOS/Windows) as well as native Linux.
 */
import { spawn } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const CUSTOMIZATION_DIR = process.env.CUSTOMIZATION_DIR || "/customization";
const REBUILD_SCRIPT = process.env.REBUILD_SCRIPT || "/serve/rebuild-frontend.sh";
const POLL_MS = Number(process.env.CUSTOMIZATION_POLL_MS || 2000);
const DEBOUNCE_MS = Number(process.env.CUSTOMIZATION_DEBOUNCE_MS || 1000);

async function fingerprint(dir) {
  const entries = [];

  async function walk(current) {
    let items;
    try {
      items = await readdir(current, { withFileTypes: true });
    } catch {
      // Directory may be missing temporarily during host-side edits.
      return;
    }

    for (const item of items) {
      const path = join(current, item.name);
      if (item.isDirectory()) {
        await walk(path);
      } else if (item.isFile() || item.isSymbolicLink()) {
        try {
          const info = await stat(path);
          entries.push(`${path}\0${info.mtimeMs}\0${info.size}`);
        } catch {
          // File may disappear between readdir and stat.
        }
      }
    }
  }

  await walk(dir);
  entries.sort();
  return entries.join("\n");
}

let lastFingerprint = await fingerprint(CUSTOMIZATION_DIR);
let rebuilding = false;
let pendingRebuild = false;
let debounceTimer = null;

function runRebuild() {
  if (rebuilding) {
    pendingRebuild = true;
    return;
  }

  rebuilding = true;
  console.log("[customization-watch] Change detected; rebuilding frontend...");

  const child = spawn(REBUILD_SCRIPT, [], {
    stdio: "inherit",
    env: process.env,
  });

  child.on("error", (err) => {
    console.error("[customization-watch] Failed to start rebuild:", err);
    rebuilding = false;
    if (pendingRebuild) {
      pendingRebuild = false;
      runRebuild();
    }
  });

  child.on("exit", (code) => {
    rebuilding = false;
    if (code === 0) {
      console.log("[customization-watch] Frontend reloaded. Refresh your browser to see changes.");
    } else {
      console.error(`[customization-watch] Rebuild failed with exit code ${code}`);
    }

    // Rebuild again if more edits landed while the previous build was running.
    if (pendingRebuild) {
      pendingRebuild = false;
      runRebuild();
    }
  });
}

function scheduleRebuild() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runRebuild, DEBOUNCE_MS);
}

console.log(
  `[customization-watch] Watching ${CUSTOMIZATION_DIR} every ${POLL_MS}ms (debounce ${DEBOUNCE_MS}ms)`,
);

setInterval(async () => {
  try {
    const next = await fingerprint(CUSTOMIZATION_DIR);
    if (next !== lastFingerprint) {
      lastFingerprint = next;
      scheduleRebuild();
    }
  } catch (err) {
    console.error("[customization-watch] Poll failed:", err);
  }
}, POLL_MS);
