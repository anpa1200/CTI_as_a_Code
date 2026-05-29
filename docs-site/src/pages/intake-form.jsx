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

export default function IntakeForm() {
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
      title="Investigation Intake Form"
      description="CTI Lab — Reactive investigation intake checklist"
    >
      <div className={styles.wrapper}>
        <div className={styles.toolbar + ' no-print'}>
          <span className={styles.toolbarTitle}>Investigation Intake Form</span>
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
            <h1 className={styles.formTitle}>Investigation Intake</h1>
            <div className={styles.headerGrid}>
              <div className={styles.headerField}>
                <label>Project name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={e => setProjectName(e.target.value)}
                  placeholder="PROJ-2025-XXX"
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
                <label>Intake call with</label>
                <input
                  type="text"
                  value={callWith}
                  onChange={e => setCallWith(e.target.value)}
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
          <Section num="1" title="What was reported?">
            <Q num="1.1" text="What did you see or receive that caused you to raise this?">
              <Field hint="Exact words from the reporter — do not paraphrase yet" rows={3} />
            </Q>
            <Q num="1.2" text="Where did this first come to your attention?">
              <CheckGroup options={[
                'Alert from SIEM / EDR / AV',
                'User complaint or helpdesk ticket',
                'External notification (CERT-IL, partner, vendor)',
                'Periodic log review',
                { text: 'Other:', sub: '_______________', subWidth: '200px' },
              ]} />
            </Q>
            <Q num="1.3" text="When did you first notice it?">
              <div className={styles.inlineRow}>
                <span>Date:</span>
                <input type="date" className={styles.inlineInput} style={{ width: '150px' }} />
                <span>Time:</span>
                <input type="time" className={styles.inlineInput} style={{ width: '110px' }} />
                <span>Timezone:</span>
                <InlineField placeholder="UTC / IDT / …" width="100px" />
              </div>
            </Q>
            <Q num="1.4" text="Do you believe the activity is still ongoing?">
              <RadioGroup name="ongoing" options={[
                'Yes — still active',
                { text: 'No — appears to have stopped', sub: 'when?', subWidth: '140px' },
                'Unknown',
              ]} />
            </Q>
          </Section>

          {/* Section 2 */}
          <Section num="2" title="What is already known?">
            <Q
              num="2.1"
              text="What systems, accounts, or services appear to be involved?"
              hint="List hostnames, IPs, usernames exactly as the reporter knows them — we will verify later"
            >
              <Field rows={3} />
            </Q>
            <Q
              num="2.2"
              text="What was the observed behavior?"
              hint='"database was slow", "account locked", "file appeared on server", etc.'
            >
              <Field rows={3} />
            </Q>
            <Q num="2.3" text="Has anyone else already investigated or looked into this?">
              <RadioGroup name="prior-invest" options={[
                { text: 'Yes — who:', sub: 'name', subWidth: '120px' },
                'No',
                'Unknown',
              ]} />
              <Field
                label="If yes — what did they touch or change?"
                hint="Critical for evidence integrity"
                rows={2}
              />
            </Q>
            <Q
              num="2.4"
              text="What do you think happened?"
              hint="Their hypothesis — we are not confirming it yet, just capturing it"
            >
              <Field rows={3} />
            </Q>
          </Section>

          {/* Section 3 */}
          <Section num="3" title="Timeline of discovery">
            <Q num="3.1" text="When do you believe the activity started?">
              <RadioGroup name="start" options={[
                { text: 'Known:', sub: 'date', subWidth: '130px' },
                { text: 'Estimated: approximately', sub: 'date/range', subWidth: '150px' },
                'Unknown — this needs to be determined',
              ]} />
            </Q>
            <Q num="3.2" text="How long do you estimate the activity has been occurring?">
              <div className={styles.inlineRow}>
                <InlineField placeholder="Hours / Days / Weeks / Unknown" width="260px" />
              </div>
            </Q>
            <Q
              num="3.3"
              text="Is there a specific event that triggered the alert or complaint?"
              hint={"\"user reported they couldn't log in\", \"SOC saw an alert at 03:14\", \"customer called about unauthorized charges\""}
            >
              <Field rows={2} />
            </Q>
          </Section>

          {/* Section 4 */}
          <Section num="4" title="What has already been done?">
            <div className={styles.noteBox}>
              This section determines whether evidence has been preserved or potentially tainted.
            </div>
            <Q num="4.1" text="Has any system been rebooted, shut down, or reimaged since the activity was discovered?">
              <RadioGroup name="reboot" options={[
                { text: 'Yes — systems:', sub: 'which / when', subWidth: '220px' },
                'No',
                'Unknown',
              ]} />
            </Q>
            <Q num="4.2" text="Have any credentials, tokens, or API keys been rotated or revoked?">
              <RadioGroup name="creds" options={[
                { text: 'Yes — which:', sub: 'detail / when', subWidth: '220px' },
                'No',
                'Unknown',
              ]} />
            </Q>
            <Q num="4.3" text="Has any network access been blocked or firewall rules been changed?">
              <RadioGroup name="fw" options={[
                { text: 'Yes — what:', sub: 'detail', subWidth: '220px' },
                'No',
                'Unknown',
              ]} />
            </Q>
            <Q num="4.4" text="Has any malware been deleted or quarantined?">
              <RadioGroup name="malware" options={[
                'No',
                'Unknown',
              ]} />
              <div className={styles.inlineRow} style={{ marginTop: 6 }}>
                <input type="radio" name="malware" className={styles.checkbox} />
                <span style={{ marginLeft: 6 }}>Yes — by whom:</span>
                <InlineField placeholder="name" width="140px" />
                <span>copy preserved:</span>
                <label className={styles.checkLabel}>
                  <input type="radio" name="copy" className={styles.checkbox} />
                  <span>Yes</span>
                </label>
                <label className={styles.checkLabel}>
                  <input type="radio" name="copy" className={styles.checkbox} />
                  <span>No</span>
                </label>
              </div>
            </Q>
            <Q num="4.5" text="Has anyone notified external parties (regulators, law enforcement, CERT, customers)?">
              <RadioGroup name="notified" options={[
                { text: 'Yes — who / when:', sub: 'detail', subWidth: '220px' },
                'No — are there notification obligations that may apply? (see section 7)',
                'Unknown',
              ]} />
            </Q>
          </Section>

          {/* Section 5 */}
          <Section num="5" title="Systems and access">
            <Q
              num="5.1"
              text="What logging is expected to exist for the affected systems?"
              hint="Ask what they know — we will verify against what we actually find"
            >
              {[
                'Endpoint logs (Sysmon, Winlogbeat, EDR)',
                'VPN / authentication logs',
                'Database audit logs',
                'Network flow / firewall logs',
                'Email gateway logs',
                'Cloud provider logs (Azure AD, AWS CloudTrail, GCP)',
              ].map((src, i) => (
                <div key={i} className={styles.logRow}>
                  <span className={styles.logSrc}>{src}</span>
                  <label className={styles.checkLabel}>
                    <input type="radio" name={`log-${i}`} className={styles.checkbox} />
                    <span>Yes</span>
                  </label>
                  <label className={styles.checkLabel}>
                    <input type="radio" name={`log-${i}`} className={styles.checkbox} />
                    <span>No</span>
                  </label>
                  <label className={styles.checkLabel}>
                    <input type="radio" name={`log-${i}`} className={styles.checkbox} />
                    <span>Unknown</span>
                  </label>
                </div>
              ))}
            </Q>
            <Q num="5.2" text="What tools and access does the analyst have?">
              <CheckGroup options={[
                'Admin access to affected hosts (remote or physical)',
                'Read access to SIEM',
                'Access to EDR console',
                'Access to network equipment / firewall logs',
                'Access to cloud console',
                'Access to email gateway',
                'VPN / jump host credentials',
                'TheHive / OpenCTI lab access',
              ]} />
            </Q>
            <Q
              num="5.3"
              text="Are there any systems the analyst should NOT touch?"
              hint="Legal hold, systems under active monitoring by law enforcement, production critical systems"
            >
              <Field rows={2} />
            </Q>
          </Section>

          {/* Section 6 */}
          <Section num="6" title="Business impact">
            <Q num="6.1" text="What business processes are affected or at risk?">
              <Field rows={2} />
            </Q>
            <Q num="6.2" text="Is customer data, employee data, or regulated data potentially involved?">
              <RadioGroup name="data" options={[
                { text: 'Yes — what type:', sub: 'PII / financial / biometric / …', subWidth: '220px' },
                'No',
                'Unknown',
              ]} />
            </Q>
            <Q
              num="6.3"
              text="What is the financial exposure if this is confirmed?"
              hint="Rough estimate — for prioritization only"
            >
              <div className={styles.inlineRow}>
                <InlineField placeholder="e.g. < $100K / material / unknown" width="300px" />
              </div>
            </Q>
            <Q num="6.4" text="Is there a hard deadline driving this investigation?">
              <RadioGroup name="deadline" options={[
                { text: 'Yes — deadline:', sub: 'date / description', subWidth: '220px' },
                'No',
              ]} />
            </Q>
          </Section>

          {/* Section 7 */}
          <Section num="7" title="Regulatory and legal constraints">
            <Q num="7.1" text="Are there applicable notification requirements?">
              <table className={styles.regTable}>
                <thead>
                  <tr>
                    <th>Regulation</th>
                    <th>Applicable?</th>
                    <th>Deadline</th>
                    <th>Notified?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['INCD (Israeli critical infrastructure)', '72h from discovery'],
                    ['Biometric Database Authority', 'Per Biometric Database Law'],
                    ['BoI-CD 362 (Israeli financial)', '24h initial, 72h full'],
                    ['GDPR', '72h from awareness'],
                    ['PCI-DSS', 'Immediate'],
                  ].map(([reg, deadline], i) => (
                    <tr key={i}>
                      <td>{reg}</td>
                      <td>
                        {['Yes', 'No', 'TBD'].map(v => (
                          <label key={v} className={styles.checkLabel} style={{ marginRight: 8 }}>
                            <input type="radio" name={`reg-${i}`} className={styles.checkbox} />
                            <span>{v}</span>
                          </label>
                        ))}
                      </td>
                      <td className={styles.deadline}>{deadline}</td>
                      <td>
                        {['Yes', 'No'].map(v => (
                          <label key={v} className={styles.checkLabel} style={{ marginRight: 8 }}>
                            <input type="radio" name={`notif-${i}`} className={styles.checkbox} />
                            <span>{v}</span>
                          </label>
                        ))}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td><InlineField placeholder="Other regulation" width="180px" /></td>
                    <td>
                      {['Yes', 'No', 'TBD'].map(v => (
                        <label key={v} className={styles.checkLabel} style={{ marginRight: 8 }}>
                          <input type="radio" name="reg-other" className={styles.checkbox} />
                          <span>{v}</span>
                        </label>
                      ))}
                    </td>
                    <td><InlineField placeholder="deadline" width="120px" /></td>
                    <td>
                      {['Yes', 'No'].map(v => (
                        <label key={v} className={styles.checkLabel} style={{ marginRight: 8 }}>
                          <input type="radio" name="notif-other" className={styles.checkbox} />
                          <span>{v}</span>
                        </label>
                      ))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Q>
            <Q num="7.2" text="Is there an active legal hold on any systems or data?">
              <RadioGroup name="hold" options={[
                { text: 'Yes — what systems:', sub: 'detail', subWidth: '220px' },
                'No',
                'Unknown — escalate to legal before collecting',
              ]} />
            </Q>
            <Q num="7.3" text="Has legal counsel been notified?">
              <RadioGroup name="legal" options={[
                'Yes',
                { text: 'No — should they be?', sub: 'reasoning', subWidth: '200px' },
              ]} />
            </Q>
          </Section>

          {/* Section 8 */}
          <Section num="8" title="Analyst notes">
            <Field hint="Free-form notes taken during the intake call — raw, unprocessed" rows={6} />
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
            File completed intake as <code>00-scope/intake-{today}.md</code> and open a case in TheHive.
          </div>
        </form>
      </div>
    </Layout>
  );
}
