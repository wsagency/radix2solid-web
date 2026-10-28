import { glob, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  copyPublicArchiveDownload,
  publicArchivePins,
  publicSandboxAgeExceptions,
  publicSandboxVersions,
  readCachedPublicArchive,
  readPublicArchiveMember,
  type VerifiedPublicArchive,
} from './public-rc4-archives.ts';

const site = resolve(import.meta.dirname, '..');
const root = resolve(site, '../..');
const staging = resolve(site, 'dist/sandboxes');
const output = resolve(site, 'out/sandboxes');
const packageDownloads = resolve(site, 'out/packages');
await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
function run(command: string, args: string[], cwd = root) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited ${result.status}`);
}
const packageNames = ['primitives', 'icons', 'icons-extra', 'themes', 'charts'];
const packagePins = new Map(publicArchivePins.map(pin => [pin.name.replace('@wsagency/radix2solid-', ''), pin]));
const publicArchives = new Map<string, VerifiedPublicArchive>();
for (const name of packageNames) {
  const pin = packagePins.get(name);
  if (!pin) throw new Error(`Missing pinned public RC4 archive for ${name}.`);
  publicArchives.set(name, await readCachedPublicArchive(pin));
}
const archiveFor = (name: string) => {
  const archive = publicArchives.get(name);
  if (!archive) throw new Error(`Missing verified public RC4 archive for ${name}.`);
  return archive;
};
const primitivesArchive = archiveFor('primitives');
const themesArchive = archiveFor('themes');
const iconsArchive = archiveFor('icons');
const chartsArchive = archiveFor('charts');
const extraArchive = archiveFor('icons-extra');
const nativeFamilies = ['calendar', 'date-picker', 'file-drop'] as const;
for (const family of nativeFamilies) {
  if (!primitivesArchive.members.has(`package/dist/types/${family}/index.d.ts`)
    || !themesArchive.members.has(`package/dist/types/components/${family}.d.ts`)) {
    throw new Error(`Published RC4 Primitives and Themes archives lack the ${family} API; refusing native archive generation.`);
  }
}
for (const archive of publicArchives.values()) await copyPublicArchiveDownload(archive, packageDownloads);
const packageName = (name: string) => archiveFor(name).pin.name;
const packageVersion = (name: string) => archiveFor(name).pin.version;
const dependencies: Record<string, string> = {
  'solid-js': publicSandboxVersions.solid,
  '@solidjs/web': publicSandboxVersions.solid,
  '@radix-ui/colors': publicSandboxVersions.colors,
  [packageName('primitives')]: packageVersion('primitives'),
  [packageName('icons')]: packageVersion('icons'),
  [packageName('themes')]: packageVersion('themes'),
};
const publicFiles = new Map<string, Buffer>([
  ['primitives/LICENSE', readPublicArchiveMember(primitivesArchive, 'package/LICENSE')],
  ['icons/LICENSE', readPublicArchiveMember(iconsArchive, 'package/LICENSE')],
  ['themes/LICENSE', readPublicArchiveMember(themesArchive, 'package/LICENSE')],
  ['charts/LICENSE', readPublicArchiveMember(chartsArchive, 'package/LICENSE')],
  ['charts/NOTICE', readPublicArchiveMember(chartsArchive, 'package/NOTICE')],
  ['icons-extra/LICENSE', readPublicArchiveMember(extraArchive, 'package/LICENSE')],
]);
await mkdir(output, { recursive: true });
await mkdir(resolve(site, 'out/icons-extra'), { recursive: true });
await writeFile(resolve(site, 'out/icons-extra/folder.svg'), readPublicArchiveMember(extraArchive, 'package/icons/folder.svg'));
await writeFile(resolve(site, 'out/icons-extra/folder-open.svg'), readPublicArchiveMember(extraArchive, 'package/icons/folder-open.svg'));
const workspace = [
  'managePackageManagerVersions: false',
  'strictPeerDependencies: true',
  '',
  'overrides:',
  `  solid-js: ${publicSandboxVersions.solid}`,
  `  '@solidjs/web': ${publicSandboxVersions.solid}`,
  `  '@solidjs/signals': ${publicSandboxVersions.solid}`,
  `  '@solidjs/compiler': ${publicSandboxVersions.solid}`,
  `  '@solidjs/babel-plugin': ${publicSandboxVersions.solid}`,
  `  '@wsagency/radix2solid-primitives': \"${packageVersion('primitives')}\"`,
  '',
  'minimumReleaseAgeExclude:',
  ...publicSandboxAgeExceptions.map(exception => `  - '${exception}'`),
].join('\n') + '\n';
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
    const projectDependencies = name === 'charts' ? { ...dependencies, [packageName('charts')]: packageVersion('charts') }
      : name === 'icons-extra' ? { ...dependencies, [packageName('icons-extra')]: packageVersion('icons-extra') } : dependencies;
    const projectManifest = {
      name: `radix-solid-${name}-${solution}-demo`,
      private: true,
      type: 'module',
      packageManager: publicSandboxVersions.packageManager,
      engines: { node: publicSandboxVersions.nodeRange },
      scripts: { dev: 'vite', build: 'vite build' },
      dependencies: projectDependencies,
      devDependencies: {
        '@solidjs/vite-plugin': publicSandboxVersions.plugin,
        vite: publicSandboxVersions.vite,
        ...(solution === 'tailwind' ? { tailwindcss: publicSandboxVersions.tailwind, '@tailwindcss/vite': publicSandboxVersions.tailwind } : {}),
      },
    };
    await writeFile(resolve(project, 'package.json'), JSON.stringify(projectManifest, null, 2));
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
    for (const packageName of ['primitives', 'icons', 'themes']) await writeFile(resolve(project, `LICENSE-${packageName}`), publicFiles.get(`${packageName}/LICENSE`)!);
    if (name === 'charts') for (const file of ['LICENSE', 'NOTICE']) await writeFile(resolve(project, `${file}-charts`), publicFiles.get(`charts/${file}`)!);
    if (name === 'icons-extra') await writeFile(resolve(project, 'LICENSE-icons-extra'), publicFiles.get('icons-extra/LICENSE')!);
    run('tar', ['-czf', resolve(output, `${name}-${solution}.tar.gz`), '-C', project, '.']);
    count++;
  }
}
console.log(`Built ${count} runnable native sandboxes with exact npm packages and pinned Solid 2.`);
