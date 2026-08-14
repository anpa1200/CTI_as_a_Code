import React from 'react';
import Head from '@docusaurus/Head';
import OriginalDocBreadcrumbs from '@theme-original/DocBreadcrumbs';
import {
  useDoc,
  useSidebarBreadcrumbs,
} from '@docusaurus/plugin-content-docs/client';

export default function DocBreadcrumbs() {
  const breadcrumbs = useSidebarBreadcrumbs();
  const {metadata} = useDoc();
  if (breadcrumbs) return <OriginalDocBreadcrumbs />;

  const canonical = new URL(metadata.permalink, 'https://1200km.com').href;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: '1200km', item: 'https://1200km.com/'},
      {'@type': 'ListItem', position: 2, name: 'CTI as a Code', item: 'https://1200km.com/CTI_as_a_Code/'},
      {'@type': 'ListItem', position: 3, name: metadata.title, item: canonical},
    ],
  };

  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Head>
  );
}
