// 1200km technical SEO overlay: SSR and client navigation use the same metadata.
import React from 'react';
import Head from '@docusaurus/Head';
import {useLocation} from '@docusaurus/router';
import model from './seo-policy.json';
export default function Root({children}) {
  const {pathname} = useLocation();
  const entry = model.pages[pathname];
  const canonical = 'https://1200km.com' + pathname;
  const parents = Object.keys(model.pages).filter(path => path !== pathname && pathname.startsWith(path) && path.endsWith('/') && model.pages[path].classification !== 'Excluded').sort((a,b) => a.length-b.length);
  const trail = ['/', ...parents.filter(path => path !== '/'), pathname].filter((path, i, all) => all.indexOf(path) === i);
  const graph = { '@context': 'https://schema.org', '@graph': [model.person, model.website, {
    '@type': 'BreadcrumbList', '@id': canonical + '#breadcrumb',
    itemListElement: trail.map((path, i) => ({ '@type': 'ListItem', position: i + 1, name: path === '/' ? 'Home' : (model.pages[path]?.title || path.split('/').filter(Boolean).pop()).replace(/ \| 1200km$/, ''), item: 'https://1200km.com' + path })),
  }, ...(entry?.article ? [entry.article] : []), ...(entry?.howTo ? [entry.howTo] : [])] };
  const active = entry?.title && entry.classification !== 'Excluded';
  return <>{children}{entry?.links?.length > 0 && <section className="container margin-vert--lg" data-seo-related aria-label="Related research"><h2>Related research</h2><ul>{entry.links.map(link => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul></section>}<Head titleTemplate="%s" htmlAttributes={{lang: 'en'}}>
    {active && <title>{entry.title}</title>}
    {active && <meta name="description" content={entry.description} />}
    {active && <meta property="og:title" content={entry.title} />}
    {active && <meta property="og:description" content={entry.description} />}
    {active && <meta name="twitter:title" content={entry.title} />}
    {active && <meta name="twitter:description" content={entry.description} />}
    {active && <meta name="robots" content={entry.classification === 'Thin' ? 'noindex,follow' : 'index,follow,max-image-preview:large'} />}
    {!active && (entry?.classification === 'Thin' || entry?.canonical || pathname.endsWith('/404.html')) && <meta name="robots" content="noindex,follow" />}
    {entry?.canonical && <link rel="canonical" href={entry.canonical} />}
    {entry?.canonical && <meta property="og:url" content={entry.canonical} />}
    {entry?.article?.datePublished && <meta property="article:published_time" content={entry.article.datePublished} />}
    {entry && <script type="application/ld+json" id="technical-seo-shared-graph">{JSON.stringify(graph).replace(/</g, '\u003c')}</script>}
  </Head></>;
}
