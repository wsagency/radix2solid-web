import { Box, Button, Card, Code, Container, Flex, Grid, Heading, Link, Section, Text, Theme } from '@wsagency/radix2solid-themes';
import { Header } from '../components/header';
import { MarketingMobileMenu } from '../components/marketing-mobile-menu';
import { DocumentNavigation } from '../components/navigation';
import { SearchTrigger } from '../components/search';
import { useSiteContext } from '../components/site-context';
import { HeroCodeBlock } from '../components/hero-code-block';
import { chartFamilies } from '../components/chart-previews';
import { Footer } from '../components/footer';
import ChartsDemo from '../demos/charts/index';

const sources = import.meta.glob<string>('../demos/charts/**/*.{tsx,css,cjs}', { query: '?raw', import: 'default', eager: true });
const gitHubLink = 'https://github.com/wsagency/radix2solid';

export default function ChartsPage() {
  const site = useSiteContext();
  return <Theme accentColor="indigo" grayColor="slate" class="radix-themes-custom-fonts">
    <MarketingMobileMenu header={<Header gitHubLink={gitHubLink} />} githubLink={gitHubLink}>
      <Box mb="4"><SearchTrigger /></Box>
      <nav class="document-navigation" aria-label="Resources" onClick={event => { if ((event.target as Element).closest('a')) site.setMobileOpen(false); }}>
        <a href="/charts">Homepage</a><a href="/blog">Blog</a>
      </nav>
      <DocumentNavigation path="/charts" onNavigate={() => site.setMobileOpen(false)} />
    </MarketingMobileMenu>
    <Header gitHubLink={gitHubLink} ghost />
    <Container mx={{ initial: '5', xs: '6', sm: '7', md: '9' }}>
      <Section size={{ initial: '2', md: '3' }}>
        <Grid columns={{ initial: '1', md: '2' }} gap="7" align="center">
          <Box>
            <Heading as="h1" size={{ initial: '8', md: '9' }} mb="4">Charts for Solid 2</Heading>
            <Text as="p" size="4" color="gray" mb="5">A native Solid 2 port of the Recharts component model: composable SVG charts whose colors take any CSS value. These examples pass Themes tokens such as <Code>var(--accent-9)</Code>, so their colors follow the accent and dark mode of the surrounding Theme.</Text>
            <Flex gap="3" wrap="wrap" mb="5">
              <Button asChild size="3">{target => target('a', { href: '/charts/docs/overview/getting-started', children: 'Get started' })}</Button>
              <Button asChild size="3" variant="soft">{target => target('a', { href: '/charts/docs/overview/introduction', children: 'Introduction' })}</Button>
              <Button asChild size="3" variant="soft" color="gray">{target => target('a', { href: 'https://www.npmjs.com/package/@wsagency/radix2solid-charts/v/0.1.0-rc.4', target: '_blank', rel: 'noopener noreferrer', children: 'View on npm' })}</Button>
            </Flex>
            <Text as="p" size="2" color="gray">Charts is published on npm as <Code>0.1.0-rc.4</Code> (release candidate, dist-tag <Code>next</Code>). Install it with <Code>pnpm add -E @wsagency/radix2solid-charts@0.1.0-rc.4</Code>; the npm <Code>latest</Code> tag still points to rc.2, so pin the version. The <Link href="/charts/docs/overview/releases">selected A1–A13 and B1/B2 adaptations</Link> add Legend placement, automatic XAxis height, and Sankey accessibility—not full Recharts 3.10.1 parity, CartesianGrid theme support, or canary APIs. Derived from <Link href="https://github.com/yumemi-thomas/solid-recharts" target="_blank" rel="noopener noreferrer">solid-recharts</Link> and <Link href="https://github.com/recharts/recharts" target="_blank" rel="noopener noreferrer">Recharts</Link> (MIT); neither project endorses this fork.</Text>
          </Box>
          <Box class="hero-demo" data-search-exclude data-md-exclude><Theme appearance="light"><Flex justify="center" p="5"><ChartsDemo /></Flex></Theme></Box>
        </Grid>
        <Box mt="6"><HeroCodeBlock folder="Charts" sources={sources} /></Box>
      </Section>
      <Section size="2" pt="0">
        <Heading as="h2" size="7" mb="5" id="chart-families">Chart families</Heading>
        <Grid columns={{ initial: '1', sm: '2', lg: '3' }} gap="4">
          {Object.entries(chartFamilies).map(([slug, family]) => <Card asChild size="2">{target => target('a', {
            href: `/charts/docs/components/${slug}`,
            children: <><Heading as="h3" size="4" mb="3">{family.title}</Heading><Box data-md-exclude>{family.render(180)}</Box></>
          })}</Card>)}
        </Grid>
      </Section>
      <Section size="2" pt="0"><Footer /></Section>
    </Container>
  </Theme>;
}
