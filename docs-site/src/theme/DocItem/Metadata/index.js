import React from 'react';
import {PageMetadata} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/plugin-content-docs/client';

function isoDate(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export default function DocItemMetadata() {
  const {metadata, frontMatter, assets} = useDoc();
  const publishedTime = isoDate(frontMatter.date);
  const modifiedTime = metadata.lastUpdatedAt
    ? isoDate(metadata.lastUpdatedAt)
    : undefined;
  const socialTitle = `${metadata.title} | 1200km`;

  return (
    <PageMetadata
      title={metadata.title}
      description={metadata.description}
      keywords={frontMatter.keywords}
      image={assets.image ?? frontMatter.image}
    >
      <meta name="twitter:title" content={socialTitle} />
      <meta name="twitter:description" content={metadata.description} />
      <meta property="og:type" content="article" />
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
    </PageMetadata>
  );
}
