#!/usr/bin/env node

import { readdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brotliCompress, constants, gzip } from "node:zlib";
import { promisify } from "node:util";

const brotli = promisify(brotliCompress);
const gzipAsync = promisify(gzip);
const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../scratch/asar/webview/assets");
const minimumSize = 4096;
const concurrency = 4;

async function compressFile(file) {
  const sourcePath = path.join(directory, file);
  const sourceStat = await stat(sourcePath);
  if (sourceStat.size < minimumSize) return;

  const data = await readFile(sourcePath);
  for (const [extension, compress] of [
    ["br", () => brotli(data, { params: { [constants.BROTLI_PARAM_QUALITY]: 4 } })],
    ["gz", () => gzipAsync(data, { level: 6 })],
  ]) {
    const targetPath = `${sourcePath}.${extension}`;
    const existing = await stat(targetPath).catch(() => null);
    if (existing && existing.size > 0 && existing.mtimeMs >= sourceStat.mtimeMs) continue;

    const compressed = await compress();
    if (compressed.length >= data.length) {
      if (existing) await unlink(targetPath);
      continue;
    }

    const temporaryPath = `${targetPath}.tmp-${process.pid}`;
    try {
      await writeFile(temporaryPath, compressed);
      await rename(temporaryPath, targetPath);
    } catch (error) {
      await unlink(temporaryPath).catch(() => {});
      throw error;
    }
  }
}

const files = (await readdir(directory, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /\.(?:js|css)$/.test(entry.name))
  .map((entry) => entry.name);
let nextIndex = 0;
await Promise.all(Array.from({ length: concurrency }, async () => {
  while (nextIndex < files.length) {
    const file = files[nextIndex++];
    await compressFile(file);
  }
}));
console.log(`Checked ${files.length} web assets for compression`);
