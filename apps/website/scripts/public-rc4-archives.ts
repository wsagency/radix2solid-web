import { createHash } from 'node:crypto';
import { access, copyFile, mkdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { basename, isAbsolute, resolve } from 'node:path';

export type PublicArchivePin = {
  name: string;
  version: string;
  url: string;
  integrity: string;
};

export const publicArchivePins: readonly PublicArchivePin[] = [
  {
    name: '@wsagency/radix2solid-primitives', version: '0.1.0-rc.4',
    url: 'https://registry.npmjs.org/@wsagency/radix2solid-primitives/-/radix2solid-primitives-0.1.0-rc.4.tgz',
    integrity: 'sha512-7QrrQTpDqk1thrY46m9kCc4W8jNk/fjXGnIzOlB6G+gKkFfy705YKEYdd2dOXJupyXlYA53OTDtSIUUBeuRd1w==',
  },
  {
    name: '@wsagency/radix2solid-icons', version: '0.1.0-rc.4',
    url: 'https://registry.npmjs.org/@wsagency/radix2solid-icons/-/radix2solid-icons-0.1.0-rc.4.tgz',
    integrity: 'sha512-sMBHNqDySXiLQyUjVlAFDI7WJx4+/Rl48vqw223zV2EcnuaDNAI42A9wIkGoPP//Fi/uWENWl1IEhwKYyLzo6A==',
  },
  {
    name: '@wsagency/radix2solid-themes', version: '0.1.0-rc.4',
    url: 'https://registry.npmjs.org/@wsagency/radix2solid-themes/-/radix2solid-themes-0.1.0-rc.4.tgz',
    integrity: 'sha512-Ajol4fyMstvTUMig0JVvnWTJtyOBVQMmDK3iPMB7fzthgZ27u0wZL32gYtABfNl9kdAKg/ebwJ/yOYTCc9+j6w==',
  },
  {
    name: '@wsagency/radix2solid-charts', version: '0.1.0-rc.4',
    url: 'https://registry.npmjs.org/@wsagency/radix2solid-charts/-/radix2solid-charts-0.1.0-rc.4.tgz',
    integrity: 'sha512-IQUQPYq8PbbI2/30+8uWCMoIx2NuwMql8IXj5BoqmwNvgSQdqoGF2sgG6Jbt4T1gBPg48BcxooxI7pEWeUuqQg==',
  },
  {
    name: '@wsagency/radix2solid-icons-extra', version: '0.1.0-rc.4',
    url: 'https://registry.npmjs.org/@wsagency/radix2solid-icons-extra/-/radix2solid-icons-extra-0.1.0-rc.4.tgz',
    integrity: 'sha512-9m+WbYdO5z9xif7+8q8bc/bOGC/V8cGUjN9bzf582m1Q9+6tSiRTSUxfrR6yuYsEv7mSw0T2mcKKPQirgs8qAg==',
  },
];

export const publicSandboxVersions = {
  packageManager: 'pnpm@11.5.0',
  nodeRange: '>=24 <25',
  solid: '2.0.0-rc.15',
  plugin: '3.0.0-next.50',
  vite: '8.3.3',
  colors: '3.0.0',
  tailwind: '4.3.3',
} as const;

export const publicSandboxAgeExceptions = [
  'solid-js@2.0.0-rc.15',
  '@solidjs/web@2.0.0-rc.15',
  '@solidjs/signals@2.0.0-rc.15',
  '@solidjs/compiler@2.0.0-rc.15',
  '@solidjs/compiler-darwin-arm64@2.0.0-rc.15',
  '@solidjs/compiler-darwin-x64@2.0.0-rc.15',
  '@solidjs/compiler-linux-arm64-gnu@2.0.0-rc.15',
  '@solidjs/compiler-linux-x64-gnu@2.0.0-rc.15',
  '@solidjs/compiler-wasm32-wasi@2.0.0-rc.15',
  '@solidjs/compiler-win32-x64-msvc@2.0.0-rc.15',
  '@solidjs/babel-plugin@2.0.0-rc.15',
  '@solidjs/vite-plugin@3.0.0-next.50',
  ...publicArchivePins.map(pin => `${pin.name}@${pin.version}`),
] as const;

export const publicChartsD3Packages = [
  'd3-array@3.2.4',
  'd3-color@3.1.0',
  'd3-format@3.1.2',
  'd3-interpolate@3.0.1',
  'd3-path@3.1.0',
  'd3-scale@4.0.2',
  'd3-shape@3.2.0',
  'd3-time@3.1.0',
  'd3-time-format@4.1.0',
  'internmap@2.0.3',
] as const;

export const publicArchiveCache = resolve(import.meta.dirname, '../../../.artifacts/public-rc4-tarballs');

export type VerifiedPublicArchive = {
  path: string;
  pin: PublicArchivePin;
  members: ReadonlySet<string>;
};

export function publicArchiveFileName(pin: Pick<PublicArchivePin, 'name' | 'version'>): string {
  return `${pin.name.replace(/^@/, '').replace('/', '-')}-${pin.version}.tgz`;
}
export async function copyPublicArchiveDownload(archive: VerifiedPublicArchive, outputDirectory: string): Promise<string> {
  await mkdir(outputDirectory, { recursive: true });
  const destination = resolve(outputDirectory, publicArchiveFileName(archive.pin));
  await copyFile(archive.path, destination);
  return destination;
}

function tar(args: string[], maxBuffer = 32 * 1024 * 1024): Buffer {
  const result = spawnSync('tar', args, { maxBuffer });
  if (result.error || result.status !== 0 || !Buffer.isBuffer(result.stdout)) {
    throw new Error('Public RC4 package archive could not be inspected.');
  }
  return result.stdout;
}

const privateContent = [
  /\/(?:private\/tmp|tmp|home|Users)\/[^\s"'<>]*/,
  /file:\/\/\/(?:private\/|tmp\/|home\/|Users\/)/,
  /[A-Z]:\\Users\\[^\s"'<>]*/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bnpm_[A-Za-z0-9]{36}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
];

export async function verifyPublicArchive(file: string, pin: PublicArchivePin): Promise<VerifiedPublicArchive> {
  const bytes = await readFile(file);
  const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
  if (integrity !== pin.integrity) throw new Error(`Public RC4 archive integrity mismatch for ${pin.name}@${pin.version}.`);

  const members = tar(['-tzf', file]).toString('utf8').split(/\r?\n/).filter(Boolean);
  if (!members.length || members.some(member => {
    const segments = member.split('/');
    return member.includes('\\') || member.includes('\0') || isAbsolute(member)
      || segments.includes('..') || (segments[0] !== 'package' && member !== 'package');
  }) || members.filter(member => member === 'package/package.json').length !== 1) {
    throw new Error(`Public RC4 archive member layout is invalid for ${pin.name}@${pin.version}.`);
  }

  let manifest: { name?: string; version?: string };
  try {
    manifest = JSON.parse(tar(['-xzOf', file, 'package/package.json'], 1 << 20).toString('utf8'));
  } catch {
    throw new Error(`Public RC4 archive package identity is invalid for ${pin.name}@${pin.version}.`);
  }
  if (manifest.name !== pin.name || manifest.version !== pin.version) {
    throw new Error(`Public RC4 archive package identity mismatch for ${pin.name}@${pin.version}.`);
  }

  const contents = tar(['-xOzf', file]).toString('utf8');
  if (privateContent.some(pattern => pattern.test(contents))) {
    throw new Error(`Public RC4 archive privacy validation failed for ${pin.name}@${pin.version}.`);
  }

  return { path: file, pin, members: new Set(members) };
}

export async function readCachedPublicArchive(pin: PublicArchivePin, cache = publicArchiveCache): Promise<VerifiedPublicArchive> {
  const file = resolve(cache, basename(pin.url));
  try {
    await access(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Missing cached public RC4 package archive for ${pin.name}@${pin.version}.`);
    }
    throw new Error(`Cached public RC4 package archive is unavailable for ${pin.name}@${pin.version}.`);
  }
  return verifyPublicArchive(file, pin);
}

export function readPublicArchiveMember(archive: VerifiedPublicArchive, member: string): Buffer {
  if (!archive.members.has(member) || member.includes('\\') || member.split('/').includes('..') || isAbsolute(member)) {
    throw new Error(`Public RC4 archive member is unavailable for ${archive.pin.name}@${archive.pin.version}.`);
  }
  return tar(['-xzOf', archive.path, member], 32 * 1024 * 1024);
}
