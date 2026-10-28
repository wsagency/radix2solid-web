import { createHash } from 'node:crypto';
import { existsSync, globSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { selectAll } from 'hast-util-select';
import { resolveRedirect } from '../worker/redirects.ts';
import type { SearchRecord } from './build-search-index.ts';
import {
  publicArchiveFileName,
  publicArchivePins,
  publicChartsD3Packages,
  readPublicArchiveMember,
  verifyPublicArchive,
  type VerifiedPublicArchive,
} from './public-rc4-archives.ts';

const output = resolve(import.meta.dirname, '../out');
const { routePaths } = await import(new URL('../dist/server/entry-server.js', import.meta.url).href) as typeof import('../src/entry-server.js');
const pageFile = (path: string) => `${path.replace(/^\//, '').replace(/\/+$/, '') || 'index'}.html`;
const expected = new Set([...routePaths, '/404'].map(pageFile));
const files = globSync('**/*.html', { cwd: output });
const errors = new Set<string>();
const ids = new Map<string, Set<string>>();
const coverage: { website: { documents: string[]; demos: string[]; routes: string[] }; upstreamRoutes: string[]; nativeRoutes: string[]; sandboxes: string[] } =
  JSON.parse(readFileSync(resolve(import.meta.dirname, '../coverage-manifest.json'), 'utf8'));
const actualDocuments = globSync('**/*.mdx', { cwd: resolve(import.meta.dirname, '../data') });
const actualDemos = globSync('**/*.{tsx,css,cjs}', { cwd: resolve(import.meta.dirname, '../src/demos') });
const archives = new Set(globSync('*.tar.gz', { cwd: resolve(output, 'sandboxes') }));
for (const name of coverage.sandboxes) if (!archives.has(name)) errors.add(`missing normative sandbox: ${name}`);
for (const name of archives) if (!coverage.sandboxes.includes(name)) errors.add(`unmapped sandbox: ${name}`);
for (const [kind, actual, required] of [
  ['route', routePaths, coverage.website.routes],
  ['document', actualDocuments, coverage.website.documents],
  ['demo source', actualDemos, coverage.website.demos],
] as const) {
  const actualPaths = new Set(actual), requiredPaths = new Set(required);
  for (const path of requiredPaths) if (!actualPaths.has(path)) errors.add(`missing normative ${kind}: ${path}`);
  for (const path of actualPaths) if (!requiredPaths.has(path)) errors.add(`unmapped ${kind}: ${path}`);
}
// Original routes were independently observed at the committed provenance in coverage-manifest.json.
// Native-only additions (Charts, Themes recipes) are declared separately and never claimed as upstream.
const upstreamRoutes = new Set(coverage.upstreamRoutes), nativeRoutes = new Set(coverage.nativeRoutes);
for (const path of upstreamRoutes) if (!routePaths.includes(path)) errors.add(`missing upstream route: ${path}`);
for (const path of nativeRoutes) if (upstreamRoutes.has(path) || !routePaths.includes(path)) errors.add(`invalid native route: ${path}`);
for (const path of routePaths) if (!upstreamRoutes.has(path) && !nativeRoutes.has(path)) errors.add(`unexpected native route: ${path}`);
const markdownFiles = new Set([...expected].filter(file => file !== '404.html').map(file => file.replace(/\.html$/, '.md')));
// Public download names and bytes are pinned to the five published RC4 registry archives.
const packageFiles = publicArchivePins.map(pin => `packages/${publicArchiveFileName(pin)}`);
const publicFiles = new Set(['_headers', 'search-index.json', 'NOTICE.txt', 'WEBSITE-LICENSE.txt', 'favicon.png', 'favicon-black.svg', 'favicon-white.svg', 'icons-extra/folder.svg', 'icons-extra/folder-open.svg', ...packageFiles]);
const verifiedPackages = new Map<string, VerifiedPublicArchive>();
for (const pin of publicArchivePins) {
  const file = `packages/${publicArchiveFileName(pin)}`;
  const path = resolve(output, file);
  if (!existsSync(path)) {
    errors.add(`missing package download: out/${file}`);
    continue;
  }
  try {
    await verifyPublicArchive(path, pin).then(archive => verifiedPackages.set(pin.name.replace('@wsagency/radix2solid-', ''), archive));
  } catch {
    errors.add(`invalid public RC4 package download: out/${file}`);
  }
}
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
const notice = normalize(readFileSync(resolve(output, 'NOTICE.txt'), 'utf8'));
const chartsArchive = verifiedPackages.get('charts');
const chartsLicenseFiles = chartsArchive
  ? [...chartsArchive.members].filter(member => /^package\/(?:LICEN[CS]E|NOTICE)[^/]*$/i.test(member))
    .map(member => normalize(readPublicArchiveMember(chartsArchive, member).toString('utf8')))
  : [];
const chartsLicense = chartsLicenseFiles.join(' ');
if (!/Copyright \(c\) 2026 Thomas Guehenneux/.test(chartsLicense) || !/Copyright \(c\) 2015-present recharts/.test(chartsLicense)) errors.add('packed Charts LICENSE lost the solid-recharts or Recharts MIT notice');
// The site bundles Charts, so NOTICE.txt reproduces every headed section from the exact published RC4 archive.
for (const section of chartsLicenseFiles.flatMap(file => file.split(/--- .+? ---/).slice(1)).map(part => part.trim()).filter(Boolean)) {
  if (!notice.includes(section)) errors.add(`NOTICE.txt lacks packed Charts license text: ${section.slice(0, 60)}…`);
}
const chartsMit = chartsLicenseFiles.find(text => text.includes('Thomas Guehenneux'))?.split(/--- .+? ---/)[0].trim();
if (chartsMit && !notice.includes(chartsMit)) errors.add('NOTICE.txt lacks the packed Charts MIT LICENSE');
const chartsNotice = chartsArchive?.members.has('package/NOTICE')
  ? readPublicArchiveMember(chartsArchive, 'package/NOTICE').toString('utf8') : '';
const chartsD3Packages = [...chartsNotice.matchAll(/^--- ([\w-]+@[\d.]+) \(ISC,/gm)].map(match => match[1]).sort();
if (JSON.stringify(chartsD3Packages) !== JSON.stringify([...publicChartsD3Packages].sort())) {
  errors.add('packed Charts NOTICE differs from the pinned RC4 D3 license closure');
}
const extraArchive = verifiedPackages.get('icons-extra');
if (extraArchive) {
  const extraLicense = normalize(readPublicArchiveMember(extraArchive, 'package/LICENSE').toString('utf8'));
  if (!notice.includes(extraLicense)) errors.add('NOTICE.txt lacks the packed Extra icons LICENSE');
  for (const asset of ['folder', 'folder-open']) {
    const svg = readFileSync(resolve(output, `icons-extra/${asset}.svg`), 'utf8');
    if (!svg.includes('viewBox=\"0 0 24 24\"')) errors.add(`Extra icon ${asset} lost its native viewBox`);
    if (svg !== readPublicArchiveMember(extraArchive, `package/icons/${asset}.svg`).toString('utf8')) errors.add(`Extra icon ${asset} download differs from its package`);
  }
}
// Every package whose code reaches the client chunks (written by the runtime-graph Vite plugin) has a
// `--- <id> ` section in NOTICE.txt carrying its own license file verbatim. solid-js and @solidjs/web 2.0.0-rc.19
// publish no license file; their sections reproduce the solidjs/solid LICENSE at the Solid RC19 gitHead
// d2323b077c7dda32ebced7843c2ce2b788a91e8d, verified against that file's SHA-256.
const unlicensedPackages = new Map(['solid-js@2.0.0-rc.19', '@solidjs/web@2.0.0-rc.19'].map(id => [id, '59a76ed2f4a3ebe8d20a58869ef9c09420f796aa179420c8fb916f5557defc9b']));
const rawNotice = readFileSync(resolve(output, 'NOTICE.txt'), 'utf8');
const runtimeGraph: Record<string, string> = JSON.parse(readFileSync(resolve(import.meta.dirname, '../dist/client/.vite/runtime-graph.json'), 'utf8'));
for (const [id, root] of Object.entries(runtimeGraph)) {
  const licenseFile = readdirSync(root).find(file => /^(?:licen[cs]e|copying)(?:\.(?:md|txt))?$/i.test(file));
  // Licensed packages need their header and whole license text (the Charts LICENSE embeds its own `--- Recharts
  // reference source ---` heading, so containment, not section equality). Without a license file a package fails
  // unless it is pinned above and its section hashes to that upstream file.
  const section = rawNotice.split(`\n--- ${id} (`)[1]?.split('\n--- ')[0]?.replace(/^[^\n]*\n/, '').trim();
  const verbatim = licenseFile ? section !== undefined && notice.includes(normalize(readFileSync(resolve(root, licenseFile), 'utf8')))
    : section !== undefined && createHash('sha256').update(`${section}\n`).digest('hex') === unlicensedPackages.get(id);
  if (!verbatim) errors.add(`NOTICE.txt lacks the verbatim license of bundled ${id}`);
}
const assetDirectories = new Set(['assets', 'fonts', 'icons', 'social', 'marketing', 'sandboxes']);
for (const file of readdirSync(output, { recursive: true }) as string[]) {
  if (statSync(resolve(output, file)).isFile() && !expected.has(file) && !markdownFiles.has(file) && !publicFiles.has(file) && !assetDirectories.has(file.split('/')[0])) errors.add(`unregistered public artifact: out/${file}`);
  if (file.split('/').some(segment => segment.startsWith('.')) || /(?:^|\/)runtime-graph\.json$|\.map$/.test(file)) errors.add(`private build artifact: out/${file}`);
  if (/\.(?:html|md|json|js|css|txt)$/.test(file) && statSync(resolve(output, file)).isFile() && /\/(?:home|Users)\/[^/\s]+\/|file:\/\/\/|[A-Z]:\\Users\\/.test(readFileSync(resolve(output, file), 'utf8'))) errors.add(`local filesystem path: out/${file}`);
}
const fontManifest: { license: { file: string; sha256: string }; fonts: { file: string; sha256: string }[] } =
  JSON.parse(readFileSync(resolve(import.meta.dirname, '../public/fonts/manifest.json'), 'utf8'));
const fontFiles = new Set(fontManifest.fonts.map(font => font.file));
for (const directory of [resolve(import.meta.dirname, '../public/fonts'), resolve(output, 'fonts')]) {
  for (const file of globSync('**/*.{woff,woff2,ttf,otf}', { cwd: directory })) {
    if (!fontFiles.has(file)) errors.add(`unlicensed font asset: ${directory}/${file}`);
  }
  for (const asset of [...fontManifest.fonts, fontManifest.license]) {
    const path = resolve(directory, asset.file);
    if (!existsSync(path)) { errors.add(`missing licensed font asset: ${path}`); continue; }
    const bytes = readFileSync(path);
    if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256) errors.add(`font provenance mismatch: ${path}`);
    if (fontFiles.has(asset.file) && bytes.toString('ascii', 0, 4) !== 'wOF2') errors.add(`invalid WOFF2 asset: ${path}`);
  }
  if (!existsSync(resolve(directory, 'manifest.json'))) errors.add(`missing font provenance manifest: ${directory}`);
}
const links: { source: string; url: string }[] = [];
const parser = unified().use(rehypeParse);
const origin = 'https://export.invalid';

for (const file of [...expected, '_headers', 'search-index.json']) {
  if (!existsSync(resolve(output, file))) errors.add(`missing out/${file}`);
}
if (existsSync(resolve(output, '_redirects'))) errors.add('out/_redirects exists; redirects belong in worker/redirects.ts');
if (existsSync(resolve(output, '_headers')) && /noindex/i.test(readFileSync(resolve(output, '_headers'), 'utf8'))) errors.add('out/_headers sends noindex');
for (const file of files) {
  if (!expected.has(file)) errors.add(`unregistered page out/${file}`);
  if (file !== '404.html' && !existsSync(resolve(output, file.replace(/\.html$/, '.md')))) errors.add(`missing Markdown twin out/${file}`);
  const tree = parser.parse(readFileSync(resolve(output, file), 'utf8'));
  ids.set(file, new Set(selectAll('[id]', tree).map(node => String(node.properties.id))));
  if (selectAll('meta[name="robots"]', tree).some(meta => /noindex/i.test(String(meta.properties.content)))) errors.add(`${file}: page is noindex`);
  for (const node of selectAll('[href], [src]', tree)) {
    for (const property of ['href', 'src']) {
      const url = node.properties[property];
      if (typeof url === 'string') links.push({ source: file, url });
    }
  }
}
if (existsSync(resolve(output, 'search-index.json'))) {
  const records: SearchRecord[] = JSON.parse(readFileSync(resolve(output, 'search-index.json'), 'utf8'));
  for (const record of records) links.push({ source: `search-index.json:${record.objectID}`, url: record.url });
}
for (const { source, url: value } of links) {
  try {
    const sourcePath = source.split(':')[0];
    let url = new URL(value, new URL(sourcePath === 'index.html' ? '' : sourcePath.replace(/\.html$/, ''), `${origin}/`));
    if (/google-analytics\.com|googletagmanager\.com|plausible\.io|vercel-scripts\.com|vercel\.live/.test(url.hostname)) {
      errors.add(`${source}: upstream analytics/preview dependency ${value}`);
    }
    if (url.origin !== origin) continue;
    const visited = new Set<string>();
    for (;;) {
      if (visited.has(url.pathname)) throw new Error('redirect loop');
      visited.add(url.pathname);
      const redirect = resolveRedirect(url);
      if (!redirect) break;
      const hash = url.hash;
      url = new URL(redirect.location, url);
      url.hash ||= hash;
    }
    const path = decodeURIComponent(url.pathname).replace(/^\//, '');
    const candidate = pageFile(`/${path}`);
    const file = expected.has(candidate) ? candidate : path;
    const target = resolve(output, file);
    if (!target.startsWith(`${output}/`) || !existsSync(target) || !statSync(target).isFile()) {
      errors.add(`${source}: missing target ${value} (out/${file})`);
    } else if (url.hash && !url.hash.startsWith('#:~:text=') && ids.has(file) && !ids.get(file)!.has(decodeURIComponent(url.hash.slice(1)))) {
      errors.add(`${source}: missing anchor ${value} (out/${file})`);
    }
  } catch (error) {
    errors.add(`${source}: invalid URL ${value}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
if (errors.size) {
  console.error('Static export check failed:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Static export check passed (${routePaths.length} registered routes + 404, ${links.length} page/asset/search references, Markdown twins and indexable pages).`);
}
