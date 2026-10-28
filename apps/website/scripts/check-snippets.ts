import assert from 'node:assert/strict';
import { glob, mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';
// The TypeScript 7 package has no JS compiler API; this checker keeps the 5.9 API alias.
import ts from 'typescript5';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import matter from 'gray-matter';
import { highlightCode } from '../src/utils/highlight-code.ts';
import { publicArchiveFileName, publicArchivePins } from './public-rc4-archives.ts';

// Partial documentation fences inherit only real page imports and MDX components.
// Named neighbouring files are materialized from their actual documented source.
type DocumentNode = { type: string; value?: string; lang?: string | null; meta?: string | null; children?: DocumentNode[]; position?: { start: { line: number } } };
type Snippet = { file: string; path: string; line: number; code: string; original: string };
const root = resolve(import.meta.dirname, '../../..');
const site = resolve(import.meta.dirname, '..');
const cache = resolve(site, 'node_modules/.cache');
await mkdir(cache, { recursive: true });
const fixture = await mkdtemp(resolve(cache, 'native-doc-snippets-'));
try {
  const colors: { name: string; version: string; private?: boolean } = JSON.parse(await readFile(resolve(site, 'node_modules/@radix-ui/colors/package.json'), 'utf8'));
  const publicPeerVersions: Record<string, string> = {
    'solid-js': '2.0.0-rc.15',
    '@solidjs/web': '2.0.0-rc.15',
    '@solidjs/signals': '2.0.0-rc.15',
    '@solidjs/compiler': '2.0.0-rc.15',
    '@solidjs/babel-plugin': '2.0.0-rc.15',
    '@solidjs/vite-plugin': '3.0.0-next.50',
    postcss: '^8.5.9',
  };
  let highlightedFences = 0, installationCommands = 0;
  const config = ts.readConfigFile(resolve(root, 'tsconfig.json'), ts.sys.readFile);
  assert.equal(config.error, undefined);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  assert.deepEqual(parsed.errors, []);
  const options = parsed.options;
  const scopeFile = resolve(fixture, 'native-scope.ts');
  await writeFile(scopeFile, "import * as Themes from '@wsagency/radix2solid-themes'; import * as Icons from '@wsagency/radix2solid-icons'; export { Themes, Icons };\n");
  const scopeProgram = ts.createProgram([scopeFile], options);
  const checker = scopeProgram.getTypeChecker();
  const scope = scopeProgram.getSourceFile(scopeFile);
  assert(scope);
  const exports = { Themes: new Set<string>(), Icons: new Set<string>() };
  for (const statement of scope.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause?.namedBindings || !ts.isNamespaceImport(statement.importClause.namedBindings)) continue;
    const name = statement.importClause.namedBindings.name.text;
    if (name !== 'Themes' && name !== 'Icons') continue;
    const symbol = checker.getSymbolAtLocation(statement.moduleSpecifier);
    assert(symbol);
    exports[name] = new Set(checker.getExportsOfModule(symbol).map(symbol => symbol.name));
  }
  const snippets: Snippet[] = [];
  const documentComponents = new Map<string, string>();
  for await (const file of glob('src/components/*.tsx', { cwd: site })) {
    const source = resolve(site, file);
    for (const match of (await readFile(source, 'utf8')).matchAll(/export\s+(?:function|const)\s+([A-Z]\w*)/g)) documentComponents.set(match[1], source);
  }
  for await (const path of glob('**/*.mdx', { cwd: resolve(site, 'data') })) {
    const source = await readFile(resolve(site, 'data', path), 'utf8');
    for (const command of source.matchAll(/\b(?:npm install|pnpm add|yarn add|bun add)\s+([^\n'"}<]+)/g)) {
      installationCommands++;
      for (const argument of command[1].trim().split(/\s+/).filter(argument => !/^-[a-zA-Z]$/.test(argument))) {
        if (argument.endsWith('.tgz')) {
          const pin = publicArchivePins.find(candidate => basename(argument) === publicArchiveFileName(candidate));
          assert(pin, `${path}: installation tarball must match an actual published RC4 package name and version: ${argument}`);
          assert(argument.startsWith('./'), `${path}: copied tarball commands require an explicit local path`);
          continue;
        }
        const packageArgument = /^(@[^/]+\/[^@]+|[^@]+)(?:@(.+))?$/.exec(argument);
        assert(packageArgument, `${path}: malformed package argument ${argument}`);
        const published = publicArchivePins.find(pkg => pkg.name === packageArgument[1]);
        if (published) {
          assert.equal(packageArgument[2], published.version, `${path}: native registry installation must pin the published RC4 package version`);
          continue;
        }
        const peerVersion = publicPeerVersions[packageArgument[1]];
        if (peerVersion) {
          assert.equal(packageArgument[2], peerVersion, `${path}: ${packageArgument[1]} must use the exact public RC15 consumer version`);
          continue;
        }
        assert.equal(packageArgument[1], colors.name, `${path}: registry installation must name the actual published colors package`);
        assert.notEqual(colors.private, true, `${path}: colors installation requires a published package`);
        if (packageArgument[2]) assert.equal(packageArgument[2], colors.version, `${path}: pinned colors version must match the installed package`);
      }
    }
    const content = matter(source).content;
    const lineOffset = source.split('\n').length - content.split('\n').length;
    const tree = unified().use(remarkParse).use(remarkMdx).parse(content);
    const sharedImports = new Map<string, string>();
    const collectImports = (node: DocumentNode) => {
      if ((node.type === 'code' || node.type === 'mdxjsEsm') && node.value !== undefined) {
        const ast = ts.createSourceFile('imports.tsx', node.value, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        for (const statement of ast.statements) {
          if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
          const specifier = statement.moduleSpecifier.text;
          const localPageImport = node.type === 'mdxjsEsm' && specifier.startsWith('.');
          if (!(localPageImport || specifier.startsWith('@') || specifier === 'solid-js')) continue;
          const modulePath = JSON.stringify(localPageImport ? resolve(dirname(resolve(site, 'data', path)), specifier) : specifier);
          const clause = statement.importClause;
          if (clause?.name) sharedImports.set(clause.name.text, `import ${clause.isTypeOnly ? 'type ' : ''}${clause.name.text} from ${modulePath};`);
          if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
            for (const binding of clause.namedBindings.elements) sharedImports.set(binding.name.text, `import { ${binding.isTypeOnly ? 'type ' : ''}${binding.propertyName ? `${binding.propertyName.text} as ` : ''}${binding.name.text} } from ${modulePath};`);
          } else if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
            sharedImports.set(clause.namedBindings.name.text, `import * as ${clause.namedBindings.name.text} from ${modulePath};`);
          }
        }
      }
      node.children?.forEach(collectImports);
    };
    collectImports(tree);
    const visit = (node: DocumentNode) => {
      if (node.type === 'code' && node.value !== undefined) {
        const lines = /\bline=(?:"([^"]*)"|([^\s]+))/.exec(node.meta ?? '')?.slice(1).find(Boolean);
        highlightCode(node.value, node.lang ?? 'text', lines);
        highlightedFences++;
      }
      if (node.type === 'code' && node.value !== undefined && /^(jsx|tsx|js|javascript|typescript|ts)$/.test(node.lang ?? '')) {
        let code = node.value.replace(/__(.*?)__/gs, '$1').trim();
        const ast = ts.createSourceFile('snippet.tsx', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        const declared = new Set<string>();
        const identifiers = new Set<string>();
        const collect = (node: ts.Node) => {
          if (ts.isIdentifier(node) && !((ts.isJsxAttribute(node.parent) || ts.isPropertyAccessExpression(node.parent) || ts.isPropertyAssignment(node.parent)) && node.parent.name === node)) identifiers.add(node.text);
          if (ts.isImportClause(node) && node.name) declared.add(node.name.text);
          if (ts.isImportSpecifier(node) || ts.isNamespaceImport(node)) declared.add(node.name.text);
          if ((ts.isVariableDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && node.name && ts.isIdentifier(node.name)) declared.add(node.name.text);
          ts.forEachChild(node, collect);
        };
        collect(ast);
        const inherited = [...identifiers].filter(name => sharedImports.has(name) && !declared.has(name));
        const themes = [...identifiers].filter(name => exports.Themes.has(name) && !declared.has(name) && !sharedImports.has(name));
        const icons = [...identifiers].filter(name => exports.Icons.has(name) && !declared.has(name) && !sharedImports.has(name));
        const components = [...identifiers].filter(name => documentComponents.has(name) && !declared.has(name) && !sharedImports.has(name) && !themes.includes(name) && !icons.includes(name));
        const imports = [themes.length ? `import { ${themes.join(', ')} } from '@wsagency/radix2solid-themes';` : '', icons.length ? `import { ${icons.join(', ')} } from '@wsagency/radix2solid-icons';` : '', ...inherited.map(name => sharedImports.get(name)), ...components.map(name => `import { ${name} } from ${JSON.stringify(documentComponents.get(name))};`)].filter(Boolean).join('\n');
        if (code.startsWith('<')) code = `export default () => (${code.replace(/;$/, '')});`;
        else if (code.startsWith('() =>')) code = `export default ${code}`;
        assert(node.position);
        const line = node.position.start.line + lineOffset;
        const file = resolve(fixture, path.replace(/\.mdx$/, ''), `fence-${line}.tsx`);
        snippets.push({ file, path, line, code: `${imports}\n${code}\nexport {};\n`, original: node.value });
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  }
  for (const snippet of snippets) {
    await mkdir(dirname(snippet.file), { recursive: true });
    await writeFile(snippet.file, snippet.code);
  }
  const helpers: Snippet[] = [];
  for (const snippet of snippets) {
    const name = snippet.original.match(/\/\/\s*((?:your-|my-)[\w-]+\.[jt]sx?)/)?.[1];
    if (!name) continue;
    const file = resolve(dirname(snippet.file), name.replace(/\.[jt]sx?$/, '.tsx'));
    await writeFile(file, snippet.code);
    helpers.push({ ...snippet, file });
  }
  const program = ts.createProgram([scopeFile, ...snippets.map(snippet => snippet.file), ...helpers.map(snippet => snippet.file)], options);
  const byFile = new Map([...snippets, ...helpers].map(snippet => [snippet.file, snippet]));
  const diagnostics = ts.getPreEmitDiagnostics(program).map(diagnostic => {
    const snippet = diagnostic.file && byFile.get(diagnostic.file.fileName);
    const location = diagnostic.file && diagnostic.start !== undefined ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start) : undefined;
    return `${snippet?.path ?? diagnostic.file?.fileName ?? 'compiler'}${snippet ? ` fence:${snippet.line}` : ''}${location ? ` generated:${location.line + 1}` : ''} TS${diagnostic.code}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`;
  });
  assert.deepEqual(diagnostics, [], 'Documented native code must compile against actual packages and neighbouring examples');
  console.log(`Documentation snippets passed: ${snippets.length} native fences in ${new Set(snippets.map(snippet => snippet.path)).size} documents, ${highlightedFences} rendered fences with checked annotations, ${installationCommands} installation commands matched to actual package metadata, and real named example files.`);
} finally { await rm(fixture, { recursive: true, force: true }); }
