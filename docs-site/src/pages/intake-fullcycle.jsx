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

export default function IntakeFullCycle() {
  const formRef = useRef(null);
  const [programName, setProgramName] = useState('');
  const [analyst, setAnalyst] = useState('');
  const [commBy, setCommBy] = useState('');
  const [callTime, setCallTime] = useState('');

  const today = new Date().toISOString().split('T')[0];

  function handlePrint() {
    window.print();
  }

  function handleReset() {
    if (window.confirm('Reset all fields? This cannot be undone.')) {
      formRef.current.reset();
      setProgramName('');
      setAnalyst('');
      setCommBy('');
      setCallTime('');
    }
  }

  return (
    <Layout
      title="Full-Cycle Program Intake"
      description="CTI Lab — Full-cycle CTI program design intake checklist"
    >
      <div className={styles.wrapper}>
        <div className={styles.toolbar + ' no-print'}>
          <span className={styles.toolbarTitle}>Full-Cycle CTI Program Intake</span>
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
            <h1 className={styles.formTitle}>Full-Cycle CTI Program Intake</h1>
            <div className={styles.headerGrid}>
              <div className={styles.headerField}>
                <label>Program name</label>
                <input
                  type="text"
                  value={programName}
                  onChange={e => setProgramName(e.target.value)}
                  placeholder="CTI Program — [Org name]"
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
                  value={commBy}
                  onChange={e => setCommBy(e.target.value)}
                  placeholder="Name, role"
                />
              </div>
              <div className={styles.headerField}>
                <label>Call time</label>
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
          <Section num="1" title="Program mandate">
            <Q num="1.1" text="What is the trigger for building this program?">
              <CheckGroup options={[
                { text: 'Regulatory mandate (INCD, BoI, compliance directive) — ref:', sub: 'directive / regulation', subWidth: '200px' },
                'Board / executive decision',
                'Post-incident remediation',
                'Maturity initiative / strategic investment',
                { text: 'Other:', sub: '_______________', subWidth: '200px' },
              ]} />
            </Q>
            <Q num="1.2" text="Who is the executive sponsor?">
              <div className={styles.inlineRow}>
                <span>Name:</span>
                <InlineField placeholder="Name" width="160px" />
                <span>Role:</span>
                <InlineField placeholder="CISO / CTO / …" width="140px" />
                <span>Authority:</span>
                <InlineField placeholder="budget / headcount / …" width="180px" />
              </div>
            </Q>
            <Q num="1.3" text="New program or maturing an existing one?">
              <RadioGroup name="program-type" options={[
                'New program — no structured CTI capability exists',
                'Maturing — existing capability, extending scope or governance',
                'Rebuilding — previous capability dismantled or failed',
              ]} />
            </Q>
            <Q num="1.4" text="Target maturity level in 12 months?">
              <RadioGroup name="target-maturity" options={[
                'Level 1 — Ad hoc (reactive only)',
                'Level 2 — Defined (PIRs, source registry, basic products)',
                'Level 3 — Managed (regular products, sharing established, metrics tracked)',
                'Level 4 — Optimized (emulation, detection integration, regulatory compliant)',
              ]} />
            </Q>
          </Section>

          {/* Section 2 */}
          <Section num="2" title="Stakeholders">
            <Q num="2.1" text="Primary intelligence consumers?">
              <table className={styles.regTable}>
                <thead>
                  <tr>
                    <th>Consumer</th>
                    <th>Role</th>
                    <th>Intelligence need</th>
                    <th>Cadence</th>
                    <th>TLP limit</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map(n => (
                    <tr key={n}>
                      <td><input type="text" className={styles.tableInput} /></td>
                      <td><input type="text" className={styles.tableInput} /></td>
                      <td><input type="text" className={styles.tableInput} /></td>
                      <td><input type="text" className={styles.tableInput} style={{ width: '80px' }} /></td>
                      <td>
                        <select className={styles.tableInput} style={{ width: '90px' }}>
                          <option value=""></option>
                          <option>RED</option>
                          <option>AMBER</option>
                          <option>GREEN</option>
                          <option>WHITE</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Q>
            <Q num="2.2" text="Who has authority to approve and prioritize PIRs?">
              <div className={styles.inlineRow}>
                <span>Name:</span>
                <InlineField placeholder="Name" width="160px" />
                <span>Role:</span>
                <InlineField placeholder="role" width="160px" />
              </div>
            </Q>
            <Q num="2.3" text="Who will be accountable for program metrics?">
              <div className={styles.inlineRow}>
                <span>Name:</span>
                <InlineField placeholder="Name" width="160px" />
                <span>Role:</span>
                <InlineField placeholder="role" width="160px" />
              </div>
            </Q>
            <Q
              num="2.4"
              text="Who should NOT have visibility into the program's existence or findings?"
              hint="Suspect insider, pending legal action, need-to-know restriction"
            >
              <Field rows={2} />
            </Q>
          </Section>

          {/* Section 3 */}
          <Section num="3" title="Priority Intelligence Requirements">
            <Q num="3.1" text="Top 3–5 questions the program must answer?">
              <table className={styles.regTable}>
                <thead>
                  <tr>
                    <th>PIR</th>
                    <th>Stakeholder</th>
                    <th>Decision it drives</th>
                    <th>Review cadence</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4].map(n => (
                    <tr key={n}>
                      <td><input type="text" className={styles.tableInput} /></td>
                      <td><input type="text" className={styles.tableInput} style={{ width: '100px' }} /></td>
                      <td><input type="text" className={styles.tableInput} /></td>
                      <td><input type="text" className={styles.tableInput} style={{ width: '90px' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Q>
            <Q num="3.2" text="Any PIRs driven by a regulatory or compliance requirement?">
              <RadioGroup name="reg-pir" options={[
                { text: 'Yes — PIR:', sub: 'PIR text', subWidth: '180px' },
                'No',
              ]} />
            </Q>
            <Q num="3.3" text="PIRs that cannot currently be answered (collection gap)?">
              <Field rows={3} />
            </Q>
          </Section>

          {/* Section 4 */}
          <Section num="4" title="Collection requirements">
            <Q num="4.1" text="Internal sources available?">
              <CheckGroup options={[
                'SIEM / security event logs',
                'EDR telemetry',
                'Incident history / IR reports',
                'Vulnerability scan data',
                'Cloud security logs (Azure AD / AWS CloudTrail / GCP)',
                'Network flow data',
                'OT / ICS telemetry',
              ]} />
            </Q>
            <Q num="4.2" text="External sharing relationships currently in place?">
              <div className={styles.checkGroup}>
                {[
                  { label: 'CERT-IL', options: ['MOU active', 'In progress', 'None'] },
                  { label: 'Sector ISAC', options: ['Active', 'In progress', 'None'] },
                  { label: 'Commercial intel feed', options: ['Active', 'In progress', 'None'] },
                  { label: 'Peer-sharing group', options: ['Active', 'In progress', 'None'] },
                ].map(({ label, options }, i) => (
                  <div key={i} className={styles.logRow}>
                    <span className={styles.logSrc}>{label}</span>
                    {options.map(opt => (
                      <label key={opt} className={styles.checkLabel} style={{ marginRight: 8 }}>
                        <input type="radio" name={`share-${i}`} className={styles.checkbox} />
                        <span>{opt}</span>
                      </label>
                    ))}
                    <InlineField placeholder="name / details" width="150px" />
                  </div>
                ))}
              </div>
            </Q>
            <Q
              num="4.3"
              text="Top collection gaps?"
              hint="Sources that would answer PIRs but are not yet available"
            >
              <Field rows={3} />
            </Q>
            <Q num="4.4" text="Budget for new source subscriptions?">
              <div className={styles.inlineRow}>
                <InlineField placeholder="annual budget / unknown" width="260px" />
              </div>
            </Q>
          </Section>

          {/* Section 5 */}
          <Section num="5" title="Sharing architecture">
            <Q num="5.1" text="Intended external sharing partners?">
              <table className={styles.regTable}>
                <thead>
                  <tr>
                    <th>Partner</th>
                    <th>Type</th>
                    <th>TLP limit</th>
                    <th>MOU needed?</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>CERT-IL</td>
                    <td>National CERT</td>
                    <td>GREEN</td>
                    <td>Yes</td>
                    <td><input type="text" className={styles.tableInput} /></td>
                  </tr>
                  {[1, 2, 3].map(n => (
                    <tr key={n}>
                      <td><input type="text" className={styles.tableInput} /></td>
                      <td><input type="text" className={styles.tableInput} /></td>
                      <td>
                        <select className={styles.tableInput} style={{ width: '90px' }}>
                          <option value=""></option>
                          <option>RED</option>
                          <option>AMBER</option>
                          <option>GREEN</option>
                          <option>WHITE</option>
                        </select>
                      </td>
                      <td>
                        <label className={styles.checkLabel}>
                          <input type="radio" name={`mou-${n}`} className={styles.checkbox} />
                          <span>Yes</span>
                        </label>
                        <label className={styles.checkLabel}>
                          <input type="radio" name={`mou-${n}`} className={styles.checkbox} />
                          <span>No</span>
                        </label>
                      </td>
                      <td><input type="text" className={styles.tableInput} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Q>
            <Q
              num="5.2"
              text="Internal sharing requirements?"
              hint="SOC, IR team, detection engineering, legal/compliance, executive"
            >
              <Field rows={3} />
            </Q>
          </Section>

          {/* Section 6 */}
          <Section num="6" title="Team and resources">
            <Q num="6.1" text="Analysts allocated to this program?">
              <div className={styles.inlineRow}>
                <span>FTE:</span>
                <InlineField placeholder="count" width="80px" />
                <span>Contractors / MSSP:</span>
                <InlineField placeholder="count / vendor name" width="200px" />
              </div>
            </Q>
            <Q num="6.2" text="Tooling available?">
              <CheckGroup options={[
                'OpenCTI (TIP)',
                'TheHive (case management)',
                'Cortex (enrichment)',
                'Elastic SIEM / Kibana',
                { text: 'Other:', sub: '_______________', subWidth: '200px' },
              ]} />
            </Q>
            <Q num="6.3" text="Annual program budget?">
              <div className={styles.inlineRow}>
                <InlineField placeholder="budget amount / unknown" width="260px" />
              </div>
            </Q>
            <Q num="6.4" text="Skills gaps requiring training, hiring, or contractor support?">
              <Field rows={3} />
            </Q>
          </Section>

          {/* Section 7 */}
          <Section num="7" title="Governance">
            <Q num="7.1" text="Reporting structure?">
              <div className={styles.inlineRow}>
                <span>Reports to:</span>
                <InlineField placeholder="name / role / committee" width="200px" />
                <span>Frequency:</span>
                <InlineField placeholder="weekly / monthly / …" width="140px" />
              </div>
            </Q>
            <Q num="7.2" text="Review cadence?">
              <CheckGroup options={[
                'Weekly — tactical products, SOC alerts',
                'Monthly — strategic products, stakeholder briefings',
                'Quarterly — PIR review, program metrics, maturity assessment',
                'Annual — charter review, budget justification',
              ]} />
            </Q>
            <Q
              num="7.3"
              text="KPIs to measure program effectiveness?"
              hint="e.g. PIR answer rate, detection coverage %, time-to-product, stakeholder satisfaction score"
            >
              <Field rows={3} />
            </Q>
          </Section>

          {/* Section 8 */}
          <Section num="8" title="Regulatory context">
            <Q num="8.1" text="Applicable compliance frameworks?">
              <table className={styles.regTable}>
                <thead>
                  <tr>
                    <th>Framework</th>
                    <th>Applicable?</th>
                    <th>Key obligation</th>
                    <th>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    'INCD Directive',
                    'BoI-CD 362',
                    'GDPR',
                  ].map((fw, i) => (
                    <tr key={i}>
                      <td>{fw}</td>
                      <td>
                        {['Yes', 'No'].map(v => (
                          <label key={v} className={styles.checkLabel} style={{ marginRight: 8 }}>
                            <input type="radio" name={`fw-${i}`} className={styles.checkbox} />
                            <span>{v}</span>
                          </label>
                        ))}
                      </td>
                      <td><input type="text" className={styles.tableInput} /></td>
                      <td><input type="text" className={styles.tableInput} style={{ width: '100px' }} /></td>
                    </tr>
                  ))}
                  <tr>
                    <td><InlineField placeholder="Other framework" width="150px" /></td>
                    <td>
                      {['Yes', 'No'].map(v => (
                        <label key={v} className={styles.checkLabel} style={{ marginRight: 8 }}>
                          <input type="radio" name="fw-other" className={styles.checkbox} />
                          <span>{v}</span>
                        </label>
                      ))}
                    </td>
                    <td><input type="text" className={styles.tableInput} /></td>
                    <td><input type="text" className={styles.tableInput} style={{ width: '100px' }} /></td>
                  </tr>
                </tbody>
              </table>
            </Q>
            <Q num="8.2" text="INCD MOU — status?">
              <RadioGroup name="incd-mou" options={[
                'Active MOU in place',
                { text: 'In progress — expected:', sub: 'date', subWidth: '120px' },
                'Not required',
                'Required but not started',
              ]} />
            </Q>
          </Section>

          {/* Section 9 */}
          <Section num="9" title="Analyst assessment">
            <Q num="9.1" text="Current maturity level?">
              <RadioGroup name="current-maturity" options={[
                'Level 1 — Ad hoc',
                'Level 2 — Defined',
                'Level 3 — Managed',
                'Level 4 — Optimized',
              ]} />
            </Q>
            <Q num="9.2" text="Top 3 program risks?">
              {[1, 2, 3].map(n => (
                <div key={n} className={styles.inlineRow} style={{ marginBottom: 6 }}>
                  <span style={{ width: 18, flexShrink: 0 }}>{n}.</span>
                  <input type="text" className={styles.inlineInput} style={{ flex: 1, width: '100%' }} />
                </div>
              ))}
            </Q>
            <Q
              num="9.3"
              text="Recommended first 30-day actions?"
              hint="What must happen to establish credibility, answer at least one PIR, and demonstrate value?"
            >
              <Field rows={4} />
            </Q>
          </Section>

          {/* Section 10 */}
          <Section num="10" title="Analyst notes">
            <Field hint="Free-form notes from the intake call — raw, unprocessed" rows={6} />
          </Section>

          {/* Section 11 */}
          <Section num="11" title="Next actions">
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
            File completed intake as <code>00-scope/intake-{today}.md</code>, initialize program folder, draft stakeholder map and PIR register.
          </div>
        </form>
      </div>
    </Layout>
  );
}
