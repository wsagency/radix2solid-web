import { cp, glob, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';

const site = resolve(import.meta.dirname, '..');
const root = resolve(site, '../..');
const library = resolve(root, '.library');
const staging = resolve(site, 'dist/sandboxes');
const packageOutput = resolve(staging, 'packages');
const output = resolve(site, 'out/sandboxes');
const packageDownloads = resolve(site, 'out/packages');
await rm(staging, { recursive: true, force: true });
await mkdir(packageOutput, { recursive: true });
await mkdir(output, { recursive: true });
await mkdir(packageDownloads, { recursive: true });
function run(command: string, args: string[], cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited ${result.status}`);
}
type PackageManifest = { name: string; version: string };
const sourcePin: { commit: string } = JSON.parse(await readFile(resolve(root, 'library-source.json'), 'utf8'));
if (!/^[0-9a-f]{40}$/.test(sourcePin.commit)) throw new Error('Sandboxes require the full pinned library source commit.');
const packageNames = ['primitives', 'icons', 'icons-extra', 'themes', 'charts'];
const manifests = new Map<string, PackageManifest>();
for (const name of packageNames) {
  const manifest: PackageManifest = JSON.parse(await readFile(resolve(library, `packages/${name}/package.json`), 'utf8'));
  if (manifest.version !== '0.1.0-rc.4') throw new Error(`${manifest.name} must match the published 0.1.0-rc.4 package.`);
  manifests.set(name, manifest);
}
const tarballName = (manifest: PackageManifest) => `${manifest.name.slice(1).replace('/', '-')}-${manifest.version}.tgz`;
for (const name of packageNames) {
  const manifest = manifests.get(name)!;
  const archive = tarballName(manifest);
  run('pnpm', ['--dir', resolve(library, `packages/${name}`), 'pack', '--pack-destination', packageOutput]);
  await cp(resolve(packageOutput, archive), resolve(packageDownloads, archive));
}
const primitivesManifest = manifests.get('primitives')!;
const themesManifest = manifests.get('themes')!;
const nativeFamilies = ['calendar', 'date-picker', 'file-drop'] as const;
const packedFiles = (archive: string) => {
  const result = spawnSync('tar', ['-tzf', resolve(packageOutput, archive)], { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Could not inspect packed archive ${archive}.`);
  return new Set(result.stdout.split('\n'));
};
const primitiveFiles = packedFiles(tarballName(primitivesManifest));
const themesFiles = packedFiles(tarballName(themesManifest));
for (const family of nativeFamilies) {
  if (!primitiveFiles.has(`package/dist/types/${family}/index.d.ts`) || !themesFiles.has(`package/dist/types/components/${family}.d.ts`)) {
    throw new Error(`Pinned source ${sourcePin.commit} does not contain packed Primitives and Themes ${family} APIs; refusing native archive generation.`);
  }
}
const chartsManifest = manifests.get('charts')!;
const extraManifest = manifests.get('icons-extra')!;
const dependencies: Record<string, string> = {
  'solid-js': '2.0.0-rc.15',
  '@solidjs/web': '2.0.0-rc.15',
  '@radix-ui/colors': '3.0.0',
  [primitivesManifest.name]: primitivesManifest.version,
  [manifests.get('icons')!.name]: manifests.get('icons')!.version,
  [manifests.get('themes')!.name]: manifests.get('themes')!.version
};
await cp(resolve(library, 'packages/icons-extra/icons'), resolve(site, 'out/icons-extra'), { recursive: true });
// The sandbox keeps the exact Solid RC15 overrides, exact package versions and exact age exceptions.
// Host-only workspace globs and Playwright exceptions are removed.
const workspace = (await readFile(resolve(root, 'pnpm-workspace.yaml'), 'utf8'))
  .replace(/^packages:\n(?: {2}- .*\n)+\n/m, '')
  .replace(/^ {2}- '?(?:@playwright\/test|playwright|playwright-core)@.*\n/gm, '')
  .replace('overrides:\n', `overrides:\n  '@wsagency/radix2solid-primitives': ${JSON.stringify(primitivesManifest.version)}\n`)
  .replace('minimumReleaseAgeExclude:\n', `minimumReleaseAgeExclude:\n${packageNames.map(name => `  - '${manifests.get(name)!.name}@${manifests.get(name)!.version}'\n`).join('')}`);
const globalCss = 'body{margin:0;font-family:system-ui}.radix-themes{min-height:100vh;display:grid;place-items:center;background:linear-gradient(140deg,var(--violet-9),var(--purple-9))}';
let count = 0;
for await (const entry of glob('*/index.tsx', { cwd: resolve(site, 'src/demos') })) {
  const name = dirname(entry);
  for (const solution of ['css-modules', 'css', 'tailwind']) {
    const source = resolve(site, `src/demos/${name}${solution === 'css-modules' ? '' : `/${solution}`}`);
    try { await readFile(resolve(source, 'index.tsx')); } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT' && name === 'getting-started' && solution === 'tailwind') continue;
      throw error;
    }
    const project = resolve(staging, `${name}-${solution}`);
    await mkdir(project, { recursive: true });
    for await (const file of glob('*.{tsx,css,cjs}', { cwd: source })) {
      let content = await readFile(resolve(source, file), 'utf8');
      if (solution === 'tailwind' && file === 'styles.css') content = content.replace('./index.tsx', './demo.tsx');
      await writeFile(resolve(project, file === 'index.tsx' ? 'demo.tsx' : basename(file)), content);
    }
    const projectDependencies = name === 'charts' ? { ...dependencies, [chartsManifest.name]: chartsManifest.version }
      : name === 'icons-extra' ? { ...dependencies, [extraManifest.name]: extraManifest.version } : dependencies;
    await writeFile(resolve(project, 'package.json'), JSON.stringify({ name: `radix-solid-${name}-${solution}-demo`, private: true, type: 'module', packageManager: 'pnpm@11.5.0', engines: { node: '>=24 <25' }, scripts: { dev: 'vite', build: 'vite build' }, dependencies: projectDependencies, devDependencies: { '@solidjs/vite-plugin': '3.0.0-next.50', vite: '8.3.3', ...(solution === 'tailwind' ? { tailwindcss: '4.3.3', '@tailwindcss/vite': '4.3.3' } : {}) } }, null, 2));
    await writeFile(resolve(project, 'pnpm-workspace.yaml'), workspace);
    await writeFile(resolve(project, 'vite.config.ts'), `import { defineConfig } from 'vite';\nimport solid from '@solidjs/vite-plugin';\n${solution === 'tailwind' ? "import tailwindcss from '@tailwindcss/vite';\n" : ''}export default defineConfig({ plugins: [solid()${solution === 'tailwind' ? ', tailwindcss()' : ''}], resolve: { dedupe: ['solid-js', '@solidjs/web', '@solidjs/signals'] } });\n`);
    await writeFile(resolve(project, 'entry.tsx'), `import { render } from '@solidjs/web';\nimport { Theme } from '@wsagency/radix2solid-themes';\nimport '@wsagency/radix2solid-themes/styles.css';\n${solution === 'tailwind' ? "import './styles.css';\n" : ''}import Demo from './demo.tsx';\nimport './global.css';\nrender(() => <Theme accentColor="indigo"><Demo /></Theme>, document.getElementById('root')!);\n`);
    await writeFile(resolve(project, 'index.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Radix2Solid demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/entry.tsx"></script>
  </body>
</html>
`);
    await writeFile(resolve(project, 'global.css'), globalCss);
    for (const name of ['primitives', 'icons', 'themes']) await cp(resolve(library, `packages/${name}/LICENSE`), resolve(project, `LICENSE-${name}`));
    if (name === 'charts') for (const file of ['LICENSE', 'NOTICE']) await cp(resolve(library, `packages/charts/${file}`), resolve(project, `${file}-charts`));
    if (name === 'icons-extra') await cp(resolve(library, 'packages/icons-extra/LICENSE'), resolve(project, 'LICENSE-icons-extra'));
    run('tar', ['-czf', resolve(output, `${name}-${solution}.tar.gz`), '-C', project, '.']);
    count++;
  }
}
console.log(`Built ${count} runnable native sandboxes with exact npm packages and pinned Solid 2.`);
