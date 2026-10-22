
import { ArrowLeftIcon, FigmaLogoIcon } from "@wsagency/radix2solid-icons";
import { Box, Button, Container, Flex, Section } from "@wsagency/radix2solid-themes";
import { SerifHeading } from "../serif-heading";
import styles from "./icons-hero.module.css";
export const IconsHero = () => {
  return <>
			<Box style={{
      "position": "absolute",
      "top": 0 as const,
      "left": 0 as const,
      "right": 0 as const,
      "height": "480px",
      "opacity": 0.6,
      "background": "linear-gradient(to bottom, var(--mint-a2), transparent)"
    }} />

			<Box class={styles.IconsHeroLinesContainer}>
				<Box class={styles.IconsHeroLines}>
					<Line color="var(--pink-a5)" angle="0deg" offset="0, 0.467em" />
					<Line color="var(--pink-a5)" angle="0deg" offset="0, 0.533em" />

					<Line color="var(--pink-a5)" angle="45deg" offset="-0.288em, 0" />
					<Line color="var(--pink-a5)" angle="45deg" offset="-0.288em, 0.090em" />

					<Line color="var(--pink-a5)" angle="-45deg" offset="0.622em, 0" />
					<Line color="var(--pink-a5)" angle="-45deg" offset="0.622em, 0.090em" />

					<Line color="var(--pink-a5)" angle="45deg" offset="0.242em, 0" />
					<Line color="var(--pink-a5)" angle="-45deg" offset="0.242em, 1em" />

					<Line color="var(--mint-a5)" angle="0deg" offset="0, 0" />
					<Line color="var(--mint-a5)" angle="0deg" offset="0, 1em" />

					<Line color="var(--mint-a5)" angle="90deg" offset="0, 0" />
					<Line color="var(--mint-a5)" angle="90deg" offset="1em, 0" />

					<ArrowLeftIcon style={{
          "position": "relative",
          "width": "1em",
          "height": "1em"
        }} />
				</Box>
			</Box>

			<Box position="relative">
				<Section size={{
        initial: "2",
        md: "4"
      }}>
					<Container mx={{
          initial: "5",
          xs: "6",
          sm: "7",
          md: "9"
        }}>
						<Box mb="6">
							<SerifHeading>
								A crisp set
								<br />
								of 15×15 icons
							</SerifHeading>
						</Box>

						<Flex align="stretch" gap="4" direction={{
            initial: "column",
            sm: "row"
          }}>
							<Button asChild size={{
              initial: "3",
              xs: "4"
            }} color="gray" highContrast>{target => target("a", {
                "target": "_blank",
                "href": "https://www.figma.com/community/file/1510053249065427020/radix-icons",
                children: <>
									<FigmaLogoIcon width="20" height="20" style={{
                    "margin-left": "-6px",
                    "margin-right": "-2px"
                  }} />
									Open in Figma
								</>
              })}</Button>
							<input readonly onClick={event => event.currentTarget.select()} value="pnpm add -E @wsagency/radix2solid-icons@0.1.0-rc.4" style={{
              "text-align": "center",
              "min-height": "40px",
              "min-width": 0 as const,
              "box-sizing": "content-box",
              "font-family": "var(--code-font-family)",
              "font-size": "var(--font-size-3)",
              "background-color": "var(--color-panel-solid)",
              "border-radius": "var(--radius-3)",
              "border": 0 as const,
              "appearance": "none",
              "padding-left": "var(--space-4)",
              "padding-right": "var(--space-4)",
              "margin": 0 as const,
              "outline": 0 as const,
              "box-shadow": "0 0 0 1px var(--gray-a6)",
              "width": "44ch",
              "max-width": "100%"
            }} aria-label="Install native icons package from npm" class={styles.InstallCommand} />
						</Flex>
					</Container>
				</Section>
			</Box>
		</>;
};
type LineProps = {
  angle?: string;
  offset?: string;
  color?: string;
};
const Line = (p: LineProps) => {
  return <Box style={{
    "position": "absolute",
    "top": 0 as const,
    "left": 0 as const,
    "width": "calc(200vw + 200vh)",
    "height": "1px",
    "transform": `translate(${p.offset ?? "0px, 0px"}) rotate(${p.angle ?? "0deg"}) translate(-50%, -50%)`,
    "transform-origin": "top left",
    "background-color": p.color
  }} />;
};
