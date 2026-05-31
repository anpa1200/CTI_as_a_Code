import React, { useState, useRef } from 'react';
import Layout from '@theme/Layout';
import styles from './intake-form.module.css';

function Field({ label, hint, rows = 3 }) {
  return (
    <div className={styles.field}>
      {label && <div className={styles.fieldLabel}>{label}</div>}
      {hint && <div className={styles.hint}>{hint}</div>}
      <textarea className={styles.textarea} rows={rows} />
    </div>
  );
}

function InlineField({ placeholder = '_______________', width = '180px' }) {
  return (
    <input
      type="text"
      className={styles.inlineInput}
      placeholder={placeholder}
      style={{ width }}
    />
  );
}

function CheckGroup({ options }) {
  return (
    <div className={styles.checkGroup}>
      {options.map((opt, i) =>
        typeof opt === 'string' ? (
          <label key={i} className={styles.checkLabel}>
            <input type="checkbox" className={styles.checkbox} />
            <span>{opt}</span>
          </label>
        ) : (
          <label key={i} className={styles.checkLabel}>
            <input type="checkbox" className={styles.checkbox} />
            <span>
              {opt.text}
              {opt.sub && (
                <InlineField placeholder={opt.sub} width={opt.subWidth || '160px'} />
              )}
            </span>
          </label>
        )
      )}
    </div>
  );
}

function RadioGroup({ name, options }) {
  return (
    <div className={styles.checkGroup}>
      {options.map((opt, i) =>
        typeof opt === 'string' ? (
          <label key={i} className={styles.checkLabel}>
            <input type="radio" name={name} className={styles.checkbox} />
            <span>{opt}</span>
          </label>
        ) : (
          <label key={i} className={styles.checkLabel}>
            <input type="radio" name={name} className={styles.checkbox} />
            <span>
              {opt.text}
              {opt.sub && (
                <InlineField placeholder={opt.sub} width={opt.subWidth || '160px'} />
              )}
            </span>
          </label>
        )
      )}
    </div>
  );
}

function Section({ num, title, children }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.sectionNum}>{num}</span> {title}
      </h2>
      {children}
    </section>
  );
}

function Q({ num, text, hint, children }) {
  return (
    <div className={styles.question}>
      <div className={styles.qLabel}>
        <strong>{num}</strong> {text}
      </div>
      {hint && <div className={styles.hint}>{hint}</div>}
      {children}
    </div>
  );
}

export default function IntakeProactive() {
  const formRef = useRef(null);
  const [projectName, setProjectName] = useState('');
  const [analyst, setAnalyst] = useState('');
  const [callWith, setCallWith] = useState('');
  const [callTime, setCallTime] = useState('');

  const today = new Date().toISOString().split('T')[0];

  function handlePrint() {
    window.print();
  }

  function handleReset() {
    if (window.confirm('Reset all fields? This cannot be undone.')) {
      formRef.current.reset();
      setProjectName('');
      setAnalyst('');
      setCallWith('');
      setCallTime('');
    }
  }

  return (
    <Layout
      title="Proactive Assessment Intake"
      description="CTI Lab — Proactive threat assessment intake checklist"
    >
      <div className={styles.wrapper}>
        <div className={styles.toolbar + ' no-print'}>
          <span className={styles.toolbarTitle}>Proactive Assessment Intake</span>
          <div className={styles.toolbarActions}>
            <button className={styles.btnSecondary} onClick={handleReset}>
              Reset
            </button>
            <button className={styles.btnPrimary} onClick={handlePrint}>
              Print / Export PDF
            </button>
          </div>
        </div>

        <form ref={formRef} className={styles.form} onSubmit={e => e.preventDefault()}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.formTitle}>Proactive Assessment Intake</h1>
            <div className={styles.headerGrid}>
              <div className={styles.headerField}>
                <label>Project name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="ASSESS-2025-XXX"
                />
              </div>
              <div className={styles.headerField}>
                <label>Analyst</label>
                <input
                  type="text"
                  value={analyst}
                  onChange={e => setAnalyst(e.target.value)}
                  placeholder="Name"
                />
              </div>
              <div className={styles.headerField}>
                <label>Commissioned by</label>
                <input
                  type="text"
                  value={callWith}
                  onChange={e => setCallWith(e.target.value)}
                  placeholder="Name, role"
                />
              </div>
              <div className={styles.headerField}>
                <label>Date / time</label>
                <input
                  type="text"
                  value={callTime}
                  onChange={e => setCallTime(e.target.value)}
                  placeholder={today + ' HH:MM UTC'}
                />
              </div>
            </div>
          </div>

          {/* Section 1 */}
          <Section num="1" title="Assessment trigger">
            <Q num="1.1" text="What triggered this assessment?">
              <CheckGroup options={[
                { text: 'CERT advisory / threat report — ref:', sub: 'advisory number / title', subWidth: '220px' },
                'Peer organization incident',
                'Commercial threat intel alert',
                'Compliance / audit requirement',
                'Management / board direction',
                'Periodic scheduled review',
                { text: 'Other:', sub: '_______________', subWidth: '200px' },
              ]} />
            </Q>
            <Q
              num="1.2"
              text="What is the specific intelligence or event driving urgency?"
              hint="Exact report name, advisory number, incident description — do not paraphrase"
            >
              <Field rows={3} />
            </Q>
            <Q num="1.3" text="When was the trigger received?">
              <div className={styles.inlineRow}>
                <span>Date:</span>
                <input type="date" className={styles.inlineInput} style={{ width: '150px' }} />
                <span>Source:</span>
                <InlineField placeholder="CERT-IL / vendor / internal" width="180px" />
                <span>Reliability (Admiralty A–F):</span>
                <InlineField placeholder="A–F" width="50px" />
              </div>
            </Q>
            <Q num="1.4" text="Is the threat actor or campaign believed to be currently active?">
              <RadioGroup name="active" options={[
                'Yes — assessed active against this sector/region',
                'No — historical or dormant',
                'Unknown',
              ]} />
            </Q>
          </Section>

          {/* Section 2 */}
          <Section num="2" title="Organization profile">
            <Q num="2.1" text="Sector and sub-sector?">
              <div className={styles.inlineRow}>
                <InlineField placeholder="e.g. Financial / Retail banking" width="340px" />
              </div>
            </Q>
            <Q
              num="2.2"
              text="What are the crown jewels — the 3–5 most critical assets?"
              hint="What would trigger regulatory notification or cause irreversible harm if compromised?"
            >
              <Field rows={4} />
            </Q>
            <Q
              num="2.3"
              text="Why is this organization an attractive target?"
              hint="IP, customer data, market position, government contracts, critical infrastructure designation"
            >
              <Field rows={3} />
            </Q>
            <Q
              num="2.4"
              text="Geographic and geopolitical exposure?"
              hint="Nation-state actors with documented interest in this sector/geography"
            >
              <Field rows={2} />
            </Q>
          </Section>

          {/* Section 3 */}
          <Section num="3" title="Current detection posture">
            <Q num="3.1" text="Detection and prevention tools deployed?">
              <div className={styles.checkGroup}>
                {[
                  ['SIEM', 'e.g. Elastic / Splunk / QRadar'],
                  ['EDR', 'e.g. CrowdStrike / Defender / SentinelOne'],
                  ['Email security', 'e.g. Proofpoint / Defender for O365'],
                  ['Network monitoring', 'e.g. Zeek / Darktrace'],
                  ['Cloud security', 'e.g. Defender for Cloud / GuardDuty'],
                ].map(([tool, hint], i) => (
                  <div key={i} className={styles.logRow}>
                    <span className={styles.logSrc}>{tool}</span>
                    <InlineField placeholder={hint} width="220px" />
                  </div>
                ))}
              </div>
            </Q>
            <Q num="3.2" text="Log sources currently ingested into SIEM?">
              <CheckGroup options={[
                'Windows Event Logs / Sysmon',
                'VPN / remote access',
                'DNS',
                'Proxy / web gateway',
                'Email gateway',
                'Cloud (Azure AD / AWS CloudTrail / GCP)',
                'Network flow / NetFlow',
                'EDR telemetry',
                'Database audit logs',
                'OT / ICS telemetry',
              ]} />
            </Q>
            <Q num="3.3" text="Date of last threat assessment or red team exercise?">
              <div className={styles.inlineRow}>
                <span>Date:</span>
                <input type="date" className={styles.inlineInput} style={{ width: '150px' }} />
                <span>Findings available:</span>
                <label className={styles.checkLabel}>
                  <input type="radio" name="findings" className={styles.checkbox} />
                  <span>Yes</span>
                </label>
                <label className={styles.checkLabel}>
                  <input type="radio" name="findings" className={styles.checkbox} />
                  <span>No</span>
                </label>
              </div>
            </Q>
            <Q
              num="3.4"
              text="Known detection gaps?"
              hint="Log sources not ingested, detection rules not deployed, known blind spots"
            >
              <Field rows={3} />
            </Q>
          </Section>

          {/* Section 4 */}
          <Section num="4" title="Scope and mandate">
            <Q num="4.1" text="Who commissioned this assessment?">
              <div className={styles.inlineRow}>
                <span>Name:</span>
                <InlineField placeholder="Name" width="160px" />
                <span>Role:</span>
                <InlineField placeholder="CISO / CTO / …" width="140px" />
                <span>Authority:</span>
                <InlineField placeholder="budget / prioritization / …" width="180px" />
              </div>
            </Q>
            <Q num="4.2" text="Expected deliverable?">
              <CheckGroup options={[
                'Technical brief (security team)',
                'Executive brief (CISO / board)',
                'Detection backlog with prioritization',
                '72h immediate action plan',
                'Full threat assessment report',
                { text: 'Other:', sub: '_______________', subWidth: '200px' },
              ]} />
            </Q>
            <Q num="4.3" text="Hard deadline?">
              <RadioGroup name="deadline" options={[
                { text: 'Yes — deadline:', sub: 'date', subWidth: '130px' },
                'No',
              ]} />
            </Q>
            <Q
              num="4.4"
              text="Engineering capacity for detection backlog?"
              hint="Engineer-days or sprint slots available to act on findings"
            >
              <div className={styles.inlineRow}>
                <InlineField placeholder="e.g. 3 engineer-days / 1 sprint slot / unknown" width="320px" />
              </div>
            </Q>
          </Section>

          {/* Section 5 */}
          <Section num="5" title="Threat context">
            <Q
              num="5.1"
              text="Threat actors of concern?"
              hint="Nation-state clusters, criminal groups, insider threat, hacktivists — name or describe"
            >
              <Field rows={3} />
            </Q>
            <Q num="5.2" text="Prior incidents or near-misses in this organization?">
              <RadioGroup name="incidents" options={[
                { text: 'Yes — summary:', sub: 'brief description', subWidth: '240px' },
                'No',
                'Unknown',
              ]} />
            </Q>
            <Q num="5.3" text="Threat intel sources available?">
              <CheckGroup options={[
                'CERT-IL / national CERT feed',
                { text: 'Commercial intel subscription:', sub: 'vendor name', subWidth: '160px' },
                { text: 'Sector ISAC membership:', sub: 'ISAC name', subWidth: '160px' },
                { text: 'Peer-sharing group:', sub: 'group name', subWidth: '160px' },
                'Internal incident history',
                'None currently',
              ]} />
            </Q>
            <Q
              num="5.4"
              text="Relevant advisories or peer incident reports available?"
              hint="List advisory numbers, incident names, or report titles"
            >
              <Field rows={3} />
            </Q>
          </Section>

          {/* Section 6 */}
          <Section num="6" title="Regulatory and compliance context">
            <Q num="6.1" text="Applicable regulations?">
              <table className={styles.regTable}>
                <thead>
                  <tr>
                    <th>Regulation</th>
                    <th>Applicable?</th>
                    <th>Upcoming deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    'INCD (Israeli critical infrastructure)',
                    'BoI-CD 362 (Israeli financial)',
                    'GDPR',
                    'PCI-DSS',
                  ].map((reg, i) => (
                    <tr key={i}>
                      <td>{reg}</td>
                      <td>
                        {['Yes', 'No'].map(v => (
                          <label key={v} className={styles.checkLabel} style={{ marginRight: 8 }}>
                            <input type="radio" name={`reg-${i}`} className={styles.checkbox} />
                            <span>{v}</span>
                          </label>
                        ))}
                      </td>
                      <td><InlineField placeholder="date / N/A" width="120px" /></td>
                    </tr>
                  ))}
                  <tr>
                    <td><InlineField placeholder="Other regulation" width="180px" /></td>
                    <td>
                      {['Yes', 'No'].map(v => (
                        <label key={v} className={styles.checkLabel} style={{ marginRight: 8 }}>
                          <input type="radio" name="reg-other" className={styles.checkbox} />
                          <span>{v}</span>
                        </label>
                      ))}
                    </td>
                    <td><InlineField placeholder="deadline" width="120px" /></td>
                  </tr>
                </tbody>
              </table>
            </Q>
            <Q num="6.2" text="Upcoming compliance audit or regulatory review?">
              <RadioGroup name="audit" options={[
                { text: 'Yes — date:', sub: 'date', subWidth: '120px' },
                'No',
              ]} />
            </Q>
          </Section>

          {/* Section 7 */}
          <Section num="7" title="Analyst assessment">
            <Q num="7.1" text="Initial threat relevance to this organization?">
              <RadioGroup name="relevance" options={[
                'High — direct targeting assessed, specific TTPs confirmed relevant',
                'Medium — indirect exposure, plausible targeting, partial TTP overlap',
                "Low — generic threat, limited relevance to this org's profile",
              ]} />
            </Q>
            <Q num="7.2" text="Top 3 risks to investigate first?">
              {[1, 2, 3].map(n => (
                <div key={n} className={styles.inlineRow} style={{ marginBottom: 6 }}>
                  <span style={{ width: 18, flexShrink: 0 }}>{n}.</span>
                  <input type="text" className={styles.inlineInput} style={{ flex: 1, width: '100%' }} />
                </div>
              ))}
            </Q>
            <Q
              num="7.3"
              text="Recommended immediate actions (72h)?"
              hint="Quick wins: block known IoCs, enable log source, patch specific CVE, add detection rule"
            >
              <Field rows={4} />
            </Q>
          </Section>

          {/* Section 8 */}
          <Section num="8" title="Analyst notes">
            <Field hint="Free-form notes from the intake call — raw, unprocessed" rows={6} />
          </Section>

          {/* Section 9 */}
          <Section num="9" title="Next actions">
            <table className={styles.actionsTable}>
              <thead>
                <tr><th>#</th><th>Action</th><th>Owner</th><th>Due</th></tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map(n => (
                  <tr key={n}>
                    <td>{n}</td>
                    <td><input type="text" className={styles.tableInput} /></td>
                    <td><input type="text" className={styles.tableInput} style={{ width: '120px' }} /></td>
                    <td><input type="date" className={styles.tableInput} style={{ width: '140px' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <div className={styles.footer}>
            File completed intake as <code>00-scope/intake-{today}.md</code>, open project in TheHive, begin trigger assessment.
          </div>
        </form>
      </div>
    </Layout>
  );
}
