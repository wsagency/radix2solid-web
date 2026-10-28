# Radix2Solid website

The independent, unofficial native **Solid 2** documentation website for [Radix2Solid](https://github.com/wsagency/radix2solid). This is not a WorkOS product. Original Radix documentation, designs, blog posts and case studies keep their attribution and historical context; they do not endorse this fork.

The site preserves 137 original MDX documents and 151 original routes, and adds 37 native-only documents and 38 native-only routes for Charts, seven Primitives API families and Themes additions: 174 documents, 189 routes plus 404, 278 demo source files and 119 downloadable runnable sandboxes. Calendar, DatePicker and FileDrop are included in the published Primitives and Themes `0.1.0-rc.4` release; their nine style-variant archives install those exact npm packages rather than bundling local tarballs. The site also includes native interactive examples, Markdown negotiation, heading-aware search, redirects, the Themes playground and historical marketing/example layouts. Website source and issues belong to [wsagency/radix2solid-web](https://github.com/wsagency/radix2solid-web); native package issues belong to [wsagency/radix2solid](https://github.com/wsagency/radix2solid).

## Published next-suite release candidate

All five native packages are published on npm as `0.1.0-rc.4` (release candidate, dist-tag `next`):

| Package | npm |
|---|---|
| Primitives | [@wsagency/radix2solid-primitives@0.1.0-rc.4](https://www.npmjs.com/package/@wsagency/radix2solid-primitives/v/0.1.0-rc.4) |
| Themes | [@wsagency/radix2solid-themes@0.1.0-rc.4](https://www.npmjs.com/package/@wsagency/radix2solid-themes/v/0.1.0-rc.4) |
| Icons | [@wsagency/radix2solid-icons@0.1.0-rc.4](https://www.npmjs.com/package/@wsagency/radix2solid-icons/v/0.1.0-rc.4) |
| Charts | [@wsagency/radix2solid-charts@0.1.0-rc.4](https://www.npmjs.com/package/@wsagency/radix2solid-charts/v/0.1.0-rc.4) |
| Icons Extra | [@wsagency/radix2solid-icons-extra@0.1.0-rc.4](https://www.npmjs.com/package/@wsagency/radix2solid-icons-extra/v/0.1.0-rc.4) |

These setup examples keep `0.1.0-rc.4` pinned for reproducibility; npm dist-tags such as `latest` and `next` are mutable and may move independently.


Install the packages you need. Themes depends on Primitives, so keep its transitive dependency on the same exact version:

```yaml
overrides:
  solid-js: 2.0.0-rc.15
  '@solidjs/web': 2.0.0-rc.15
  '@solidjs/signals': 2.0.0-rc.15
  '@solidjs/compiler': 2.0.0-rc.15
  '@solidjs/babel-plugin': 2.0.0-rc.15
  '@wsagency/radix2solid-primitives': 0.1.0-rc.4
```

```sh
pnpm add -E @wsagency/radix2solid-primitives@0.1.0-rc.4 @wsagency/radix2solid-themes@0.1.0-rc.4 @wsagency/radix2solid-icons@0.1.0-rc.4 @wsagency/radix2solid-charts@0.1.0-rc.4 @wsagency/radix2solid-icons-extra@0.1.0-rc.4
npm install -E @wsagency/radix2solid-primitives@0.1.0-rc.4 @wsagency/radix2solid-themes@0.1.0-rc.4 @wsagency/radix2solid-icons@0.1.0-rc.4 @wsagency/radix2solid-charts@0.1.0-rc.4 @wsagency/radix2solid-icons-extra@0.1.0-rc.4
```

The complete Solid 2 RC15 runtime/compiler tuple and Vite plugin are exact:

```sh
pnpm add -E solid-js@2.0.0-rc.15 @solidjs/web@2.0.0-rc.15 @solidjs/signals@2.0.0-rc.15 @solidjs/compiler@2.0.0-rc.15 @solidjs/babel-plugin@2.0.0-rc.15
pnpm add -D -E @solidjs/vite-plugin@3.0.0-next.50 vite@8.3.3
```

Icons Extra remains optional: its two native folder icons are separate from the original 332. The nine Calendar, DatePicker and FileDrop style variants are available as runnable npm-based archives with exact package pins, complete tooling and licenses.


## Created for WS Agency

<a href="https://ws.agency"><picture><source media="(prefers-color-scheme: dark)" srcset="https://design.ws.agency/assets/logos/original/sign-white.svg"><img src="https://design.ws.agency/assets/logos/original/sign-color.svg" height="32" alt="WS Agency"></picture></a>

**Made with love by WS.** Created by [Kristijan Lukačin (@klukacin)](https://github.com/klukacin) for [WS Agency](https://ws.agency). We love open source, enterprise development and AI. Have a project in mind? [Let’s build it together.](https://ws.agency/contact)

The WS Agency logo is trademark/brand artwork excluded from the software MIT license; the local Original color sign's public provenance and exact asset hash are in [NOTICE.txt](apps/website/public/NOTICE.txt). The README also uses the official [white sign](https://design.ws.agency/assets/logos/original/sign-white.svg), SHA-256 `f3e960eafbd9202aacc216dc3a4995fddc14e109d7e6d8ffc5c0f45c28fda72c`, from the same observed public design version; no brand artwork is relicensed. Original WorkOS attribution and the unofficial-fork status above remain unchanged.

### Contributing and credit

Website issues and pull requests belong in [radix2solid-web](https://github.com/wsagency/radix2solid-web); native package contributions belong in [radix2solid](https://github.com/wsagency/radix2solid). GitHub credits real accepted commits merged into the default branch when their author email is associated with the author's account; use your own verified account email or GitHub-provided noreply address. Add `Co-authored-by` only for someone who actually contributed, using their real identity.
Write all new project-authored prose, comments, and instructions in English; preserve localized test/demo data and original upstream/license text.

Repository owners can invite collaborators through repository Settings to grant access. That invitation is separate from contributor credit and is not required to submit a fork pull request.

## Build and check

Use Node **24.21.0** and pnpm **11.5.0**, matching `.node-version` and `packageManager`. The web repository's declared executable support range is Node `>=22.18.0 <23 || >=24.0.0 <25`; Node 23.x is not supported.

```sh
export RADIX2SOLID_LIBRARY_SOURCE=/absolute/path/to/radix2solid
node scripts/prepare-library.ts
pnpm install --frozen-lockfile
pnpm --filter @radix-solid/website prepare:public-archives
pnpm exec playwright install chromium firefox webkit
pnpm check
pnpm dev
```

The dependency-free Node bootstrap reads the fixed public repository and full commit from `library-source.json`, then prepares ignored `.library/` before installation. Run it directly, before any pnpm command: pnpm can automatically install workspace dependencies before running a package script. The default HTTPS fetch requires that exact commit to exist on the public repository. This candidate SHA is local-only and has not been pushed, so GitHub Actions cannot bootstrap it until an authorized push. For local validation only, set `RADIX2SOLID_LIBRARY_SOURCE` to an absolute path to a local Git repository containing the pinned commit. Without that explicit override, a wrong HEAD, dirt, symlinks, non-Git directories and invalid/replaced pins fail without resetting or overwriting existing data. With it, a clean existing `.library` may fetch the exact pin from the explicit local source; dirty or unsafe checkouts remain unchanged. Ignored `dist/` and `node_modules/` outputs are allowed.

Install **once at this web root**, not inside `.library`. The workspace contains `apps/website` and the five actual `.library/packages/*` producers. Build validates the checkout again, then builds real primitives → icons → icons-extra → themes → charts distributions before the site. There are no library source aliases, React bridge, Solid 1 runtime or second library-root dependency installation. The site build uses the unpublished local `0.1.0-rc.5` source candidate at `2f8a329afe95c14dbd49810b90744f95a36b775e` (parent `6395e0dc96f0a912f2a616712e25f289717285aa`) with the Solid 2.0.0-rc.19 runtime/compiler tuple and `@solidjs/vite-plugin` 3.0.0-next.52. This source includes a local Checkbox security fix; published npm Primitives `0.1.0-rc.4` remains vulnerable. Its Charts documentation describes a narrow Solid RC19 reactive-object `data-*` limitation and consumer string guidance; it does not change renderer behavior. This is local candidate validation only, not package publication or a website release. Public package downloads and the 119 registry-based runnable sandboxes remain published library `0.1.0-rc.4` / Solid RC15. The global 24-hour `minimumReleaseAge` stays; exceptions are exact-version-only for the RC19 compiler tuple/plugin and retained test-runner packages.

### Explicit local sibling source override

For a local source commit not yet available from the fixed public repository, set the explicit developer-only override to the local source Git repository. The existing `.library` must be clean; the bootstrap fetches the exact pinned commit into that checkout without discarding uncommitted data:

```sh
export RADIX2SOLID_LIBRARY_SOURCE=/absolute/path/to/radix2solid
node scripts/prepare-library.ts
pnpm install --frozen-lockfile
pnpm --filter @radix-solid/website prepare:public-archives
pnpm build
pnpm --filter @radix-solid/website check:export
pnpm --filter @radix-solid/website check:snippets
```

The source path must be the top level of a real local Git repository containing the pinned commit. This override is **local-source validation, not proof of remote availability**; the local candidate commit `2f8a329afe95c14dbd49810b90744f95a36b775e` is not on the remote, so GitHub Actions remains unable to bootstrap until authorized push. Never change the CI source override or publish from this local-only validation.

To update the library, review an actual clean library commit, update `library-source.json` with its full SHA, and verify the owned `.library` checkout has no staged, unstaged or nonignored untracked changes before running the bootstrap with the explicit local source. The bootstrap rejects a dirty or unsafe checkout unchanged; without the local override it also rejects a mismatched old HEAD. Retain accepted root lock resolutions when updating workspace importers, then repeat the real producer/site checks.

## Verification scope

`pnpm check` builds the pinned real library producers and website, typechecks the site, checks exact HTML/Markdown/document/demo/archive inventories, compiles native documented fences and installation commands, exercises copied guides, independently installs and builds **all 119 actual exported archives**, and runs bootstrap safety, existing worker/script tests and website browser cases in Chromium, Firefox and WebKit. Archive first installs have no pre-existing lock; each normal isolated install creates its own. Package names, declared native/runtime/tool pins and real tarballs remain exact. Installing/building every archive is distinct from runtime interaction coverage, which uses representative archives listed below.

Runtime interactions use representative built archives for Dialog, Toast, Select, Charts, Combobox, Command, Tree, Splitter, Icons Extra, Calendar, DatePicker and FileDrop in Chromium, Firefox and WebKit. This is separate from the all-119-archive install/build count. The checker accepts explicit archive names for bounded local checks; the no-argument CI command still checks every advertised archive.

Failed GitHub Actions checks retain only `.artifacts/playwright/` for seven days: browser API traces, failure-only screenshots, error contexts and chart geometry/loading attachments. Trace DOM snapshots and screencast screenshots are disabled because the snapshot observer itself forces early layout; chart attachments retain asset-request timing separately. Private build artifacts and installation credentials are not uploaded. Chart geometry checks reuse the existing SSR-disabled theme control to await native hydration, rather than treating window load as readiness. Startup uses the existing navigation/action budget within the unchanged 30-second test budget, replacing the added five-second startup assertion; the subsequent five-second geometry/font assertions and retries are unchanged.

Preview binds only to `127.0.0.1`, on port 4149 unless `WEBSITE_PREVIEW_PORT` overrides it for the preview server, Playwright and the website spec together. Playwright owns its preview process; stop a manually started preview on the same port before browser checks. The library gallery is not part of this repository or its browser server configuration. Site implementation, focused commands and coverage limits are documented in [apps/website/README.md](apps/website/README.md).

## License, assets and publication limits

Native fork changes: MIT, Copyright (c) 2026 Radix2Solid contributors; see [LICENSE](LICENSE). Original website software keeps its full WorkOS MIT text in [WEBSITE-LICENSE.txt](apps/website/public/WEBSITE-LICENSE.txt). Package tarballs preserve the library's complete original and contributor notices, including reused released Colors CSS. Charts keeps the solid-recharts/Recharts MIT notices in `LICENSE` and verbatim resolved D3 ISC licenses in `NOTICE`. The separate Icons Extra package carries its own artwork provenance and license. `NOTICE.txt` reproduces the licenses of all five Radix2Solid packages and other code bundled into the site's JavaScript; `check:export` checks the actual archives and runtime graph. Font copyright/OFL texts and provenance hashes are in `apps/website/public/fonts/`.

[NOTICE.txt](apps/website/public/NOTICE.txt) discloses historical trademarks, portraits, endorsements and externally hosted images. Software licensing does not grant trademark/likeness/deployment rights. The site is indexable. The `radix2solid.com` hostname and a `www` redirect to it are configured in Cloudflare, not in this repository; this repository does not claim the site is published. GitHub Actions deploys the `out/` that `pnpm check` validated to a Cloudflare Worker, only for pushes to `main` that are still the branch head, so publication waits for a green `pnpm check`. No analytics or GitHub Release upload is configured. The five native packages are published independently on npm; this website repository does not configure npm package publishing. Generated exports, downloads, dependencies, the ignored library checkout and private build artifacts are not committed.
