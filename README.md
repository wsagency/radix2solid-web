# Radix2Solid website

The independent, unofficial native **Solid 2** documentation website for [Radix2Solid](https://github.com/wsagency/radix2solid). This is not a WorkOS product. Original Radix documentation, designs, blog posts and case studies keep their attribution and historical context; they do not endorse this fork.

The site preserves 137 original MDX documents and 151 original routes, and adds 37 native-only documents and 38 native-only routes for Charts, seven Primitives API families and Themes additions: 174 documents, 189 routes plus 404, 278 demo source files and 119 downloadable runnable sandboxes. Calendar, DatePicker and FileDrop are local candidate APIs: their new Primitives and Themes exports are not available from published npm `0.1.0-rc.3`; their nine style-variant archives bundle the actual pinned local packages. The site also includes native interactive examples, Markdown negotiation, heading-aware search, redirects, the Themes playground and historical marketing/example layouts. Website source and issues belong to [wsagency/radix2solid-web](https://github.com/wsagency/radix2solid-web); native package issues belong to [wsagency/radix2solid](https://github.com/wsagency/radix2solid).

## Published next-suite release candidate

All five native packages are published on npm as `0.1.0-rc.3` (release candidate, dist-tag `next`):

| Package | npm |
|---|---|
| Primitives | [@wsagency/radix2solid-primitives@0.1.0-rc.3](https://www.npmjs.com/package/@wsagency/radix2solid-primitives/v/0.1.0-rc.3) |
| Themes | [@wsagency/radix2solid-themes@0.1.0-rc.3](https://www.npmjs.com/package/@wsagency/radix2solid-themes/v/0.1.0-rc.3) |
| Icons | [@wsagency/radix2solid-icons@0.1.0-rc.3](https://www.npmjs.com/package/@wsagency/radix2solid-icons/v/0.1.0-rc.3) |
| Charts | [@wsagency/radix2solid-charts@0.1.0-rc.3](https://www.npmjs.com/package/@wsagency/radix2solid-charts/v/0.1.0-rc.3) |
| Icons Extra | [@wsagency/radix2solid-icons-extra@0.1.0-rc.3](https://www.npmjs.com/package/@wsagency/radix2solid-icons-extra/v/0.1.0-rc.3) |

Always pin `@0.1.0-rc.3`; do not use a bare package name or `@latest`. The `latest` tag still points to rc.1 for Primitives, Icons, and Themes and rc.2 for Charts. Icons Extra's `latest` is rc.3, but pin it explicitly as well.
The published rc.3 installation above remains correct for those published APIs. Calendar, DatePicker and FileDrop are unpublished local-candidate exports and are not installed by the rc.3 commands; use their candidate sandbox downloads only after the web build has packed the exact pinned Primitives and Themes tarballs.

Each of the nine local candidate archives is generated from the reviewed, committed green Primitives/Themes source at exact candidate SHA `8bb3d8af0b3509638326afb65be22099e3e02cca`. The archives bundle actual packed Primitives and Themes tarballs under `vendor/`, with Themes' Primitives override resolving to the same bundled file. Download the runnable archives from their playground source viewers, extract and run `pnpm install` and `pnpm build`. The generated `CANDIDATE.md` records the source commit. These are local candidate APIs and are not available from npm rc.3.

Install the packages you need. Themes depends on Primitives, so keep its transitive dependency on the same exact version:

```yaml
overrides:
  solid-js: 2.0.0-rc.15
  '@solidjs/web': 2.0.0-rc.15
  '@solidjs/signals': 2.0.0-rc.15
  '@solidjs/compiler': 2.0.0-rc.15
  '@solidjs/babel-plugin': 2.0.0-rc.15
  '@wsagency/radix2solid-primitives': 0.1.0-rc.3
```

```sh
pnpm add -E @wsagency/radix2solid-primitives@0.1.0-rc.3 @wsagency/radix2solid-themes@0.1.0-rc.3 @wsagency/radix2solid-icons@0.1.0-rc.3 @wsagency/radix2solid-charts@0.1.0-rc.3 @wsagency/radix2solid-icons-extra@0.1.0-rc.3
npm install -E @wsagency/radix2solid-primitives@0.1.0-rc.3 @wsagency/radix2solid-themes@0.1.0-rc.3 @wsagency/radix2solid-icons@0.1.0-rc.3 @wsagency/radix2solid-charts@0.1.0-rc.3 @wsagency/radix2solid-icons-extra@0.1.0-rc.3
```

The complete Solid 2 RC15 runtime/compiler tuple and Vite plugin are exact:

```sh
pnpm add -E solid-js@2.0.0-rc.15 @solidjs/web@2.0.0-rc.15 @solidjs/signals@2.0.0-rc.15 @solidjs/compiler@2.0.0-rc.15 @solidjs/babel-plugin@2.0.0-rc.15
pnpm add -D -E @solidjs/vite-plugin@3.0.0-next.50 vite@8.3.3
```

Icons Extra remains optional: its two native folder icons are separate from the original 332. Existing sandboxes use published packages; the nine Calendar, DatePicker and FileDrop style variants include the exact packed local candidate Primitives and Themes distributions, full pinned source SHA instructions, exact tooling and licenses. This website does not publish those local candidate APIs to npm.


## Created for WS Agency

<a href="https://ws.agency"><picture><source media="(prefers-color-scheme: dark)" srcset="https://design.ws.agency/assets/logos/original/sign-white.svg"><img src="https://design.ws.agency/assets/logos/original/sign-color.svg" height="32" alt="WS Agency"></picture></a>

**Made with love by WS.** Created by [Kristijan Lukačin (@klukacin)](https://github.com/klukacin) for [WS Agency](https://ws.agency). We love open source, enterprise development and AI. Have a project in mind? [Let’s build it together.](https://ws.agency/contact)

The WS Agency logo is trademark/brand artwork excluded from the software MIT license; the local Original color sign's public provenance and exact asset hash are in [NOTICE.txt](apps/website/public/NOTICE.txt). The README also uses the official [white sign](https://design.ws.agency/assets/logos/original/sign-white.svg), SHA-256 `f3e960eafbd9202aacc216dc3a4995fddc14e109d7e6d8ffc5c0f45c28fda72c`, from the same observed public design version; no brand artwork is relicensed. Original WorkOS attribution and the unofficial-fork status above remain unchanged.

### Contributing and credit

Website issues and pull requests belong in [radix2solid-web](https://github.com/wsagency/radix2solid-web); native package contributions belong in [radix2solid](https://github.com/wsagency/radix2solid). GitHub credits real accepted commits merged into the default branch when their author email is associated with the author's account; use your own verified account email or GitHub-provided noreply address. Add `Co-authored-by` only for someone who actually contributed, using their real identity.

Repository owners can invite collaborators through repository Settings to grant access. That invitation is separate from contributor credit and is not required to submit a fork pull request.

## Build and check

Use Node **24.21.0** and pnpm **11.5.0**, matching `.node-version` and `packageManager`.

```sh
node scripts/prepare-library.ts
pnpm install --frozen-lockfile
pnpm exec playwright install chromium firefox webkit
pnpm check
pnpm dev
```

The dependency-free Node bootstrap reads the fixed public repository and full commit from `library-source.json`, then prepares ignored `.library/` before installation. Run it directly, before any pnpm command: pnpm can automatically install workspace dependencies before running a package script. That exact library commit must be published for the default HTTPS fetch to succeed. It does not fall back to a branch, npm or copied source. An existing checkout must have the pinned HEAD and no staged, unstaged or nonignored untracked changes; wrong HEAD, dirt, symlinks, non-Git directories and invalid/replaced pins fail without resetting or overwriting existing data. Ignored `dist/` and `node_modules/` outputs are allowed.

Install **once at this web root**, not inside `.library`. The workspace contains `apps/website` and the five actual `.library/packages/*` producers. Build validates the checkout again, then builds real primitives → icons → icons-extra → themes → charts distributions before the site. There are no library source aliases, React bridge, Solid 1 runtime or second library-root dependency installation. The web lock retains the accepted producer dependency resolutions and exact Solid 2.0.0-rc.15 overrides (`solid-js`, `@solidjs/web`, `@solidjs/signals`, `@solidjs/compiler`, `@solidjs/babel-plugin`) with `@solidjs/vite-plugin` 3.0.0-next.50. The global 24-hour `minimumReleaseAge` stays; only those exact versions are excepted until they age.

### Explicit local sibling prepopulation

If the pinned source has not been published yet, a real local sibling clone is an explicit alternative:

```sh
git clone --no-hardlinks ../radix2solid .library
git -C .library checkout --detach 90f129ec6786c0d46ccca8e261438556db2eb9b7
node scripts/prepare-library.ts
pnpm install --frozen-lockfile
pnpm check
```

This assumes `../radix2solid` is the actual source repository containing that commit. It is **local-source validation, not proof of a remote-only GitHub checkout**. Bootstrap itself is unchanged and has no transport flags.

To update the library, review an actual clean library commit, update `library-source.json` with its full SHA, check the owned `.library` checkout is clean, and explicitly fetch/check out the new commit detached. Bootstrap deliberately rejects the old checkout after a pin change; it never silently recovers it. Retain the accepted root lock resolutions when updating workspace importers, then repeat the real producer/site checks.

## Verification scope

`pnpm check` builds real producers, typechecks the site, checks exact HTML/Markdown/document/demo/archive inventories, compiles native documented fences and installation commands, exercises copied guides, independently installs/builds **all 110 actual exported archives**, and runs bootstrap safety, existing worker/script tests and website browser cases in Chromium, Firefox and WebKit. Archive first installs have no pre-existing lock; each normal isolated install creates its own. Package names, declared native/runtime/tool pins and real tarballs remain exact. Archive installation/build coverage is not a claim that every archive received runtime interaction tests.

Runtime interactions reuse representative built archives for Dialog, Toast, Select, Charts, Combobox, Command, Tree, Splitter and Icons Extra in all three engines. This is separate from the 110-archive installation/build count. The checker accepts explicit archive names for bounded local checks; the no-argument CI command still checks every advertised archive.

Failed GitHub Actions checks retain only `.artifacts/playwright/` for seven days: browser API traces, failure-only screenshots, error contexts and chart geometry/loading attachments. Trace DOM snapshots and screencast screenshots are disabled because the snapshot observer itself forces early layout; chart attachments retain asset-request timing separately. Private build artifacts and installation credentials are not uploaded. Chart geometry checks reuse the existing SSR-disabled theme control to await native hydration, rather than treating window load as readiness. Startup uses the existing navigation/action budget within the unchanged 30-second test budget, replacing the added five-second startup assertion; the subsequent five-second geometry/font assertions and retries are unchanged.

Preview binds only to `127.0.0.1`, on port 4149 unless `WEBSITE_PREVIEW_PORT` overrides it for the preview server, Playwright and the website spec together. Playwright owns its preview process; stop a manually started preview on the same port before browser checks. The library gallery is not part of this repository or its browser server configuration. Site implementation, focused commands and coverage limits are documented in [apps/website/README.md](apps/website/README.md).

## License, assets and publication limits

Native fork changes: MIT, Copyright (c) 2026 Radix2Solid contributors; see [LICENSE](LICENSE). Original website software keeps its full WorkOS MIT text in [WEBSITE-LICENSE.txt](apps/website/public/WEBSITE-LICENSE.txt). Package tarballs preserve the library's complete original and contributor notices, including reused released Colors CSS. Charts keeps the solid-recharts/Recharts MIT notices in `LICENSE` and verbatim resolved D3 ISC licenses in `NOTICE`. The separate Icons Extra package carries its own artwork provenance and license. `NOTICE.txt` reproduces the licenses of all five Radix2Solid packages and other code bundled into the site's JavaScript; `check:export` checks the actual archives and runtime graph. Font copyright/OFL texts and provenance hashes are in `apps/website/public/fonts/`.

[NOTICE.txt](apps/website/public/NOTICE.txt) discloses historical trademarks, portraits, endorsements and externally hosted images. Software licensing does not grant trademark/likeness/deployment rights. The site is indexable. The `radix2solid.com` hostname and a `www` redirect to it are configured in Cloudflare, not in this repository; this repository does not claim the site is published. GitHub Actions deploys the `out/` that `pnpm check` validated to a Cloudflare Worker, only for pushes to `main` that are still the branch head, so publication waits for a green `pnpm check`. No analytics or GitHub Release upload is configured. The five native packages are published independently on npm; this website repository does not configure npm package publishing. Generated exports, downloads, dependencies, the ignored library checkout and private build artifacts are not committed.
