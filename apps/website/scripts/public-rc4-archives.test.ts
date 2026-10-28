import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test, { type TestContext } from 'node:test';
import { readCachedPublicArchive, verifyPublicArchive, type PublicArchivePin } from './public-rc4-archives.ts';

async function fixture(t: TestContext, packageJson: unknown) {
  const directory = await mkdtemp(resolve(tmpdir(), 'radix2solid-public-archive-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const packageDirectory = resolve(directory, 'package');
  await mkdir(packageDirectory);
  await writeFile(resolve(packageDirectory, 'package.json'), JSON.stringify(packageJson));
  await writeFile(resolve(packageDirectory, 'LICENSE'), 'Fixture license\n');
  const archive = resolve(directory, 'fixture.tgz');
  const result = spawnSync('tar', ['-czf', archive, '-C', directory, 'package'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const bytes = await readFile(archive);
  return { directory, archive, integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}` };
}

const expectedIdentity = { name: '@wsagency/radix2solid-primitives', version: '0.1.0-rc.4' };

test('rejects modified bytes before accepting an archive', async t => {
  const input = await fixture(t, expectedIdentity);
  const pin: PublicArchivePin = { ...expectedIdentity, url: 'https://registry.npmjs.org/pinned.tgz', integrity: input.integrity };
  await writeFile(input.archive, Buffer.from('corrupt archive bytes'));
  await assert.rejects(verifyPublicArchive(input.archive, pin), /integrity/i);
});

test('rejects an otherwise well-formed archive with the wrong published package identity', async t => {
  const input = await fixture(t, { ...expectedIdentity, name: '@attacker/wrong-package' });
  const pin: PublicArchivePin = { ...expectedIdentity, url: 'https://registry.npmjs.org/pinned.tgz', integrity: input.integrity };
  await assert.rejects(verifyPublicArchive(input.archive, pin), /identity/i);
});

test('fails closed on a missing cache entry', async t => {
  const directory = await mkdtemp(resolve(tmpdir(), 'radix2solid-public-archive-cache-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const pin: PublicArchivePin = { ...expectedIdentity, url: 'https://registry.npmjs.org/pinned.tgz', integrity: 'sha512-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==' };
  await assert.rejects(readCachedPublicArchive(pin, directory), /missing/i);
});

test('rejects local paths in members without echoing their contents', async t => {
  const sentinel = 'PRIVATE_PATH_SENTINEL_7cf9d2';
  const input = await fixture(t, { ...expectedIdentity, _resolved: `/private/tmp/${sentinel}/package.tgz` });
  const pin: PublicArchivePin = { ...expectedIdentity, url: 'https://registry.npmjs.org/pinned.tgz', integrity: input.integrity };
  await assert.rejects(verifyPublicArchive(input.archive, pin), error => {
    assert(error instanceof Error);
    assert.match(error.message, /privacy/i);
    assert.doesNotMatch(error.message, new RegExp(sentinel));
    return true;
  });
});

test('rejects a known npm token marker without echoing it', async t => {
  const sentinel = `npm_${'a'.repeat(36)}`;
  const input = await fixture(t, { ...expectedIdentity, token: sentinel });
  const pin: PublicArchivePin = { ...expectedIdentity, url: 'https://registry.npmjs.org/pinned.tgz', integrity: input.integrity };
  await assert.rejects(verifyPublicArchive(input.archive, pin), error => {
    assert(error instanceof Error);
    assert.match(error.message, /privacy/i);
    assert.doesNotMatch(error.message, new RegExp(sentinel));
    return true;
  });
});
