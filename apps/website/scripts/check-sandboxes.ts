import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, open, readFile, readdir, rm, realpath, type FileHandle } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { chromium, firefox, webkit, expect } from '@playwright/test';
import { preview } from 'vite';

const site = resolve(import.meta.dirname, '..');
const output = resolve(site, 'out/sandboxes');
const coverage: { sandboxes: string[] } = JSON.parse(await readFile(resolve(site, 'coverage-manifest.json'), 'utf8'));
const archives = (await readdir(output)).filter(name => name.endsWith('.tar.gz')).sort();
assert.deepEqual(archives, [...coverage.sandboxes].sort());
const requested = process.argv.slice(2);
for (const archive of requested) assert(archives.includes(archive), `Unknown requested archive: ${archive}`);
const selectedArchives = requested.length ? archives.filter(archive => requested.includes(archive)) : archives;
const scratch = await mkdtemp(resolve(tmpdir(), 'radix2solid-sandboxes-'));
const logRoot = resolve(site, '../../.artifacts/sandboxes');
await mkdir(logRoot, { recursive: true });
const logs = await mkdtemp(resolve(logRoot, 'run-'));
const failures: string[] = [];
let cursor = 0;
type RuntimeFamily = 'dialog' | 'toast' | 'select' | 'charts' | 'combobox' | 'command' | 'tree' | 'splitter' | 'icons-extra' | 'calendar' | 'date-picker' | 'file-drop';
const representatives: Record<string, RuntimeFamily> = {
  'dialog-css.tar.gz': 'dialog',
  'toast-css-modules.tar.gz': 'toast',
  'select-tailwind.tar.gz': 'select',
  'charts-css-modules.tar.gz': 'charts',
  'combobox-css-modules.tar.gz': 'combobox',
  'combobox-css.tar.gz': 'combobox',
  'combobox-tailwind.tar.gz': 'combobox',
  'command-css.tar.gz': 'command',
  'tree-tailwind.tar.gz': 'tree',
  'splitter-css-modules.tar.gz': 'splitter',
  'icons-extra-css-modules.tar.gz': 'icons-extra',
  'calendar-css-modules.tar.gz': 'calendar',
  'calendar-css.tar.gz': 'calendar',
  'calendar-tailwind.tar.gz': 'calendar',
  'date-picker-css-modules.tar.gz': 'date-picker',
  'date-picker-css.tar.gz': 'date-picker',
  'date-picker-tailwind.tar.gz': 'date-picker',
  'file-drop-css-modules.tar.gz': 'file-drop',
  'file-drop-css.tar.gz': 'file-drop',
  'file-drop-tailwind.tar.gz': 'file-drop'
};
async function checkRuntime(project: string, family: RuntimeFamily, log: FileHandle) {
  const server = await preview({ root: project, configFile: false, preview: { host: '127.0.0.1', port: 0 } });
  try {
    const address = server.httpServer.address();
    assert(address && typeof address !== 'string');
    for (const engine of [chromium, firefox, webkit]) {
      const browser = await engine.launch();
      try {
        const page = await browser.newPage();
        const diagnostics: string[] = [];
        page.on('pageerror', error => diagnostics.push(error.message));
        page.on('console', message => { if (message.type() === 'warning' || message.type() === 'error') diagnostics.push(message.text()); });
        await page.goto(`http://127.0.0.1:${address.port}/`);
        if (family === 'dialog') {
          const trigger = page.getByRole('button', { name: 'Edit profile', exact: true });
          await trigger.click();
          const dialog = page.getByRole('dialog', { name: 'Edit profile', exact: true });
          await expect(dialog).toBeVisible();
          const name = dialog.getByRole('textbox', { name: 'Name', exact: true });
          await expect(name).toBeFocused();
          await name.fill('Independent archive consumer');
          await dialog.getByRole('button', { name: 'Save changes', exact: true }).click();
          await expect(dialog).not.toBeVisible();
          await expect(trigger).toBeFocused();
        } else if (family === 'toast') {
          await page.getByRole('button', { name: 'Add to calendar', exact: true }).click();
          const title = page.getByText('Scheduled: Catch up', { exact: true });
          await expect(title).toBeVisible();
          await page.getByRole('button', { name: 'Undo', exact: true }).click();
          await expect(title).not.toBeVisible();
        } else if (family === 'charts') {
          const chart = page.locator('svg.recharts-surface');
          await expect(chart.locator('.recharts-line-curve')).toHaveCount(2);
          const path = await chart.locator('.recharts-line-curve').first().getAttribute('d');
          assert.match(path ?? '', /^M[\d.]+,[\d.]+/, 'line geometry must be finite');
          await page.getByRole('button', { name: 'Bar', exact: true }).click();
          await expect(page.getByRole('button', { name: 'Bar', exact: true })).toHaveAttribute('aria-pressed', 'true');
          await expect(chart.locator('.recharts-bar-rectangle')).toHaveCount(12);
        } else if (family === 'combobox') {
          const input = page.getByRole('combobox', { name: 'Destination', exact: true });
          await input.fill('Paris');
          await input.press('ArrowDown');
          await input.press('Enter');
          await page.getByRole('button', { name: 'Book destination', exact: true }).click();
          await expect(page.getByLabel('Submitted destination', { exact: true })).toContainText('paris; count: 1');
          await input.fill('Unmatched');
          assert.equal(await page.getByRole('form', { name: 'Destination booking', exact: true }).evaluate(node => new FormData(node as HTMLFormElement).has('destination')), false);
          await input.press('Escape');
          await page.getByRole('checkbox', { name: 'Accept value proposals', exact: true }).uncheck();
          const form = page.getByRole('form', { name: 'Destination booking', exact: true });
          await form.evaluate(node => (node as HTMLFormElement).reset());
          await expect(page.getByRole('status', { name: 'Accepted destination', exact: true })).toHaveText('Key: paris');
          await expect(page.getByRole('status', { name: 'Destination query', exact: true })).toHaveText('Query: empty');
          await expect(input).toHaveValue('');
          assert.equal(await form.evaluate(node => new FormData(node as HTMLFormElement).has('destination')), false);
        } else if (family === 'command') {
          const input = page.getByRole('combobox', { name: 'Inline actions', exact: true });
          await input.fill('Create note');
          await input.press('Enter');
          await expect(page.getByLabel('Command action count', { exact: true })).toHaveText('Actions: 1');
          await expect(page.getByLabel('Command form submissions', { exact: true })).toHaveText('Form submissions: 0');
        } else if (family === 'tree') {
          const item = page.getByRole('treeitem', { name: 'Readme', exact: true });
          await item.focus();
          await item.press('Space');
          await expect(page.getByLabel('Tree selected key', { exact: true })).toHaveText('Selected: docs-readme');
          await expect(page.getByLabel('Tree activations', { exact: true })).toHaveText('Activations: 0');
        } else if (family === 'splitter') {
          const handle = page.getByRole('separator', { name: 'Workspace sidebar', exact: true });
          await expect(handle).not.toHaveAttribute('aria-disabled', 'true');
          await handle.focus();
          await handle.press('ArrowRight');
          await expect(page.getByLabel('Splitter commit count', { exact: true })).toHaveText('Commits: 1');
          await handle.press('Enter');
          await expect(page.getByRole('button', { name: 'Sidebar action', exact: true })).not.toBeVisible();
          await expect(page.getByLabel('Splitter commit count', { exact: true })).toHaveText('Commits: 1');
        } else if (family === 'icons-extra') {
          const icon = page.getByRole('img', { name: 'Open project folder', exact: true });
          await expect(icon).toHaveAttribute('viewBox', '0 0 24 24');
          await expect(icon).toHaveAttribute('width', '24');
          await expect(icon.locator('title')).toHaveText('Open project folder');
        } else if (family === 'calendar') {
          const calendar = page.getByRole('region', { name: 'Calendar demonstration', exact: true });
          const grid = calendar.getByRole('grid');
          const day = grid.getByRole('button', { name: 'October 19, 2026', exact: true });
          await day.focus();
          await page.keyboard.press('Enter');
          await expect(calendar.getByLabel('Accepted date')).toHaveText('2026-10-19');
          await calendar.getByRole('button', { name: 'Change locale, week start and direction', exact: true }).click();
          await expect(calendar.locator('[dir="rtl"]')).toBeVisible();
          await expect(calendar.getByLabel('Accepted date')).toHaveText('2026-10-19');
        } else if (family === 'date-picker') {
          const form = page.getByRole('form', { name: 'Appointment booking', exact: true });
          const bridge = form.locator('input[type="date"]');
          const trigger = form.getByRole('button', { name: 'Choose appointment date', exact: true });
          const viewport = page.viewportSize();
          assert(viewport);
          await page.setViewportSize({ width: 420, height: 320 });
          await trigger.click();
          const popup = page.getByRole('dialog').last();
          const octoberThirtieth = popup.getByRole('grid').getByRole('button', { name: 'October 30, 2026', exact: true });
          await octoberThirtieth.focus();
          await page.keyboard.press('ArrowRight');
          const octoberThirtyFirst = popup.getByRole('grid').getByRole('button', { name: 'October 31, 2026', exact: true });
          await expect(octoberThirtyFirst).toBeFocused();
          await expect.poll(async () => {
            const bounds = await popup.boundingBox();
            const viewport = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
            return bounds !== null && bounds.x >= -2 && bounds.y >= -2
              && bounds.x + bounds.width <= viewport.width + 2
              && bounds.y + bounds.height <= viewport.height + 2;
          }).toBe(true);
          await octoberThirtyFirst.click();
          await expect(bridge).toHaveValue('2026-10-31');
          await expect.poll(() => form.evaluate(node => new FormData(node as HTMLFormElement).get('appointment'))).toBe('2026-10-31');
          await form.getByRole('button', { name: 'Clear date', exact: true }).click();
          await expect(bridge).toHaveValue('');
          await page.setViewportSize(viewport);
          await expect.poll(() => bridge.evaluate(node => !(node as HTMLInputElement).checkValidity())).toBe(true);
          await form.evaluate(node => (node as HTMLFormElement).requestSubmit());
          await bridge.focus();
          await expect(trigger).toBeFocused();
          await expect(bridge).not.toBeFocused();
          await trigger.click();
          const day = page.getByRole('dialog').last().getByRole('grid').getByRole('button', { name: 'October 19, 2026', exact: true });
          await day.click();
          await expect(bridge).toHaveValue('2026-10-19');
          await expect.poll(() => form.evaluate(node => new FormData(node as HTMLFormElement).get('appointment'))).toBe('2026-10-19');
        } else if (family === 'file-drop') {
          const input = page.getByLabel('Attachments', { exact: true });
          const form = page.getByRole('form', { name: 'File upload metadata', exact: true });
          const submittedFiles = () => form.evaluate(async node => Promise.all(
            new FormData(node as HTMLFormElement).getAll('attachments').map(async value => value instanceof File
              ? { name: value.name, size: value.size, type: value.type, bytes: [...new Uint8Array(await value.arrayBuffer())] }
              : { value: String(value) })
          ));
          await expect.poll(() => input.evaluate(node => !(node as HTMLInputElement).checkValidity())).toBe(true);
          const accepted = { name: 'archive-check.txt', mimeType: 'text/plain', buffer: Buffer.from('archive candidate') };
          const chooserEvent = page.waitForEvent('filechooser');
          await page.getByRole('button', { name: 'Browse files', exact: true }).click();
          await (await chooserEvent).setFiles(accepted);
          await expect(page.getByLabel('Accepted file names', { exact: true })).toHaveText(accepted.name);
          assert.deepEqual(await submittedFiles(), [{ name: accepted.name, size: accepted.buffer.length, type: accepted.mimeType, bytes: [...accepted.buffer] }]);
          const submittedMetadata = page.getByLabel('Submitted file metadata', { exact: true });
          await form.evaluate(node => (node as HTMLFormElement).requestSubmit());
          await expect(submittedMetadata).toContainText(accepted.name);
          await expect(submittedMetadata).toContainText(`${accepted.buffer.length} bytes`);
          await expect(submittedMetadata).toContainText(accepted.mimeType);
          const disabled = page.getByRole('checkbox', { name: 'Disable file selection', exact: true });
          await disabled.check();
          await form.evaluate(node => (node as HTMLFormElement).requestSubmit());
          await expect(submittedMetadata).toHaveText('No submitted files');
          await disabled.uncheck();

          const dropped = { name: 'archive-drop.txt', mimeType: 'text/plain', contents: 'accepted through drop' };
          const droppedTransfer = await page.evaluateHandle(spec => {
            const transfer = new DataTransfer();
            transfer.items.add(new File([spec.contents], spec.name, { type: spec.mimeType }));
            return transfer;
          }, dropped);
          await input.dispatchEvent('drop', { dataTransfer: droppedTransfer });
          await expect(page.getByLabel('Accepted file names', { exact: true })).toHaveText(dropped.name);
          assert.deepEqual(await submittedFiles(), [{ name: dropped.name, size: dropped.contents.length, type: dropped.mimeType, bytes: [...Buffer.from(dropped.contents)] }]);

          const rejectedDrop = { name: 'archive-rejected.pdf', mimeType: 'application/pdf', contents: 'not accepted' };
          const rejectedTransfer = await page.evaluateHandle(spec => {
            const transfer = new DataTransfer();
            transfer.items.add(new File([spec.contents], spec.name, { type: spec.mimeType }));
            return transfer;
          }, rejectedDrop);
          await input.dispatchEvent('drop', { dataTransfer: rejectedTransfer });
          await expect(page.getByRole('alert')).toBeVisible();
          assert.deepEqual(await submittedFiles(), [{ name: dropped.name, size: dropped.contents.length, type: dropped.mimeType, bytes: [...Buffer.from(dropped.contents)] }]);

          const refused = { name: 'archive-refused.txt', mimeType: 'text/plain', buffer: Buffer.from('refused') };
          await input.setInputFiles(refused);
          await expect(page.getByLabel('Proposed file names', { exact: true })).toHaveText(refused.name);
          await expect(page.getByLabel('Accepted file names', { exact: true })).toHaveText(dropped.name);
          assert.deepEqual(await submittedFiles(), [{ name: dropped.name, size: dropped.contents.length, type: dropped.mimeType, bytes: [...Buffer.from(dropped.contents)] }]);
          await page.getByRole('button', { name: 'Refuse proposed files', exact: true }).click();
          assert.deepEqual(await submittedFiles(), [{ name: dropped.name, size: dropped.contents.length, type: dropped.mimeType, bytes: [...Buffer.from(dropped.contents)] }]);

          const adopted = { name: 'archive-adopted.txt', mimeType: 'text/plain', buffer: Buffer.from('adopted') };
          await input.setInputFiles(adopted);
          await expect(page.getByLabel('Proposed file names', { exact: true })).toHaveText(adopted.name);
          await page.getByRole('button', { name: 'Adopt proposed files', exact: true }).click();
          await expect(page.getByLabel('Accepted file names', { exact: true })).toHaveText(adopted.name);
          assert.deepEqual(await submittedFiles(), [{ name: adopted.name, size: adopted.buffer.length, type: adopted.mimeType, bytes: [...adopted.buffer] }]);

          await input.setInputFiles([]);
          await expect.poll(() => input.evaluate(node => !(node as HTMLInputElement).checkValidity())).toBe(true);
          assert.deepEqual(await submittedFiles(), [{ name: '', size: 0, type: 'application/octet-stream', bytes: [] }]);
        } else {
          const select = page.getByRole('combobox', { name: 'Food', exact: true });
          await select.click();
          await expect(page.getByRole('listbox')).toBeVisible();
          await page.getByRole('option', { name: 'Banana', exact: true }).click();
          await expect(select).toHaveText('Banana');
          await expect(select).toBeFocused();
          await expect(page.getByRole('listbox')).toHaveCount(0);
        }
        assert.deepEqual(diagnostics, []);
        await log.write(`PASS ${family} runtime: ${engine.name()}\n`);
        console.log(`PASS ${family} runtime: ${engine.name()}`);
      } finally { await browser.close(); }
    }
  } finally {
    await new Promise<void>((done, reject) => server.httpServer.close(error => error ? reject(error) : done()));
  }
}
try {
  // Two independent installs/builds at a time; each extracted archive owns its workspace and lock.
  await Promise.all(Array.from({ length: 2 }, async () => {
    while (cursor < selectedArchives.length) {
      const archive = selectedArchives[cursor++];
      const project = resolve(scratch, archive.replace(/\.tar\.gz$/, ''));
      const log = await open(resolve(logs, `${archive}.log`), 'w');
      try {
        await mkdir(project);
        const exec = async (command: string, args: readonly string[]) => {
          await log.write(`$ ${command} ${args.join(' ')}\n`);
          await new Promise<void>((done, reject) => {
            const child = spawn(command, [...args], { cwd: project, stdio: ['ignore', log.fd, log.fd] });
            child.once('error', reject);
            child.once('exit', code => code === 0 ? done() : reject(new Error(`${command} exited ${code}`)));
          });
        };
        await exec('tar', ['-xzf', resolve(output, archive), '-C', project]);
        // Downloaded metadata must pin the coherent tuple, exact registry packages and exact age exceptions.
        const workspace = await readFile(resolve(project, 'pnpm-workspace.yaml'), 'utf8');
        for (const name of ['solid-js', "'@solidjs/web'", "'@solidjs/signals'", "'@solidjs/compiler'", "'@solidjs/babel-plugin'"]) {
          assert(workspace.includes(`\n  ${name}: 2.0.0-rc.15\n`), `${archive}: missing ${name} RC15 override`);
        }
        for (const exception of [
          'solid-js@2.0.0-rc.15', '@solidjs/web@2.0.0-rc.15', '@solidjs/signals@2.0.0-rc.15',
          '@solidjs/compiler@2.0.0-rc.15', '@solidjs/compiler-darwin-arm64@2.0.0-rc.15',
          '@solidjs/compiler-darwin-x64@2.0.0-rc.15', '@solidjs/compiler-linux-arm64-gnu@2.0.0-rc.15',
          '@solidjs/compiler-linux-x64-gnu@2.0.0-rc.15', '@solidjs/compiler-wasm32-wasi@2.0.0-rc.15',
          '@solidjs/compiler-win32-x64-msvc@2.0.0-rc.15', '@solidjs/babel-plugin@2.0.0-rc.15',
          '@solidjs/vite-plugin@3.0.0-next.50', '@wsagency/radix2solid-primitives@0.1.0-rc.4',
          '@wsagency/radix2solid-icons@0.1.0-rc.4', '@wsagency/radix2solid-icons-extra@0.1.0-rc.4',
          '@wsagency/radix2solid-themes@0.1.0-rc.4', '@wsagency/radix2solid-charts@0.1.0-rc.4'
        ]) assert(workspace.includes(exception), `${archive}: missing exact age exception ${exception}`);
        assert.doesNotMatch(workspace, /minimumReleaseAge:|playwright|^packages:/m, `${archive}: workspace must not relax the global age gate or carry host-only entries`);
        assert.match(workspace, /^ {2}'@wsagency\/radix2solid-primitives': "0\.1\.0-rc\.4"$/m, `${archive}: Themes' Primitives dependency must resolve the published version`);
        const manifest: { dependencies: Record<string, string>; devDependencies: Record<string, string>; packageManager: string; engines: { node: string } } = JSON.parse(await readFile(resolve(project, 'package.json'), 'utf8'));
        assert.equal(manifest.packageManager, 'pnpm@11.5.0', `${archive}: package manager`);
        assert.equal(manifest.engines.node, '>=24 <25', `${archive}: Node range`);
        const products = archive.startsWith('charts-') ? ['primitives', 'icons', 'themes', 'charts']
          : archive.startsWith('icons-extra-') ? ['primitives', 'icons', 'themes', 'icons-extra'] : ['primitives', 'icons', 'themes'];
        assert.deepEqual(Object.keys(manifest.dependencies).filter(name => name.startsWith('@wsagency/')).sort(), products.map(name => `@wsagency/radix2solid-${name}`).sort(), `${archive}: unexpected dependencies`);
        for (const name of ['solid-js', '@solidjs/web']) assert.equal(manifest.dependencies[name], '2.0.0-rc.15', `${archive}: ${name} must match the RC15 tuple`);
        assert.equal(manifest.devDependencies['@solidjs/vite-plugin'], '3.0.0-next.50', `${archive}: plugin must match the RC15 tuple`);
        assert.equal(manifest.devDependencies.vite, '8.3.3', `${archive}: Vite must match the published archive tuple`);
        if (archive.includes('-tailwind')) {
          assert.equal(manifest.devDependencies.tailwindcss, '4.3.3', `${archive}: Tailwind must match the published archive tuple`);
          assert.equal(manifest.devDependencies['@tailwindcss/vite'], '4.3.3', `${archive}: Tailwind Vite plugin must match the published archive tuple`);
        }
        for (const name of products) assert.equal(manifest.dependencies[`@wsagency/radix2solid-${name}`], '0.1.0-rc.4', `${archive}: ${name} must use the exact published version`);
        assert(!(await readdir(project)).includes('vendor'), `${archive}: sandbox must not vendor package tarballs`);
        for (const file of products.flatMap(name => name === 'charts' ? ['LICENSE-charts', 'NOTICE-charts'] : [`LICENSE-${name}`])) await readFile(resolve(project, file));
        await exec('pnpm', ['install', '--no-frozen-lockfile']);
        await exec('pnpm', ['build']);
        for (const name of products) {
          const packageName = `@wsagency/radix2solid-${name}`;
          const installed = JSON.parse(await readFile(resolve(project, `node_modules/${packageName}/package.json`), 'utf8'));
          assert.equal(installed.version, '0.1.0-rc.4', `${archive}: installed ${name} version`);
        }
        // The lock must resolve all product packages by version/integrity from the configured npm registry.
        const lock = await readFile(resolve(project, 'pnpm-lock.yaml'), 'utf8');
        const resolved = new Set([...lock.matchAll(/^ {2}'?((?:@solidjs\/(?:web|signals|compiler|babel-plugin|vite-plugin))|solid-js)@([^(':\s]+)/gm)].map(match => `${match[1]}@${match[2]}`));
        assert.deepEqual([...resolved].sort(), ['@solidjs/babel-plugin@2.0.0-rc.15', '@solidjs/compiler@2.0.0-rc.15', '@solidjs/signals@2.0.0-rc.15', '@solidjs/vite-plugin@3.0.0-next.50', '@solidjs/web@2.0.0-rc.15', 'solid-js@2.0.0-rc.15'], `${archive}: incoherent Solid tuple`);
        for (const name of products) {
          const packageName = `@wsagency/radix2solid-${name}`;
          assert.match(lock, new RegExp(`^  '${packageName}@0\\.1\\.0-rc\\.4':\n    resolution: \\{integrity: sha512-[^}]+\\}`, 'm'), `${archive}: lockfile must resolve ${packageName}@0.1.0-rc.4 with integrity`);
        }
        assert.doesNotMatch(lock, /file:vendor\//, `${archive}: lockfile must not resolve local vendor tarballs`);
        const rootRequire = createRequire(resolve(project, 'package.json'));
        const themesRequire = createRequire(resolve(project, 'node_modules/@wsagency/radix2solid-themes/package.json'));
        assert.equal(await realpath(rootRequire.resolve('@wsagency/radix2solid-primitives')), await realpath(themesRequire.resolve('@wsagency/radix2solid-primitives')), `${archive}: Themes must resolve the same published Primitives package`);
        if (products.includes('charts')) {
          const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
          const chartsNotice = normalize(await readFile(resolve(project, 'NOTICE-charts'), 'utf8'));
          const d3Licenses = new Map<string, string>();
          const visitD3 = async (from: string, name: string): Promise<void> => {
            const lookup = createRequire(resolve(from, 'package.json')).resolve.paths(name) ?? [];
            let manifestPath: string | undefined;
            for (const directory of lookup) {
              try {
                manifestPath = await realpath(resolve(directory, name, 'package.json'));
                break;
              } catch {}
            }
            assert(manifestPath, `${archive}: cannot resolve installed ${name} from the published Charts package`);
            const manifest: { name: string; version: string; dependencies?: Record<string, string> } = JSON.parse(await readFile(manifestPath, 'utf8'));
            const id = `${manifest.name}@${manifest.version}`;
            if (d3Licenses.has(id)) return;
            d3Licenses.set(id, normalize(await readFile(resolve(dirname(manifestPath), 'LICENSE'), 'utf8')));
            for (const dependency of Object.keys(manifest.dependencies ?? {})) await visitD3(dirname(manifestPath), dependency);
          };
          const chartsPackage = await realpath(resolve(project, 'node_modules/@wsagency/radix2solid-charts'));
          await visitD3(chartsPackage, 'd3-scale');
          await visitD3(chartsPackage, 'd3-shape');
          for (const [id, license] of d3Licenses) assert(chartsNotice.includes(license), `${archive}: published Charts NOTICE lacks the resolved verbatim LICENSE of ${id}`);
        }
        console.log(`PASS ${archive}: isolated registry install, coherent RC15 tuple and build`);
        const family = representatives[archive];
        if (family) await checkRuntime(project, family, log);
      } catch (error) {
        await log.write(`${error instanceof Error ? error.stack : String(error)}\n`);
        failures.push(`${archive}: ${error instanceof Error ? error.message : String(error)}`);
        console.error(`FAIL ${archive}; raw log: ${resolve(logs, `${archive}.log`)}`);
      } finally { await log.close(); }
    }
  }));
} finally { await rm(scratch, { recursive: true, force: true }); }
assert.deepEqual(failures, [], `Archive consumer failures; raw logs: ${logs}`);
console.log(`${selectedArchives.length}/${archives.length} real archives independently installed and built; runtime interactions: ${selectedArchives.filter(archive => representatives[archive]).length} representative archives × 3 engines. Raw logs: ${logs}.`);
