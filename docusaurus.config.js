// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'MetoSim',
  tagline: 'Cloud-native simulation for nanophotonics and meta-optics',
  favicon: 'img/favicon.ico',

  url: 'https://docs.metosim.com',
  baseUrl: '/',

  organizationName: 'timetravel1408',
  projectName: 'metosim-docs',
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
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
          editUrl: 'https://github.com/timetravel1408/metosim-docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/metosim-social.png',

      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },

      navbar: {
        title: 'MetoSim',
        logo: {
          alt: 'MetoSim Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Documentation',
          },
          {
            to: '/api/overview',
            label: 'API Reference',
            position: 'left',
          },
          {
            to: '/tutorials/first-simulation',
            label: 'Tutorials',
            position: 'left',
          },
          {
            to: '/sdk/python',
            label: 'SDKs',
            position: 'left',
          },
          {
            href: 'https://github.com/timetravel1408/metosim',
            label: 'GitHub',
            position: 'right',
          },
          {
            href: 'https://metosim.com',
            label: 'Get API Key',
            position: 'right',
            className: 'navbar-cta',
          },
        ],
      },

      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              { label: 'Introduction', to: '/' },
              { label: 'Quick Start', to: '/quickstart' },
              { label: 'API Reference', to: '/api/overview' },
            ],
          },
          {
            title: 'Platform',
            items: [
              { label: 'Architecture', to: '/platform/architecture' },
              { label: 'Simulation Engine', to: '/platform/simulation-engine' },
              { label: 'Inverse Design', to: '/platform/inverse-design' },
              { label: 'MetoFab', to: '/platform/metofab' },
            ],
          },
          {
            title: 'Resources',
            items: [
              { label: 'Tutorials', to: '/tutorials/first-simulation' },
              { label: 'Research', to: '/research/metamaterials' },
              { label: 'Benchmarks', to: '/research/benchmarks' },
            ],
          },
          {
            title: 'More',
            items: [
              { label: 'GitHub', href: 'https://github.com/timetravel1408/metosim' },
              { label: 'MetoSim Platform', href: 'https://metosim.com' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} MetoSim — Dr. Abhishek Kumar & Kishan`,
      },

      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
        additionalLanguages: ['python', 'bash', 'json', 'yaml', 'docker'],
      },

      algolia: undefined, // Add Algolia DocSearch later
    }),
};

module.exports = config;
