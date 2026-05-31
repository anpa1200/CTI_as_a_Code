// @ts-check
const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CTI as a Code',
  tagline: 'Version-controlled CTI methodology. Evidence-traced analysis. Deployable detections.',
  favicon: 'img/ap-logo.png',

  url: 'https://anpa1200.github.io',
  baseUrl: '/CTI_as_a_Code/',

  organizationName: 'anpa1200',
  projectName: 'CTI_as_a_Code',
  deploymentBranch: 'gh-pages',
  trailingSlash: true,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

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
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
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
              { label: 'CTI as a Code', href: 'https://anpa1200.github.io/CTI_as_a_Code/' },
              { label: 'Operation Desert Hydra', href: 'https://anpa1200.github.io/operation-desert-hydra/' },
              { label: 'CTI Analyst Field Manual', href: 'https://anpa1200.github.io/cti-analyst-field-manual/' },
              { label: 'Customer-Driven AI CTI', href: 'https://anpa1200.github.io/customer-driven-ai-cti-project/' },
              { label: 'Israel Threat Actors CTI', href: 'https://anpa1200.github.io/israel-government-threat-actors-cti/' },
              { label: 'HexStrike AI', href: 'https://github.com/0x4m4/hexstrike-ai' },
            ],
          },
          { href: 'https://medium.com/@1200km', label: 'Medium', position: 'right' },
          { href: 'https://github.com/anpa1200/CTI_as_a_Code', label: 'GitHub', position: 'right' },
          { href: 'https://anpa1200.github.io/', label: 'All Projects', position: 'right', className: 'navbar-portfolio-btn' },
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
              { label: 'Operation Desert Hydra', href: 'https://anpa1200.github.io/operation-desert-hydra/' },
              { label: 'CTI Analyst Field Manual', href: 'https://anpa1200.github.io/cti-analyst-field-manual/' },
              { label: 'Customer-Driven AI CTI', href: 'https://anpa1200.github.io/customer-driven-ai-cti-project/' },
              { label: 'Israel Threat Actors CTI', href: 'https://anpa1200.github.io/israel-government-threat-actors-cti/' },
              { label: 'HexStrike AI', href: 'https://github.com/0x4m4/hexstrike-ai' },
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

module.exports = config;
