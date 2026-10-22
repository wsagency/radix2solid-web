import { createSignal, onSettled } from 'solid-js';
import { Badge, Button, Dialog } from '@wsagency/radix2solid-themes';
import { routes } from '../routes.js';

const order: Record<string, Record<string, string[]>> = {
  primitives: {
    Overview: ['overview/introduction', 'overview/getting-started', 'overview/accessibility', 'overview/releases'],
    Guides: ['guides/styling', 'guides/animation', 'guides/composition', 'guides/server-side-rendering'],
    Components: ['components/accordion', 'components/alert-dialog', 'components/aspect-ratio', 'components/avatar', 'components/calendar', 'components/checkbox', 'components/collapsible', 'components/combobox', 'components/command', 'components/context-menu', 'components/date-picker', 'components/dialog', 'components/dropdown-menu', 'components/file-drop', 'components/form', 'components/hover-card', 'components/label', 'components/menubar', 'components/navigation-menu', 'components/one-time-password-field', 'components/password-toggle-field', 'components/popover', 'components/progress', 'components/radio-group', 'components/scroll-area', 'components/select', 'components/separator', 'components/slider', 'components/splitter', 'components/switch', 'components/tabs', 'components/toast', 'components/toggle', 'components/toggle-group', 'components/toolbar', 'components/tooltip', 'components/tree'],
    Utilities: ['utilities/accessible-icon', 'utilities/direction-provider', 'utilities/portal', 'utilities/slot', 'utilities/visually-hidden'],
  },
  themes: {
    Overview: ['overview/getting-started', 'overview/styling', 'overview/layout', 'overview/releases', 'overview/resources'],
    Theme: ['theme/overview', 'theme/color', 'theme/dark-mode', 'theme/typography', 'theme/spacing', 'theme/breakpoints', 'theme/radius', 'theme/shadows', 'theme/cursors'],
    Layout: ['components/box', 'components/flex', 'components/grid', 'components/container', 'components/section'],
    Typography: ['components/text', 'components/heading', 'components/blockquote', 'components/code', 'components/em', 'components/kbd', 'components/link', 'components/quote', 'components/strong'],
    Components: ['components/alert-dialog', 'components/aspect-ratio', 'components/avatar', 'components/badge', 'components/button', 'components/calendar', 'components/callout', 'components/card', 'components/checkbox', 'components/checkbox-group', 'components/checkbox-cards', 'components/context-menu', 'components/data-list', 'components/date-picker', 'components/dialog', 'components/dropdown-menu', 'components/file-drop', 'components/hover-card', 'components/icon-button', 'components/inset', 'components/popover', 'components/progress', 'components/radio', 'components/radio-group', 'components/radio-cards', 'components/scroll-area', 'components/segmented-control', 'components/select', 'components/separator', 'components/skeleton', 'components/slider', 'components/spinner', 'components/switch', 'components/table', 'components/tabs', 'components/tab-nav', 'components/text-area', 'components/text-field', 'components/tooltip'],
    Utilities: ['components/accessible-icon', 'components/portal', 'components/reset', 'components/slot', 'components/theme', 'components/visually-hidden'],
    Recipes: ['recipes/accordion', 'recipes/collapsible', 'recipes/combobox', 'recipes/command', 'recipes/splitter', 'recipes/toast', 'recipes/toggle-group', 'recipes/toolbar', 'recipes/tree', 'recipes/profile-menu'],
  },
  colors: {
    Overview: ['overview/installation', 'overview/usage', 'overview/aliasing', 'overview/custom-palettes', 'overview/releases'],
    'Palette composition': ['palette-composition/scales', 'palette-composition/composing-a-palette', 'palette-composition/understanding-the-scale'],
  },
  charts: {
    Overview: ['overview/introduction', 'overview/getting-started', 'overview/releases'],
    Guides: ['guides/responsive-and-ssr', 'guides/migrating-from-recharts'],
    Charts: ['components/line-chart', 'components/area-chart', 'components/bar-chart', 'components/composed-chart', 'components/scatter-chart', 'components/pie-chart', 'components/radar-chart', 'components/radial-bar-chart', 'components/funnel-chart', 'components/treemap', 'components/sankey', 'components/sunburst-chart'],
  },
};
const curated = Object.fromEntries(Object.entries(order).map(([family, groups]) => [family, Object.entries(groups).map(([label, slugs]) => ({ label, pages: slugs.map(slug => { const path = `/${family}/docs/${slug}`; return { path, page: routes[path] }; }) }))]));
const blog = [{ label: 'Blog', pages: Object.entries(routes).filter(([path]) => path.startsWith('/blog/')).sort(([a], [b]) => a.localeCompare(b)).map(([path, page]) => ({ path, page })) }];
const cases = [{ label: 'Case studies', pages: Object.entries(routes).filter(([path]) => path.startsWith('/primitives/case-studies/')).sort(([a], [b]) => a.localeCompare(b)).map(([path, page]) => ({ path, page })) }];
const previews = new Set(['form', 'one-time-password-field', 'password-toggle-field'].map(slug => `/primitives/docs/components/${slug}`));

export function DocumentNavigation(props: { path: string; onNavigate?: () => void }) {
  const label = props.path.startsWith('/blog') ? 'Blog' : props.path.startsWith('/primitives/case-studies') ? 'Case studies' : 'Documentation';
  const groups = props.path.startsWith('/blog') ? blog : props.path.startsWith('/primitives/case-studies') ? cases : curated[props.path.split('/')[1]] ?? [];
  return <nav class="document-navigation" aria-label={label}>{groups.map(group => <section><h2>{group.label}</h2><ul>{group.pages.map(({ path, page }) => <li><a href={path} aria-current={props.path === path ? 'page' : undefined} onClick={() => props.onNavigate?.()}>{page.frontmatter.metaTitle}{previews.has(path) && <Badge size="1" ml="2">Preview</Badge>}{page.frontmatter.deprecated === true && <Badge size="1" color="gray" ml="2">Deprecated</Badge>}</a></li>)}</ul></section>)}</nav>;
}

export function DocumentReferences(props: { path: string }) {
  const metadata = routes[props.path].frontmatter;
  const nativeExtension = /^\/(?:primitives|themes)\/docs\/components\/(?:calendar|date-picker|file-drop)$/.test(props.path);
  const slug = props.path.split('/').at(-1)!;
  return <nav class="document-references" aria-label="Document references" data-search-exclude data-md-exclude>
    <a href={`${props.path}.md`}>View as Markdown</a>
    {typeof metadata.aria === 'string' && <a href={metadata.aria} target="_blank" rel="noopener noreferrer">ARIA design pattern</a>}
    {props.path.startsWith('/themes/docs/components/') && !['box', 'flex', 'grid', 'container', 'section', 'accessible-icon', 'portal', 'reset', 'slot', 'theme', 'visually-hidden'].includes(slug) && <a href={`/themes/playground#${slug}`}>View in playground</a>}
    {/^\/(?:primitives\/docs\/components|themes\/docs\/recipes)\/(?:combobox|command|tree|splitter)$/.test(props.path) && <a href={`/themes/playground#${slug}`}>View in playground</a>}
    {!nativeExtension && props.path.startsWith('/primitives/docs/') && typeof metadata.name === 'string' && <a href={`https://github.com/radix-ui/primitives/tree/main/packages/react/${typeof metadata.publishedName === 'string' ? metadata.publishedName : metadata.name}/src`} target="_blank" rel="noopener noreferrer">View original source</a>}
    {!nativeExtension && props.path.startsWith('/themes/docs/components/') && <a href={`https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/${props.path.split('/').at(-1)}.tsx`} target="_blank" rel="noopener noreferrer">View original source</a>}
    {metadata.kind !== 'page' && <>
      <a href={`https://github.com/wsagency/radix2solid-web/blob/main/apps/website/data${props.path}.mdx`} target="_blank" rel="noopener noreferrer">View documentation source</a>
      <a href={`https://github.com/wsagency/radix2solid-web/edit/main/apps/website/data${props.path}.mdx`} target="_blank" rel="noopener noreferrer">Edit documentation</a>
      <a href={`https://github.com/wsagency/${/^\/(?:primitives|themes|charts)\/docs\//.test(props.path) ? 'radix2solid' : 'radix2solid-web'}/issues/new`} target="_blank" rel="noopener noreferrer">Report native issue</a>
    </>}
  </nav>;
}

export function DocsPagination(props: { path: string }) {
  const groups = props.path.startsWith('/blog') ? blog : props.path.startsWith('/primitives/case-studies') ? cases : curated[props.path.split('/')[1]] ?? [];
  const pages = groups.flatMap(group => group.pages);
  const index = pages.findIndex(page => page.path === props.path);
  const previous = pages[index - 1], next = index >= 0 ? pages[index + 1] : undefined;
  return <nav class="docs-pagination" aria-label="Documentation pagination" data-search-exclude data-md-exclude>
    {previous && <a href={previous.path} rel="prev"><span>Previous</span>{previous.page.frontmatter.metaTitle}</a>}
    {next && <a href={next.path} rel="next"><span>Next</span>{next.page.frontmatter.metaTitle}</a>}
  </nav>;
}

export function QuickNav() {
  const [headings, setHeadings] = createSignal<{ id: string; title: string; level: string }[]>([]);
  onSettled(() => { setHeadings([...document.querySelectorAll<HTMLElement>('.document [data-heading]')].map(heading => ({ id: heading.id, title: heading.innerText, level: heading.tagName }))); });
  return <aside class="quick-nav" data-search-exclude>{headings().length > 0 && <nav aria-label="In this article"><h2>In this article</h2><ul>{headings().map(heading => <li data-level={heading.level}><a href={`#${heading.id}`}>{heading.title}</a></li>)}</ul></nav>}</aside>;
}

export function MobileNavigation(props: { path: string }) {
  const [open, setOpen] = createSignal(false);
  return <Dialog.Root open={open()} onOpenChange={setOpen}>
    <Dialog.Trigger>{target => target(Button, { class: 'mobile-navigation-trigger', color: 'gray', variant: 'soft', 'aria-label': 'Open navigation', children: 'Menu' })}</Dialog.Trigger>
    <Dialog.Content class="site-modal mobile-navigation" maxWidth="640px">
      <Dialog.Title>Navigation</Dialog.Title><Dialog.Description class="sr-only">Choose a product or documentation page.</Dialog.Description>
      <nav class="product-navigation" aria-label="Products"><a href="/">Themes</a><a href="/primitives">Primitives</a><a href="/icons">Icons</a><a href="/charts">Charts</a><a href="/colors">Colors</a><a href="/blog">Blog</a></nav>
      <DocumentNavigation path={props.path} onNavigate={() => setOpen(false)} /><Dialog.Close>{target => target(Button, { color: 'gray', variant: 'soft', 'aria-label': 'Close navigation', children: 'Close' })}</Dialog.Close>
    </Dialog.Content>
  </Dialog.Root>;
}
