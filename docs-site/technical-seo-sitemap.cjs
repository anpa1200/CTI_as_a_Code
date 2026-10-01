// Filter during native sitemap generation, avoiding concurrent postBuild races.
const policy = require('./src/theme/Root/seo-policy.json');
module.exports = config => {
  for (const preset of config.presets || []) {
    if (!Array.isArray(preset) || !String(preset[0]).includes('classic')) continue;
    const options = preset[1];
    if (options.sitemap === false) continue;
    const previous = options.sitemap || {};
    options.sitemap = {...previous, priority: null, changefreq: null, lastmod: policy.gitHistory ? 'date' : null,
      createSitemapItems: async params => {
        const items = previous.createSitemapItems ? await previous.createSitemapItems(params) : await params.defaultCreateSitemapItems(params);
        return items.filter(item => !['Thin','Excluded'].includes(policy.pages[new URL(item.url).pathname]?.classification)).map(item => ({...item,priority:null,changefreq:null}));
      }
    };
  }
  return config;
};
