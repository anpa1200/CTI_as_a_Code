import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

const assignments = [
  {
    id: 'A01',
    type: 'reactive',
    label: 'Reactive',
    title: 'LifeTech Pharma — Targeted Intrusion',
    body: 'Reconstruct a 52-hour Iranian-nexus kill chain from zero coverage. DCSync, AiTM session bypass, 2.4 GB R&D exfiltration. Write four Sigma rules from scratch.',
    href: '/training/reactive-lifetech',
  },
  {
    id: 'A02',
    type: 'proactive',
    label: 'Proactive',
    title: 'CelltronX — Nation-State Telecom Targeting',
    body: 'Four threat triggers converge on the same contractor access path. Build crown jewels analysis, attack scenarios, and a detection backlog before anything happens.',
    href: '/training/proactive-celltronx',
  },
  {
    id: 'A03',
    type: 'full-cycle',
    label: 'Full Cycle',
    title: 'TechPay — CTI Program from Scratch',
    body: 'Near-miss incident, departing CTI lead, lapsed CERT-IL MOU, BoI-CD 362 compliance gap. Build the PIR framework, collection plan, and governance from zero.',
    href: '/training/full-cycle-techpay',
  },
  {
    id: 'A04',
    type: 'emulation',
    label: 'Emulation',
    title: 'TechPay — Operation Desert Cipher Validation',
    body: 'Extract TTPs from an Iranian-nexus campaign report, write an 11-module emulation plan, execute, score PASS/PARTIAL/FAIL, and produce a BoI-CD 362 compliance report.',
    href: '/training/emulation-techpay',
  },
  {
    id: 'A05',
    type: 'reactive',
    label: 'Reactive (Gov)',
    title: 'NDSA — Contractor Breach, 340K Biometric Records',
    body: '36-hour government breach via AiTM phishing and contractor VPN abuse. Regulatory notifications to INCD and the Biometric Database Authority. Five Sigma rules derived from the 16-event timeline.',
    href: '/training/reactive-ndsa',
  },
  {
    id: 'A06',
    type: 'proactive',
    label: 'Proactive (Gov)',
    title: 'GovID 2.0 — National Auth System Pre-Launch',
    body: 'Active adversary probing 72 hours before a national biometric system goes live. Four converging triggers. Go / no-go recommendation for the CISO and Director General.',
    href: '/training/proactive-govid2',
  },
  {
    id: 'A07',
    type: 'full-cycle',
    label: 'Full Cycle (Gov)',
    title: 'NDSA — Post-Breach CTI Program Under INCD Mandate',
    body: 'INCD Remediation Directive requires a formal program in 12 months. Build PIRs, a CERT-IL MOU, a collection plan with 7 gaps, and 8 measurable INCD compliance milestones.',
    href: '/training/full-cycle-ndsa',
  },
  {
    id: 'A08',
    type: 'emulation',
    label: 'Emulation (Gov)',
    title: 'NDSA — INCD Section 8 Detection Validation',
    body: '15 TTPs from the A05 breach and A06 threat assessment. 11-module exercise: 6 PASS, 2 PARTIAL, 3 FAIL. Compliance report with HavayaIT vendor security requirements notice.',
    href: '/training/emulation-ndsa',
  },
];

const stack = [
  ['OpenCTI', 'Threat intelligence platform — STIX2 actors, TTPs, IOC graph', 'http://localhost:8080'],
  ['TheHive 5', 'Incident response case management — alerts, cases, observables', 'http://localhost:9100'],
  ['Cortex', 'Automated enrichment — analyzers and responders on observables', 'http://localhost:9002'],
  ['Kibana / SIEM', 'Detection dashboards, alert triage, timeline investigation', 'http://localhost:5601'],
  ['Elasticsearch 8', 'Shared data store for all services', 'http://localhost:9200'],
  ['Logstash', 'Log ingestion pipeline — Beats, syslog, custom inputs', 'http://localhost:5044'],
];

const ecosystem = [
  {
    title: 'CTI Analyst Field Manual',
    body: 'Tradecraft standard. Evidence discipline, analytic judgment, attribution, infrastructure pivoting, CTI-to-detection foundations, and templates. Use this for the reasoning methodology behind every assignment.',
    href: 'https://anpa1200.github.io/cti-analyst-field-manual/',
  },
  {
    title: 'Customer-Driven AI CTI Project',
    body: 'Delivery methodology. AI-assisted project phases, quality gates, customer outcomes, and acceptance criteria. Use this when CTI work must become a managed customer engagement.',
    href: 'https://anpa1200.github.io/customer-driven-ai-cti-project/',
  },
  {
    title: 'Israel Government Threat Actors CTI',
    body: 'Sector knowledge base. Israeli public-sector threat model, actors, TTPs, detections, and evidence registers. Directly underpins the NDSA narrative arc in A05–A08.',
    href: 'https://anpa1200.github.io/israel-government-threat-actors-cti/',
  },
  {
    title: 'HexStrike AI',
    body: 'AI-powered offensive security platform. MCP agent orchestration, 150+ security tools, adversarial validation. Use this to validate detection coverage built in A04 and A08.',
    href: 'https://github.com/0x4m4/hexstrike-ai',
  },
];

export default function Home() {
  return (
    <Layout
      title="CTI as a Code"
      description="Version-controlled CTI methodology, evidence-traced analysis, and deployable detections. Docker Compose lab stack and 8 structured training assignments."
    >
      <header className="hero hero--lab">
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="hero__title">CTI as a Code</h1>
          <p className="hero__subtitle">
            Version-controlled CTI methodology. Evidence-traced analysis. Deployable detections.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="button button--primary button--lg" to="/training">
              Start Training
            </Link>
            <Link className="button button--secondary button--lg" to="/quick-start">
              Set Up the Lab
            </Link>
          </div>
          <img
            src={useBaseUrl('/img/cti-cover.png')}
            alt="CTI as a Code — version-controlled workflow from evidence collection to Sigma rule"
            style={{
              marginTop: '2.5rem',
              maxWidth: '960px',
              width: '100%',
              borderRadius: '14px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      </header>

      <main>
        {/* What is CTI as a Code */}
        <section className="lab-section">
          <div className="container">
            <h2>What is CTI as a Code?</h2>
            <p>
              CTI as a Code treats threat intelligence investigations like software engineering projects:
              version-controlled, template-driven, evidence-traced, and reproducible. Every claim maps
              to a source. Every detection candidate ships as a Sigma rule. Every exercise produces a
              compliance-grade audit trail.
            </p>
            <p>
              This project provides two things: a <strong>Docker Compose lab stack</strong> (OpenCTI,
              TheHive, Cortex, Elastic SIEM) for hands-on investigation practice, and <strong>8
              structured training assignments</strong> covering all three CTI operational modes —
              reactive, proactive, and full-cycle — plus adversary emulation for detection validation.
            </p>
            <p>
              For the underlying analytic tradecraft, see the{' '}
              <a href="https://anpa1200.github.io/cti-analyst-field-manual/">CTI Analyst Field Manual</a>.
              For the Israeli government threat context behind A05–A08, see{' '}
              <a href="https://anpa1200.github.io/israel-government-threat-actors-cti/">Israel Government Threat Actors CTI</a>.
            </p>
          </div>
        </section>

        {/* Training assignments */}
        <section className="lab-section">
          <div className="container">
            <h2>8 Training Assignments</h2>
            <p>
              Assignments 1–4 are set in the Israeli private sector. Assignments 5–8 form a connected
              government narrative arc: a breach (A05) → pre-launch threat (A06) → program build (A07)
              → detection validation (A08). Each assignment contains a project brief, synthetic evidence
              data, distributed analytical files, and a worked solution.
            </p>
            <div className="lab-grid">
              {assignments.map(a => (
                <article className="lab-card" key={a.id}>
                  <span className={`assignment-badge badge-${a.type}`}>{a.label}</span>
                  <h3>
                    <span style={{ opacity: 0.5, fontSize: '0.85rem', marginRight: '0.4rem' }}>{a.id}</span>
                    {a.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', margin: '0 0 0.75rem' }}>{a.body}</p>
                  <Link to={a.href}>Open assignment →</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Lab stack */}
        <section className="lab-section">
          <div className="container">
            <h2>Lab Stack</h2>
            <p>
              A self-contained CTI lab on a single Linux host. One <code>docker compose up -d</code> starts
              the full stack. 16 GB RAM recommended.
            </p>
            <table className="stack-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Role</th>
                  <th>Default Port</th>
                </tr>
              </thead>
              <tbody>
                {stack.map(([name, role, port]) => (
                  <tr key={name}>
                    <td><strong>{name}</strong></td>
                    <td>{role}</td>
                    <td><code>{port}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '1.5rem' }}>
              <Link className="button button--primary" to="/quick-start">Quick Start Guide</Link>
              {' '}
              <Link className="button button--secondary" to="/architecture" style={{ marginLeft: '0.5rem' }}>Architecture</Link>
            </div>
          </div>
        </section>

        {/* Related projects */}
        <section className="lab-section">
          <div className="container">
            <h2>Ecosystem</h2>
            <p>
              CTI as a Code is part of a practitioner ecosystem. Each project has a distinct role.
              They are designed to be used together.
            </p>
            <div className="lab-grid">
              {ecosystem.map(p => (
                <article className="lab-card" key={p.title}>
                  <h3>{p.title}</h3>
                  <p style={{ fontSize: '0.88rem', margin: '0 0 0.75rem' }}>{p.body}</p>
                  <a href={p.href} target="_blank" rel="noopener noreferrer">Open project →</a>
                </article>
              ))}
            </div>
            <p style={{ marginTop: '1.5rem' }}>
              <Link to="/ecosystem">Full ecosystem guide with cross-project workflows →</Link>
            </p>
          </div>
        </section>

        {/* Defensive notice */}
        <section className="lab-section">
          <div className="container">
            <h2>Defensive Use</h2>
            <p>
              All material is public, defensive, and TLP:CLEAR. Adversary behavior is described at the
              level needed for detection engineering, threat hunting, and investigation — not for
              exploitation. The project excludes malware source code, exploit instructions, real
              credentials, and operational attack guidance.
            </p>
            <p>
              Synthetic data uses RFC 5737 documentation IP ranges (203.0.113.0/24, 198.51.100.0/24).
              Do not block these in production systems.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
