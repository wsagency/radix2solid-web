import { mkdir, mkdtemp, rename, rm, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import {
  publicArchiveCache,
  publicArchivePins,
  readCachedPublicArchive,
  verifyPublicArchive,
} from './public-rc4-archives.ts';

await mkdir(publicArchiveCache, { recursive: true });
for (const pin of publicArchivePins) {
  const destination = resolve(publicArchiveCache, basename(pin.url));
  try {
    await readCachedPublicArchive(pin);
    console.log(`Verified cached public package ${pin.name}@${pin.version}.`);
    continue;
  } catch (error) {
    if (!(error instanceof Error) || !error.message.startsWith('Missing cached public RC4 package archive')) throw error;
  }

  const staging = await mkdtemp(resolve(publicArchiveCache, '.download-'));
  try {
    const response = await fetch(pin.url);
    if (!response.ok) throw new Error(`Public package download failed for ${pin.name}@${pin.version} (HTTP ${response.status}).`);
    const stagedArchive = resolve(staging, basename(pin.url));
    await writeFile(stagedArchive, Buffer.from(await response.arrayBuffer()), { flag: 'wx' });
    await verifyPublicArchive(stagedArchive, pin);
    await rename(stagedArchive, destination);
    console.log(`Prepared verified public package ${pin.name}@${pin.version}.`);
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
}
