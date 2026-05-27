/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  labSidebar: [
    { type: 'doc', id: 'intro', label: 'Introduction' },
    { type: 'doc', id: 'architecture', label: 'Architecture' },
    { type: 'doc', id: 'prerequisites', label: 'Prerequisites' },
    { type: 'doc', id: 'quick-start', label: 'Quick Start' },
    { type: 'doc', id: 'ecosystem', label: 'Ecosystem' },
    {
      type: 'category',
      label: 'Services',
      collapsed: false,
      items: [
        'services/elasticsearch',
        'services/opencti',
        'services/thehive-cortex',
        'services/elastic-siem',
      ],
    },
    {
      type: 'category',
      label: 'First-Run Setup',
      items: [
        'setup/first-run',
        'setup/opencti-setup',
        'setup/thehive-setup',
        'setup/cortex-setup',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      items: [
        'integrations/opencti-thehive',
        'integrations/threat-feeds',
      ],
    },
    {
      type: 'category',
      label: 'Workflows',
      items: [
        'workflows/ioc-triage',
        'workflows/threat-actor-research',
      ],
    },
  ],

  trainingSidebar: [
    { type: 'doc', id: 'training/index', label: 'Training Overview' },
    {
      type: 'category',
      label: 'Private Sector (A01–A04)',
      collapsed: false,
      items: [
        'training/reactive-lifetech',
        'training/proactive-celltronx',
        'training/full-cycle-techpay',
        'training/emulation-techpay',
      ],
    },
    {
      type: 'category',
      label: 'Government Narrative Arc (A05–A08)',
      collapsed: false,
      items: [
        'training/reactive-ndsa',
        'training/proactive-govid2',
        'training/full-cycle-ndsa',
        'training/emulation-ndsa',
      ],
    },
  ],
};

module.exports = sidebars;
