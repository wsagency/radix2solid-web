
import { CubeIcon, DownloadIcon, FigmaLogoIcon, GitHubLogoIcon } from "@wsagency/radix2solid-icons";
import { Box, Code, Flex, Heading, Link, Separator, Text } from "@wsagency/radix2solid-themes";
import { CopyToastProvider } from "./copy-toast";
import { MainContent } from "./main-content";
import { CodeBlock } from "../code-block";
import IconsExtraDemo from "../../demos/icons-extra";
import styles from "./icons-panel.module.css";
export const IconsPanel = () => {
  return <CopyToastProvider>
			<Box style={{
      "border-radius": "var(--radius-4)",
      "min-height": "900px",
      "background": "var(--color-background)",
      "position": "relative"
    }}>
				<Box position="absolute" inset="0" style={{
        "pointer-events": "none",
        "border-radius": "inherit",
        "box-shadow": "var(--shadow-5)"
      }} />
				<MainContent />

				<Separator size="4" />

				<Box p={{
        initial: "5",
        sm: "6"
      }} class={styles.IconsPanelMainSection}>
					<Box mb="5" style={{
          "grid-column": "3 / 4"
        }}>
						<Heading as="h3" size="5">
							Assets
						</Heading>

						<Flex direction="column" gap="2" mt="3">
							<Flex align="center" gap="2" asChild>{target => target(Link, {
                "size": "2",
                "href": "https://www.figma.com/community/file/1510053249065427020/radix-icons",
                "target": "_blank",
                "highContrast": true,
                "color": "gray",
                children: <>
									<FigmaLogoIcon />
									Open in Figma
								</>
              })}</Flex>

							<Flex align="center" gap="2" asChild>{target => target(Link, {
                "size": "2",
                "href": "/icons/radix-icons.zip",
                "target": "_blank",
                "highContrast": true,
                "color": "gray",
                children: <>
									<DownloadIcon />
									Download SVG
								</>
              })}</Flex>
							<Flex align="center" gap="2" asChild>{target => target(Link, {
                "size": "2",
                "href": "/icons#installation",
                "target": "_blank",
                "highContrast": true,
                "color": "gray",
                children: <>
									<CubeIcon />
									Installation
								</>
              })}</Flex>

							<Flex align="center" gap="2" asChild>{target => target(Link, {
                "size": "2",
                "href": "https://github.com/wsagency/radix2solid",
                "target": "_blank",
                "highContrast": true,
                "color": "gray",
                children: <>
									<GitHubLogoIcon />
									View on GitHub
								</>
              })}</Flex>
						</Flex>
					</Box>

					<Box mb={{
          initial: "5",
          sm: "0"
        }} class={styles.IconsPanelSectionContent} id="installation">
						<Heading as="h3" size="5">
							Solid components
						</Heading>

						<Text as="p" size="3" mt="3">
							The original 332 icons are individual native Solid 2 components. Published on npm as 0.1.0-rc.3 (release candidate, dist-tag `next`): <Link href="https://www.npmjs.com/package/@wsagency/radix2solid-icons/v/0.1.0-rc.3">@wsagency/radix2solid-icons@0.1.0-rc.3</Link>. This remains a release candidate, not a stable release. The npm `latest` tag still points to rc.1, so pin the exact version.
						</Text>
						<Link href="https://www.npmjs.com/package/@wsagency/radix2solid-icons/v/0.1.0-rc.3" size="2">View the exact npm release</Link>

						<CodeBlock.Root mt="3">
							<CodeBlock.Content>
								<CodeBlock.Pre>
									<CodeBlock.Code language="bash">pnpm add -E @wsagency/radix2solid-icons@0.1.0-rc.3</CodeBlock.Code>
								</CodeBlock.Pre>
								<CodeBlock.CopyButton />
							</CodeBlock.Content>
						</CodeBlock.Root>
            <CodeBlock.Root mt="3"><CodeBlock.Content><CodeBlock.Pre><CodeBlock.Code language="bash">npm install -E @wsagency/radix2solid-icons@0.1.0-rc.3</CodeBlock.Code></CodeBlock.Pre><CodeBlock.CopyButton /></CodeBlock.Content></CodeBlock.Root>
						<Text as="p" size="2" mt="3">Icons requires <Code>solid-js</Code> and <Code>@solidjs/web</Code> exactly <Code>2.0.0-rc.15</Code>, with matching <Code>@solidjs/signals</Code>, <Code>@solidjs/compiler</Code> and <Code>@solidjs/babel-plugin</Code> versions. For Vite, use <Code>@solidjs/vite-plugin</Code> <Code>3.0.0-next.50</Code>. Follow the <Link href="/themes/docs/overview/getting-started#installation">Solid setup instructions</Link> for the pinned compiler graph; Icons does not require installing Themes.</Text>

						<Text as="p" size="3" mt="4">
							Import the icons into your Solid 2 project:
						</Text>

						<CodeBlock.Root mt="3">
							<CodeBlock.Content>
								<CodeBlock.Pre>
									<CodeBlock.Code language="jsx">
										{`
import { FaceIcon, ImageIcon, SunIcon } from "@wsagency/radix2solid-icons"

function MyComponent () {
	return (
		<div>
			<FaceIcon />
			<SunIcon />
			<ImageIcon />
		</div>
	)
}
`.trim()}
									</CodeBlock.Code>
								</CodeBlock.Pre>
							</CodeBlock.Content>
						</CodeBlock.Root>

						<Text as="p" size="2" mt="4" color="gray">
							Bundle cost: the first <Code size="2">CheckIcon</Code> adds 22,379 B (7,966 B gzip) to an empty Solid app, most of it the Solid web runtime, and 1,310 B (631 B gzip) to an app that already renders a Themes <Code size="2">Button</Code>. Root and per-icon imports cost the same. Measured with Vite 8.3.3 client builds, minified, zlib gzip level 9, on Node 22.12 with Solid 2.0.0-rc.13 and package release 0.1.0-rc.1. Don’t add Themes just to use icons.
						</Text>
						<Text as="p" size="2" mt="2" color="gray">
							The separate optional Extra package adds two folders without changing the original 332. Other custom icons remain your own SVG or Solid components. Brand artwork is not included.
						</Text>
					</Box>
          <Box class={styles.IconsPanelSectionContent} style={{ "grid-row": "3" }} id="extra-installation" mt="6">
            <Heading as="h3" size="5">Extra icons · optional separate package</Heading>
            <Text as="p" mt="3">FolderIcon and FolderOpenIcon use a 24×24 viewBox and default to 15 pixels. No dependency on the original Icons package or Themes is required. Published on npm as 0.1.0-rc.3 (release candidate, dist-tag `next`): <Link href="https://www.npmjs.com/package/@wsagency/radix2solid-icons-extra/v/0.1.0-rc.3">@wsagency/radix2solid-icons-extra@0.1.0-rc.3</Link>. The npm `latest` tag also points to rc.3, but pin it explicitly.</Text>
            <CodeBlock.Root mt="3"><CodeBlock.Content><CodeBlock.Pre><CodeBlock.Code language="bash">pnpm add -E @wsagency/radix2solid-icons-extra@0.1.0-rc.3</CodeBlock.Code></CodeBlock.Pre><CodeBlock.CopyButton /></CodeBlock.Content></CodeBlock.Root>
            <CodeBlock.Root mt="3"><CodeBlock.Content><CodeBlock.Pre><CodeBlock.Code language="bash">npm install -E @wsagency/radix2solid-icons-extra@0.1.0-rc.3</CodeBlock.Code></CodeBlock.Pre><CodeBlock.CopyButton /></CodeBlock.Content></CodeBlock.Root>
            <Text as="p" mt="3">Use the same exact <Link href="/themes/docs/overview/getting-started#installation">Solid 2 RC15 runtime/compiler setup</Link>. Do not install Themes just for icons.</Text>
            <CodeBlock.Root mt="3"><CodeBlock.Content><CodeBlock.Pre><CodeBlock.Code language="tsx">{`import { FolderIcon } from "@wsagency/radix2solid-icons-extra";
import FolderOpenIcon from "@wsagency/radix2solid-icons-extra/FolderOpenIcon";

export default () => <div><FolderIcon /><FolderOpenIcon title="Open project folder" size={24} /></div>;`}</CodeBlock.Code></CodeBlock.Pre></CodeBlock.Content></CodeBlock.Root>
            <IconsExtraDemo />
            <Flex gap="3" wrap="wrap">
              <Link href="/icons-extra/folder.svg" download>Download folder SVG</Link>
              <Link href="/icons-extra/folder-open.svg" download>Download open-folder SVG</Link>
              <Link href="/sandboxes/icons-extra-css-modules.tar.gz" download>Extra icons CSS Modules sandbox</Link>
              <Link href="/sandboxes/icons-extra-css.tar.gz" download>Extra icons CSS sandbox</Link>
              <Link href="/sandboxes/icons-extra-tailwind.tar.gz" download>Extra icons Tailwind sandbox</Link>
            </Flex>
            <Text as="p" size="2" mt="3">Decorative icons are hidden from assistive technology unless named; title renders a native SVG title. Native dimensions, ARIA, refs and events remain available. The package records these two SVG assets as AI-authored artwork created for this project, not Radix Icons artwork. See its <Link href="https://github.com/wsagency/radix2solid/tree/main/packages/icons-extra#artwork">factual artwork creation/provenance record</Link> and <Link href="https://github.com/wsagency/radix2solid/blob/main/packages/icons-extra/LICENSE">MIT licence and retained code notices</Link>. No trademark rights or legal-clearance assurance is implied. The historical bundle measurement above applies only to the original icons, not this new set.</Text>
          </Box>

					<Box style={{
          "grid-column": "3 / 4"
        }}>
						<Heading as="h3" size="5">
							License
						</Heading>

						<Text as="p" size="2" mt="2">
							Licensed under the{" "}
							<Link size="2" href="https://github.com/wsagency/radix2solid/blob/main/packages/icons/LICENSE" highContrast color="gray">
								MIT License
							</Link>
							.
							<br />
							Native fork © 2026 Radix2Solid contributors; original icons © 2022–present WorkOS.
						</Text>
					</Box>
				</Box>
			</Box>
		</CopyToastProvider>;
};
