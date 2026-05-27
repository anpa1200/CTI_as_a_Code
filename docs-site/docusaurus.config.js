// @ts-check
const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CTI Lab',
  tagline: 'Full Linux CTI Lab — OpenCTI · TheHive · Cortex · Elastic SIEM',
  favicon: 'img/favicon.ico',

  url: 'https://anpa1200.github.io',
  baseUrl: '/cti-lab/',

  organizationName: 'anpa1200',
  projectName: 'CTI-lab',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
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
          editUrl: 'https://github.com/anpa1200/CTI-lab/edit/main/docs-site/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: {
          trackingID: 'G-TMTG21RVHM',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'CTI Lab',
        logo: {
          alt: 'CTI Lab',
          src: 'img/logo.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'labSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            href: 'https://anpa1200.github.io',
            label: 'Portfolio',
            position: 'right',
          },
          {
            href: 'https://github.com/anpa1200/CTI-lab',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Lab',
            items: [
              { label: 'Quick Start', to: '/quick-start' },
              { label: 'Architecture', to: '/architecture' },
              { label: 'Services', to: '/services/elasticsearch' },
            ],
          },
          {
            title: 'Workflows',
            items: [
              { label: 'IOC Triage', to: '/workflows/ioc-triage' },
              { label: 'Threat Actor Research', to: '/workflows/threat-actor-research' },
            ],
          },
          {
            title: 'Links',
            items: [
              { label: 'Portfolio', href: 'https://anpa1200.github.io' },
              { label: 'GitHub', href: 'https://github.com/anpa1200/CTI-lab' },
              { label: 'Medium', href: 'https://medium.com/@anpa1200' },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} Andrey Pautov`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
        additionalLanguages: ['bash', 'yaml', 'json', 'python', 'hocon'],
      },
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
    }),
};

module.exports = config;
