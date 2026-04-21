#!/usr/bin/env node
/**
 * Optimize book cover images using Sharp.
 * For each image in public/images/**, creates a .webp version alongside it.
 * Originals are left untouched.
 *
 * Run: node scripts/optimize_images.mjs
 *
 * NOTE: If the Astro dev server is running, stop it first —
 * Windows locks files being served, causing "UNKNOWN" errors.
 */

import sharp from 'sharp';
import { readdir, stat, readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const IMAGES_DIR = join(ROOT, 'public', 'images');

const QUALITY_WEBP = 82;
const MAX_WIDTH = 1200;
const MAX_RETRIES = 3;

async function walk(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function optimize(file) {
  const ext = extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return null;

  const webpPath = file.replace(new RegExp(ext + '$', 'i'), '.webp');

  // Skip if webp already exists and is newer than source
  if (existsSync(webpPath)) {
    try {
      const [srcStat, webpStat] = await Promise.all([stat(file), stat(webpPath)]);
      if (webpStat.mtimeMs >= srcStat.mtimeMs) return 'skipped';
    } catch {}
  }

  // Retry on transient file-lock errors
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Read file into buffer first (avoids Sharp's direct file handle issues on Windows)
      const buffer = await readFile(file);
      const img = sharp(buffer);
      const metadata = await img.metadata();

      if (metadata.width && metadata.width > MAX_WIDTH) {
        img.resize({ width: MAX_WIDTH, withoutEnlargement: true });
      }

      await img.webp({ quality: QUALITY_WEBP, effort: 4 }).toFile(webpPath);
      return 'ok';
    } catch (err) {
      if (attempt < MAX_RETRIES && err.code === 'UNKNOWN') {
        await sleep(100 * attempt);
        continue;
      }
      console.error(`  ERROR ${file.replace(ROOT, '')}: ${err.message}`);
      return 'error';
    }
  }
}

(async () => {
  console.log(`Scanning ${IMAGES_DIR}...\n`);
  const files = await walk(IMAGES_DIR);

  let ok = 0, skipped = 0, errors = 0;
  for (const file of files) {
    const result = await optimize(file);
    if (result === 'ok') {
      ok++;
      if (ok % 20 === 0) console.log(`  ... optimized ${ok} images`);
    } else if (result === 'skipped') skipped++;
    else if (result === 'error') errors++;
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Optimized: ${ok}, Skipped: ${skipped}, Errors: ${errors}`);
  if (errors > 0) {
    console.log(`\nTip: If you see UNKNOWN errors, stop the Astro dev server first.`);
  }
})();
