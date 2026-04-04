#!/usr/bin/env node
/**
 * Generate small webp thumbnails for every card in __data__/cards/.
 *
 * Usage:  node generate_thumbnails.mjs        (from project root)
 *         npm run thumbnails
 *
 * Outputs 120px-wide webp thumbnails to __data__/cards/thumbnails/.
 * 120px ≈ 2× the 52px display size in the card selector (retina-ready).
 */

import { readdir, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = dirname(fileURLToPath(import.meta.url));
const CARDS_DIR = join(ROOT, "__data__", "cards");
const THUMB_DIR = join(CARDS_DIR, "thumbnails");
const THUMB_WIDTH = 120;

const files = (await readdir(CARDS_DIR)).filter((f) => f.endsWith(".webp")).sort();

if (!files.length) {
  console.log("No .webp cards found in", CARDS_DIR);
  process.exit(0);
}

await mkdir(THUMB_DIR, { recursive: true });

let created = 0;
for (const file of files) {
  await sharp(join(CARDS_DIR, file))
    .resize(THUMB_WIDTH)
    .webp({ quality: 80 })
    .toFile(join(THUMB_DIR, file));
  created++;
}

console.log(`Generated ${created} thumbnails in ${THUMB_DIR}`);
