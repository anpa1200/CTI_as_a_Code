const applyTechnicalSitemap = require('./technical-seo-sitemap.cjs');
// @ts-check
const { themes } = require('prism-react-renderer');
const {execFileSync} = require('node:child_process');

function gitLastModifiedDate(relativePath) {
  try {
    const value = execFileSync('git', ['log', '-1', '--format=%cs', '--', relativePath], {
      cwd: __dirname,
      encoding: 'utf8',
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

const customPageSources = new Map([
  ['https://1200km.com/CTI_as_a_Code/', 'src/pages/index.js'],
  ['https://1200km.com/CTI_as_a_Code/intake-form/', 'src/pages/intake-form.jsx'],
  ['https://1200km.com/CTI_as_a_Code/intake-proactive/', 'src/pages/intake-proactive.jsx'],
  ['https://1200km.com/CTI_as_a_Code/intake-fullcycle/', 'src/pages/intake-fullcycle.jsx'],
]);

const customPageLastmods = new Map(
  [...customPageSources].map(([url, sourcePath]) => [url, gitLastModifiedDate(sourcePath)]),
);

/** @type {import('@docusaurus/types').Config} */
const config = {
  plugins: ['./technical-seo-plugin.cjs'],
  // Page titles are formatted centrally as "{Page Title} | 1200km".
  // The product name remains explicit in the navbar and page content below.
  title: '1200km',
  titleDelimiter: '|',
  tagline: 'Version-controlled CTI methodology. Evidence-traced analysis. Deployable detections.',
  favicon: 'img/ap-logo.png',

  url: 'https://1200km.com',
  baseUrl: '/CTI_as_a_Code/',

  scripts: [{src: 'https://1200km.com/assets/docusaurus-ecosystem.js?v=20260614-3', defer: true}],
  organizationName: 'anpa1200',
  projectName: 'CTI_as_a_Code',

  deploymentBranch: 'gh-pages',
  trailingSlash: true,

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          editUrl: 'https://github.com/anpa1200/CTI_as_a_Code/edit/main/docs-site/',
          showLastUpdateTime: true,
        },
        blog: false,
        sitemap: {
          lastmod: 'date',
          createSitemapItems: async ({defaultCreateSitemapItems, ...params}) => {
            const items = await defaultCreateSitemapItems(params);
            return items.map((item) => {
              const lastmod = customPageLastmods.get(item.url);
              return lastmod ? {...item, lastmod: item.lastmod || lastmod} : item;
            });
          },
        },
        gtag: {trackingID: 'G-TMTG21RVHM', anonymizeIP: true},
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/cti-cover.png',
      metadata: [
        {
          property: 'og:site_name',
          content: '1200km — Andrey Pautov Security Research',
        },
        {
          name: 'keywords',
          content: 'CTI as a code, version-controlled CTI, CTI methodology, structured threat intelligence, CTI templates, evidence-traced analysis, deployable detections, CTI workflow, MITRE ATT&CK, CTI-to-detection',
        },
      ],
      navbar: {
        title: 'CTI as a Code',
        logo: {
          alt: '1200km',
          src: 'img/ap-logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'labSidebar',
            position: 'left',
            label: 'Lab',
          },
          {
            label: 'Methodology',
            position: 'left',
            items: [
              { label: 'Reference Guide', to: '/methodology' },
              { label: 'Step-by-Step (Full)', to: '/cti-as-a-code-methodology' },
              { label: 'Proactive Walkthrough', to: '/proactive-walkthrough' },
            ],
          },
          {
            type: 'docSidebar',
            sidebarId: 'trainingSidebar',
            position: 'left',
            label: 'Training',
          },
          {
            to: '/ecosystem',
            label: 'Ecosystem',
            position: 'left',
          },
          {
            label: 'Intake Forms',
            position: 'left',
            items: [
              { label: 'Reactive Investigation', to: '/intake-form' },
              { label: 'Proactive Assessment', to: '/intake-proactive' },
              { label: 'Full-Cycle Program', to: '/intake-fullcycle' },
            ],
          },
          {
            label: 'Projects',
            position: 'right',
            items: [
              { label: 'CTI as a Code', href: 'https://1200km.com/CTI_as_a_Code/' },
              { label: 'Operation Desert Hydra', href: 'https://1200km.com/operation-desert-hydra/' },
              { label: 'CTI Analyst Field Manual', href: 'https://1200km.com/cti-analyst-field-manual/' },
              { label: 'Customer-Driven AI CTI', href: 'https://1200km.com/customer-driven-ai-cti-project/' },
              { label: 'Israel Threat Actors CTI', href: 'https://1200km.com/israel-government-threat-actors-cti/' },
              { label: 'AI vs Defense', href: 'https://1200km.com/ai-vs-defense/' },
              { label: 'HexStrike AI (upstream project)', href: 'https://github.com/0x4m4/hexstrike-ai' },
              { label: "Andrey Pautov's HexStrike AI fork", href: 'https://github.com/anpa1200/Hexstrike-AI' },
            ],
          },
          { href: 'https://medium.com/@1200km', label: 'Medium', position: 'right' },
          { href: 'https://github.com/anpa1200/CTI_as_a_Code', label: 'GitHub', position: 'right' },
          { href: 'https://1200km.com/', label: 'Main Page', position: 'right', className: 'navbar-portfolio-btn' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Lab',
            items: [
              { label: 'Methodology', to: '/methodology' },
              { label: 'Step-by-Step Guide', to: '/cti-as-a-code-methodology' },
              { label: 'Quick Start', to: '/quick-start' },
              { label: 'Architecture', to: '/architecture' },
              { label: 'Services', to: '/services/elasticsearch' },
              { label: 'Workflows', to: '/workflows/ioc-triage' },
            ],
          },
          {
            title: 'Training',
            items: [
              { label: 'All Assignments', to: '/training' },
              { label: 'A01 — Reactive IR', to: '/training/reactive-lifetech' },
              { label: 'A04 — Adversary Emulation', to: '/training/emulation-techpay' },
              { label: 'A08 — Gov Emulation', to: '/training/emulation-ndsa' },
            ],
          },
          {
            title: 'Ecosystem',
            items: [
              { label: 'Operation Desert Hydra', href: 'https://1200km.com/operation-desert-hydra/' },
              { label: 'CTI Analyst Field Manual', href: 'https://1200km.com/cti-analyst-field-manual/' },
              { label: 'Customer-Driven AI CTI', href: 'https://1200km.com/customer-driven-ai-cti-project/' },
              { label: 'Israel Threat Actors CTI', href: 'https://1200km.com/israel-government-threat-actors-cti/' },
              { label: 'AI vs Defense', href: 'https://1200km.com/ai-vs-defense/' },
              { label: 'HexStrike AI (upstream project)', href: 'https://github.com/0x4m4/hexstrike-ai' },
              { label: "Andrey Pautov's HexStrike AI fork", href: 'https://github.com/anpa1200/Hexstrike-AI' },
            ],
          },
          {
            title: 'Author',
            items: [
              { label: 'Medium', href: 'https://medium.com/@1200km' },
              { label: 'GitHub', href: 'https://github.com/anpa1200' },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/andrey-pautov/' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Andrey Pautov. CTI as a Code — defensive methodology lab and training.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
        additionalLanguages: ['bash', 'yaml', 'json', 'python'],
      },
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
    }),
};

applyTechnicalSitemap(config);
module.exports = config;
