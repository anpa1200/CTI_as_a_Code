# SEO fixes

## 2026-08-14

### Issue 4 — Docusaurus metadata

- Centralized the site-wide title suffix as `{Page Title} | 1200km` while retaining `CTI as a Code` as the product and navbar title.
- Replaced the generic logo social card with `img/cti-cover.png`.
- Added `og:site_name` with the ecosystem-wide `1200km — Andrey Pautov Security Research` value.
- Added unique, complete 140–160 character descriptions to every page that previously relied on an undersized or oversized generated excerpt.
- Enabled Git-derived last-update metadata and emit `article:modified_time` only when Docusaurus supplies a source-backed timestamp.
- Enabled date-only sitemap `<lastmod>` output and configured the deployment checkout to retain full Git history, so route dates remain evidence-backed in CI.
- Added support for `article:published_time` only when a document explicitly supplies a valid `date` frontmatter value; no publication dates were invented.
- Added page-specific Twitter title and description metadata for all docs and custom pages, matching the document title and canonical description.

### Issue 7 — HexStrike repository identity

- Relabeled every `0x4m4/hexstrike-ai` link as `HexStrike AI (upstream project)`.
- Added and labeled `anpa1200/Hexstrike-AI` separately as `Andrey Pautov's HexStrike AI fork`.

### Issues 8 and 9 — dates and breadcrumbs

- Added fail-closed Git-derived sitemap dates for the homepage and three custom intake routes; all documentation dates remain Docusaurus/Git-derived.
- Added a valid `BreadcrumbList` to the four custom pages and a fallback structured breadcrumb for documentation routes that are intentionally absent from the navigation sidebar.

### Validation

- Production build completed successfully for 39 routes.
- All 39 routes render one `{Page Title} | 1200km` suffix, matching Open Graph and Twitter titles, canonical URLs, the CTI cover social image, and the required Open Graph site name.
- All 39 descriptions are unique, 140–160 characters, complete sentences, absent from their page titles, and identical to their Open Graph and Twitter descriptions.
- All 35 documentation routes emit valid Git-backed `article:modified_time` timestamps. The homepage and three interactive intake forms are not article documents and do not claim publication dates.
- The sitemap emits 39 source-backed `<lastmod>` values for 39 routes, including all four custom routes.
- All 39 routes emit a valid `BreadcrumbList`.
- The build still reports pre-existing broken-link warnings in the CelltronX case study and ecosystem guide. Those route repairs are outside Issues 4 and 7 and were not changed here.

## Exact touched-file manifest

This manifest lists all 41 changed files reported by `git status --porcelain=v1 --untracked-files=all`, once each under its primary issue.

### Issue 4 — 32 files

- `docs-site/docs/architecture.md` — modified.
- `docs-site/docs/celltronx-proactive-case-study.md` — modified.
- `docs-site/docs/cti-as-a-code-methodology.md` — modified.
- `docs-site/docs/integrations/opencti-thehive.md` — modified.
- `docs-site/docs/lifetech-pharma-case-study.md` — modified.
- `docs-site/docs/methodology.md` — modified.
- `docs-site/docs/prerequisites.md` — modified.
- `docs-site/docs/proactive-walkthrough.md` — modified.
- `docs-site/docs/quick-start.md` — modified.
- `docs-site/docs/services/elastic-siem.md` — modified.
- `docs-site/docs/services/elasticsearch.md` — modified.
- `docs-site/docs/services/opencti.md` — modified.
- `docs-site/docs/setup/cortex-setup.md` — modified.
- `docs-site/docs/setup/first-run.md` — modified.
- `docs-site/docs/setup/opencti-setup.md` — modified.
- `docs-site/docs/setup/thehive-setup.md` — modified.
- `docs-site/docs/training/01-reactive-lifetech.md` — modified.
- `docs-site/docs/training/02-proactive-celltronx.md` — modified.
- `docs-site/docs/training/03-full-cycle-techpay.md` — modified.
- `docs-site/docs/training/04-emulation-techpay.md` — modified.
- `docs-site/docs/training/05-reactive-ndsa.md` — modified.
- `docs-site/docs/training/06-proactive-govid2.md` — modified.
- `docs-site/docs/training/07-full-cycle-ndsa.md` — modified.
- `docs-site/docs/training/08-emulation-ndsa.md` — modified.
- `docs-site/docs/training/index.md` — modified.
- `docs-site/docs/workflows/fullcycle-program.md` — modified.
- `docs-site/docs/workflows/ioc-triage.md` — modified.
- `docs-site/docs/workflows/proactive-assessment.md` — modified.
- `docs-site/docs/workflows/reactive-investigation.md` — modified.
- `docs-site/docs/workflows/threat-actor-research.md` — modified.
- `docs-site/docusaurus.config.js` — modified.
- `docs-site/src/theme/DocItem/Metadata/index.js` — new.

### Issue 7 — 2 files

- `docs-site/docs/ecosystem.md` — modified.
- `docs-site/docs/intro.md` — modified.

### Issue 8 — 1 file

- `.github/workflows/deploy.yml` — modified.

### Issue 9 — 5 files

- `docs-site/src/pages/index.js` — modified.
- `docs-site/src/pages/intake-form.jsx` — modified.
- `docs-site/src/pages/intake-fullcycle.jsx` — modified.
- `docs-site/src/pages/intake-proactive.jsx` — modified.
- `docs-site/src/theme/DocBreadcrumbs/index.js` — new.

### All issues — 1 file

- `SEO-FIXES.md` — new.

Manifest total: **41 files**.
