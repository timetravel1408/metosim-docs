/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'doc',
      id: 'introduction',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'quickstart',
      label: 'Quick Start',
    },
    {
      type: 'category',
      label: 'Platform',
      collapsed: false,
      items: [
        'platform/architecture',
        'platform/simulation-engine',
        'platform/inverse-design',
        'platform/metofab',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      collapsed: false,
      items: [
        'api/overview',
        'api/authentication',
        'api/simulation-api',
        'api/inverse-design-api',
        'api/fabrication-api',
      ],
    },
    {
      type: 'category',
      label: 'Tutorials',
      collapsed: false,
      items: [
        'tutorials/first-simulation',
        'tutorials/metamaterial-design',
        'tutorials/fabrication-workflow',
      ],
    },
    {
      type: 'category',
      label: 'SDKs',
      collapsed: false,
      items: [
        'sdk/python',
        'sdk/javascript',
      ],
    },
    {
      type: 'category',
      label: 'Research',
      collapsed: true,
      items: [
        'research/metamaterials',
        'research/benchmarks',
      ],
    },
  ],
};

module.exports = sidebars;
