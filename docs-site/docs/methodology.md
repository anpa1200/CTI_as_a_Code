---
title: Methodology
sidebar_position: 3
---

# CTI as a Code — Methodology

Version-controlled, template-driven threat intelligence. Every claim traces to evidence. Every detection traces to a technique. Every commit is an audit record. This page is the tool reference and quick-step overview.

:::tip Full step-by-step guide
For the complete intake questionnaire, worked claim examples, Sigma validation commands, and detection backlog structure, see the **[Step-by-Step Methodology](/cti-as-a-code-methodology)** page.
:::

---

## Tool reference

| Tool | Role in workflow | Step |
|---|---|---|
| [Docker Compose](https://docs.docker.com/compose/) | Spin up the full lab stack | 0 |
| [OpenCTI](https://www.opencti.io/) | STIX2 intelligence graph; actor profiles, TTPs, IOC management | 0, 3b, 4, 5, 9 |
| [TheHive 5](https://thehive-project.org/) | Case management; evidence custody chain; observable tracking | 0, 2, 3a |
| [Cortex](https://github.com/TheHive-Project/Cortex) | Automated indicator enrichment (VirusTotal, Shodan, passive-DNS) | 0 |
| [Elastic SIEM / Kibana](https://www.elastic.co/security) | Detection rule deployment, alert triage, timeline visualization | 0, 7 |
| [Velociraptor](https://docs.velociraptor.app/) | Remote triage artifact collection (Windows/Linux, no reboot) | 3a |
| [Plaso / log2timeline](https://github.com/log2timeline/plaso) | Normalize multi-source logs into a single super-timeline | 3a |
| [Timesketch](https://timesketch.org/) | Collaborative timeline analysis; analyst tagging | 3a, 4 |
| [Hayabusa](https://github.com/Yamato-Security/hayabusa) | Sigma-based scan against `.evtx` files; initial triage pass | 3a, 7, 8 |
| [Chainsaw](https://github.com/WithSecureLabs/chainsaw) | Rapid Sigma scan; confirm raw event data exists before debugging rules | 3a, 7, 8 |
| [MITRE ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) | Coverage heatmap; gap visualization; compliance export | 4, 5, 9 |
| [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) | Data source coverage scoring; separates rule-missing from data-missing gaps | 4, 5 |
| [MISP](https://www.misp-project.org/) | Indicator feed subscription; structured sharing with CERT-IL, sector peers | 3b, 5, 9 |
| [Sigma](https://sigmahq.io/) | Vendor-neutral detection rule format; canonical source of truth | 7 |
| [pySigma / sigma-cli](https://github.com/SigmaHQ/pySigma) | Convert Sigma YAML to Elastic Lucene, ES\|QL, Splunk SPL, Sentinel KQL | 7 |
| [Uncoder.io](https://uncoder.io/) | Browser-based Sigma conversion for ad-hoc validation | 7 |
| [Maltego CE](https://www.maltego.com/maltego-community/) | Infrastructure pivoting; C2 IP → ASN → certificate → co-hosted domains | 6 |
| [Invoke-AtomicRedTeam](https://github.com/redcanaryco/invoke-atomicredteam) | Execute specific ATT&CK technique test cases on lab hosts | 8 |
| [VECTR](https://vectr.io/) | Emulation exercise tracking; PASS/PARTIAL/FAIL compliance record | 8 |
| [MITRE CALDERA](https://caldera.mitre.org/) | Automated multi-step adversary chains in the lab | 8 |

---

## Minimum-viable path (no full lab)

Run the methodology with git, a text editor, and your existing SIEM. No Docker required.

| Step | Replacement |
|---|---|
| OpenCTI | Manually maintain `02-sources/source-registry.md` and ATT&CK mapping table |
| TheHive | Use a case folder in git with `00-scope/scope.md` as the case record |
| Timesketch | Use `grep`, `jq`, or Excel to build the timeline in `03-analysis/timeline/timeline.md` |
| ATT&CK Navigator | [navigator.attack.mitre.org](https://mitre-attack.github.io/attack-navigator/) (browser) — export layer JSON and commit it |
| Sigma conversion | [Uncoder.io](https://uncoder.io/) for ad-hoc; write rules in Sigma YAML and convert manually |
| Existing SIEM | Deploy converted rules to whatever is running in your environment |

The template folder structure and commit discipline apply equally in the minimal path. The value of CTI as a Code is in the analysis workflow, not the tools.

---

## Step 0 — Clone and start the lab

**Role:** Lab Ops · **Time:** 15 min (first run), 2 min (subsequent)

```bash
git clone https://github.com/anpa1200/CTI_as_a_Code.git
cd CTI_as_a_Code
cp .env.example .env
# Edit .env and set passwords before continuing
sudo sysctl -w vm.max_map_count=262144
docker compose up -d
./scripts/setup.sh
./scripts/health-check.sh
```

> **Tools:** Docker Compose (stack orchestration) · OpenCTI on :8080 · TheHive on :9100 · Cortex on :9002 · Kibana on :5601 · Elasticsearch on :9200.
>
> After `health-check.sh` returns HTTP 200 for all services, run `docker compose --profile connectors up -d` to populate the MITRE ATT&CK technique library in OpenCTI.

See [Quick Start](/quick-start) for port/credential reference and [Services](/services/elasticsearch) for per-service setup details.

---

## Step 1 — Choose mode and copy the template

**Role:** Team Lead · **Time:** 10 min

```bash
cp -r templates/reactive/   investigations/my-org-incident-2025/
cp -r templates/proactive/  assessments/my-org-threat-model-2025/
cp -r templates/full-cycle/ programs/my-org-cti-program-2025/
cp    templates/adversary-emulation.md  exercises/my-org-emulation-2025.md
```

| Mode | Template | Use when | Assignments |
|---|---|---|---|
| **Reactive** | `templates/reactive/` | Incident has occurred; evidence artifacts in hand | A01, A05 |
| **Proactive** | `templates/proactive/` | Building detection capability before an incident | A02, A06 |
| **Full Cycle** | `templates/full-cycle/` | Standing up or maturing a CTI program | A03, A07 |
| **Emulation** | `templates/adversary-emulation.md` | Validating detection coverage against named TTPs | A04, A08 |

Initialize your project folder as its own git repo. Commit after each completed phase so the analytical history is reconstructable:

```bash
cd investigations/my-org-incident-2025/
git init && git add . && git commit -m "PROJ-NNN: scaffold initialized"
```

---

## Step 2 — Scope the project

**Role:** Team Lead · **Time:** 30 min · **File:** `00-scope/scope.md`

> **Tools:** TheHive (create the case with TLP/PAP/severity; attach scope.md as the opening case note; mark "Investigating" only after scope is locked).

Scope creep is the most common way investigation quality degrades. Write and sign off the scope document before any analysis begins.

Required fields:

- **In-scope systems and time range** — explicit; "and related systems" is not a scope boundary
- **Out-of-scope** — be explicit about what you will NOT investigate and why
- **Stakeholders** — who commissioned; who receives deliverables; who approves scope changes
- **PIRs** — 2–5 specific answerable questions; see criteria below
- **Evidence handling constraints** — classification, TLP, data sovereignty, legal hold

### PIR quality criteria

| Criterion | Bad PIR | Good PIR |
|---|---|---|
| Answerable | "What are current threats to our network?" | "Is the Iranian-nexus cluster from CERT-IL CB-2025-041 actively targeting our payment gateway?" |
| Decision-relevant | Generic research topic | Answer drives a board-level go/no-go on infrastructure migration |
| Time-bounded | No deadline stated | "as of Q3 2025" |
| Business-grounded | "our network" | "payment gateway and contractor VPN" |

See [Field Manual — PIR/SIR/EEI Framework](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/pir-sir-eei/) for the complete PIR development methodology.

---

## Step 3a — Reactive: collect and inventory evidence

**Role:** Analyst · **Time:** 2–8 h (varies with evidence volume) · **File:** `01-evidence/README.md`

> **Tools:** Velociraptor (remote Windows/Linux artifact collection; VQL queries for Event IDs 4624, 4688, 7045 and Sysmon events without shipping disk images) · Plaso (normalize heterogeneous log formats into a single super-timeline) · Timesketch (ingest Plaso output; multi-analyst tagging; filtered timeline export) · Hayabusa (Sigma scan against `.evtx` for initial severity triage before Timesketch is configured) · TheHive (attach all artifacts as observables with SHA256 hashes and chain-of-custody timestamps).

Every evidence source gets a row in the inventory before analysis begins:

| Source | Systems | Time Range | Gap | Usability |
|---|---|---|---|---|
| `winlogbeat-host.jsonl` | HOST-01 | 2025-03-16 00:00 – 2025-03-18 23:59 | Sysmon gap 03:00–07:00 IST on 03-17 | High |
| `vpn-gateway-2025-03-17.jsonl` | vpn-gw-01 | 2025-03-17 00:00 – 2025-03-17 23:59 | None | High |
| `vrid-audit-log.jsonl` | db-01 | 2025-03-17 00:00 – 2025-03-17 06:00 | Post-06:00 log rotation missing | Medium |

**Gap discipline:** Every gap gets documented with: what event types are missing, gap duration, what evidence covers the window, and the confidence impact on any claims that depend on that window.

### Evidence label taxonomy

Apply these labels in `claims-ledger.md` and timeline annotations:

| Label | Meaning | Example |
|---|---|---|
| **CONFIRMED** | Event observed directly in two or more independent sources | VPN log + IDS alert both show same session from same source IP |
| **CORROBORATED** | Single source; consistent with adjacent confirmed evidence | VPN log shows session; no IDS alert, but timing aligns with timeline |
| **INFERRED** | Logical inference from confirmed/corroborated evidence; not directly observed | "AiTM token likely replayed based on session timing and UserAgent match" |
| **HYPOTHESIZED** | Plausible explanation with no direct supporting evidence | "Persistence mechanism likely run key; no registry log covers this window" |
| **GAP** | No evidence covering this event window; confidence impact documented | "No Sysmon coverage 03:00–07:00 IST; T1059 activity in this window cannot be confirmed" |

See [Field Manual — Evidence Labels](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/evidence-labels/) for the full labeling convention.

---

## Step 3b — Proactive: assess trigger intelligence

**Role:** Analyst · **Time:** 2–4 h per trigger cycle · **Files:** `01-trigger-intelligence/trigger-assessment.md` + `triggers/TRG-NNN-name.md`

> **Tools:** OpenCTI (import CERT advisories and peer incident reports as Report objects; extract TTPs via the relationship graph) · MISP (subscribe to sector feeds; tag indicators with ATT&CK Galaxy entries for technique correlation) · ATT&CK Navigator (build a "threat landscape" layer from all triggers; techniques appearing across multiple triggers are the highest-priority detection targets).

A trigger is an intelligence input that changes the threat assessment for this specific organization. Each trigger document contains:

- **What happened** — observable fact, not interpretation
- **Source and reliability** — Admiralty Scale (source A–F, information 1–6)
- **Relevance** — why this trigger matters for THIS org specifically
- **Confidence** — High/Medium/Low with rationale
- **ATT&CK techniques implied**
- **Detection action implied**

See [Field Manual — Source Reliability](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/source-reliability/).

---

## Step 3c — Full Cycle: map stakeholders and develop PIRs

**Role:** Team Lead · **Time:** 1–2 days · **Files:** `01-stakeholders/stakeholder-map.md` → `02-pirs/pir-register.md`

> **Tools:** OpenCTI (cross-reference PIRs against existing intelligence reports — identify which PIRs are already partially answered and which need new collection) · MISP (configure feeds aligned to PIR scope; tag MISP events with PIR IDs so incoming intelligence is automatically associated with the requirement it satisfies).

Apply the PIR quality criteria from Step 2. Additionally, classify each PIR by collection feasibility: which existing sources can partially answer it, which require new source development, and which are currently unanswerable.

---

## Step 4 — Analyse

**Role:** Analyst · **Time:** 4–40 h (mode-dependent) · **Files:** `03-analysis/timeline/` (Reactive) · `03-threat-model/` (Proactive) · `04-analysis/claims/` (Full Cycle)

> **Tools:** Timesketch (super-timeline from Plaso output; tag events as `adversary_action`, `gap_start`, `detection_point`) · OpenCTI (create Campaign or Incident object; link timeline events to ATT&CK technique objects) · ATT&CK Navigator (reactive: color by coverage status; proactive: overlay threat landscape against current coverage) · DeTT&CT (score each technique against data sources: distinguishes "rule missing" from "data source absent" — different remediation paths).

### Claims-ledger discipline (all modes)

Every analytical claim in `claims-ledger.md` must carry a claim ID, the assertion, evidence references, confidence, and competing hypotheses:

| ID | Claim | Evidence | Confidence | Competing Hypotheses |
|---|---|---|---|---|
| CL-001 | Adversary authenticated via valid contractor VPN credentials at 02:14 IST on 2025-03-17 | `vpn-gateway-2025-03-17.jsonl` line 4,471 — session from 185.234.x.x, UserID: contractor-07 | High | Legitimate contractor login — ruled out: no prior session from this IP; contractor confirmed offline via HR |
| CL-002 | Full-table SELECT on `biometric_records` at 02:47 IST exfiltrated 340,218 rows | `vrid-audit-log.jsonl` line 892 — `SELECT *` from 185.234.x.x; DB size delta 892.4 MB outbound | High | Scheduled backup — ruled out: backup schedule confirmed at 04:00; no authorized job at 02:47 |

See [Field Manual — Analysis of Competing Hypotheses](https://anpa1200.github.io/cti-analyst-field-manual/docs/analytic-methods/competing-hypotheses/).

---

## Step 5 — ATT&CK mapping and source registration

**Role:** Analyst · **Time:** 1–2 h · **Files:** `03-analysis/attck-mapping/attck-mapping.md` + `02-sources/source-registry.md`

> **Tools:** ATT&CK Navigator (export coverage layer as JSON; commit to `attck-mapping/navigator-layer.json` — creates a version-controlled coverage artifact) · DeTT&CT (`python dettect.py ds -fd datasources.yaml` — generates the data source layer; overlay with threat layer to identify gaps automatically) · OpenCTI (link each ATT&CK technique to the campaign object; builds the intelligence graph for future PIR tasking) · MISP (tag indicators with `mitre-attack-pattern` galaxy entries for structured sharing).

ATT&CK mapping table — reactive mode. The Gap Type column is required; it drives the remediation action:

| # | Tactic | Technique | Sub | Evidence | Confidence | Rule Fired? | Gap Type |
|---|---|---|---|---|---|---|---|
| 1 | Initial Access | T1566.001 | — | Email gateway log | High | Partial | Coverage incomplete — rule fired but attachment hash not extracted |
| 2 | Credential Access | T1557 | — | VPN log anomaly (AiTM session timing) | High | No | Rule missing — data source present, no AiTM detection rule deployed |
| 3 | Exfiltration | T1048 | T1048.003 | DB audit log + netflow egress | High | No | Data source missing — DB audit log not ingested into SIEM |

Gap type taxonomy: **Rule missing** (data source in SIEM, no rule) · **Data source missing** (log not ingested) · **Architectural gap** (log source does not exist or cannot be enabled) · **Partial** (rule fired; missed field, high latency, or incomplete coverage) · **Not applicable** (technique out of scope for this engagement).

---

## Step 6 — Attribution assessment (Reactive)

**Role:** Senior Analyst · **Time:** 1–2 h · **File:** `03-analysis/attribution/attribution.md`

> **Tools:** OpenCTI (compare observed infrastructure against existing threat actor graphs; use relationship similarity for overlap scoring) · Maltego CE (pivot from C2 IP → ASN → TLS certificate CN → co-hosted domains; SAN entries often expose additional actor infrastructure) · MISP (cross-correlate IOCs with community events; a hit on a prior MISP event linking to a named campaign is significant corroboration) · VirusTotal/Shodan (prior detection history, passive DNS, first-seen dates, banner data for C2 infrastructure characterization).

### Attribution confidence ladder

| Confidence | Evidence bar | Language to use |
|---|---|---|
| **High (85%+)** | Infrastructure overlap + tooling match + TTP overlap + independent ISAC or CERT confirmation | "Attributed to [cluster] with high confidence" |
| **Medium-High (65–85%)** | TTP overlap + infrastructure match + no independent confirmation | "Assessed as [cluster] activity based on TTP and infrastructure overlap" |
| **Medium (40–65%)** | TTP overlap; no infrastructure overlap; no independent confirmation | "Tradecraft consistent with [actor] operations; insufficient evidence for attribution" |
| **Low (under 40%)** | TTPs broadly consistent; single vector; no corroboration | "Activity shares characteristics with [actor] tradecraft; attribution is inconclusive" |
| **Insufficient** | Single indicator; no TTP context; no corroboration | "Insufficient evidence to attribute to a named group or cluster" |

Do not assert a named APT group unless the evidence supports it. Prefer: *"Assessed as an Iranian-nexus activity cluster"* over *"This was APT34."* See [Field Manual — Attribution Methodology](https://anpa1200.github.io/cti-analyst-field-manual/docs/attribution/attribution-methodology/).

---

## Step 7 — Derive detections

**Role:** Analyst · **Time:** 30–60 min per rule · **Files:** `04-detections/sigma/DET-NNN-name.yml` + `04-detections/hunt-plans/hunt-plan.md`

> **Tools:** Sigma (write all rules in vendor-neutral YAML; `04-detections/sigma/` is the canonical source of truth — SIEM queries are generated from it, not written directly) · pySigma/sigma-cli (convert to Elastic Lucene, ES\|QL, Splunk SPL, or Sentinel KQL) · Hayabusa (validate each new rule fires against the collected `.evtx` true-positive set before deploying) · Chainsaw (confirm raw event data exists when a rule fails to fire — separates data absence from rule logic errors).

### Sigma rule example

```yaml
title: Office Application Spawning Script Interpreter
id: 6f8a4e2b-1234-5678-abcd-0123456789ab
status: experimental
description: Detects an Office application spawning a script interpreter, consistent with malicious macro or exploit execution (T1566.001).
author: CTI Team
date: 2025-03-18
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        ParentImage|endswith:
            - '\WINWORD.EXE'
            - '\EXCEL.EXE'
        Image|endswith:
            - '\cmd.exe'
            - '\powershell.exe'
            - '\wscript.exe'
            - '\mshta.exe'
    condition: selection
falsepositives:
    - Enterprise Word/Excel macros invoking cmd (rare where macro policy enforced)
level: high
tags:
    - attack.initial_access
    - attack.t1566.001
# Validated: PASS | 2025-03-19 | hayabusa against A01 evtx set
```

### Convert Sigma to Elastic

```bash
pip install pySigma-backend-elasticsearch sigma-cli

# Elastic Lucene query (ECS-mapped)
sigma convert -t lucene -p ecs_windows DET-001-office-spawn-script.yml

# ES|QL (Elasticsearch Query Language)
sigma convert -t esql -p ecs_windows DET-001-office-spawn-script.yml
```

Every Sigma rule must have `falsepositives:` populated (not `Unknown`), `tags:` with the ATT&CK ID, `level:` set, and a validation comment.

See [Field Manual — CTI to Detection](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-to-detection/intelligence-to-detection/).

---

## Step 8 — Execute and score (Emulation)

**Role:** Lab Ops + Analyst · **Time:** 1–2 days

> **Tools:** Invoke-AtomicRedTeam (execute versioned ATT&CK technique test cases; each atomic includes setup, execution, and cleanup steps) · VECTR (track every module execution with PASS/PARTIAL/FAIL, timestamps, and screenshots — this is the compliance record for INCD-CID Section 8 or BoI-CD 362) · CALDERA (automate multi-step adversary chains without scripting each step) · Hayabusa + Chainsaw (post-execution Sigma scan against lab `.evtx` to score coverage without relying on SIEM latency).

Execute modules in kill-chain sequence. Execute log-clearing modules last.

After each module:
1. Capture VECTR result before cleanup
2. Run Hayabusa/Chainsaw against collected lab `.evtx`
3. Score: **PASS** (alert within defined criterion) · **PARTIAL** (alert fired; required field missing or latency exceeded) · **FAIL** (no alert)
4. For FAIL: distinguish **rule missing** vs. **data source not in SIEM** vs. **rule not deployed** (CAB not submitted) — each requires a different remediation path

---

## Step 9 — Produce deliverables

**Role:** Deliverable Owner · **Time:** 2–4 h · **Files:**

| Mode | Deliverable files |
|---|---|
| Reactive | `05-deliverables/executive-brief.md` + `05-deliverables/soc-handoff.md` |
| Proactive | `07-deliverables/executive-brief.md` + `07-deliverables/technical-brief.md` |
| Full Cycle | `07-deliverables/` intelligence products (strategic / tactical / SOC flash) |
| Emulation | `09-compliance-report/compliance-report.md` |

> **Tools:** OpenCTI (`Actions → Export → STIX2` for structured sharing with CERT-IL, MISP, or upstream consumers) · ATT&CK Navigator (export final coverage layer as PNG for executive briefs and compliance reports) · MISP (publish event at TLP:AMBER or TLP:WHITE; distribution level controls reach).

**Executive brief format:** Maximum 1 page. Written for a reader who has not seen the technical analysis. Structure: what happened (1 sentence) · business impact (1–2 sentences) · what was found (3 bullets) · what was not detected (1 sentence) · 3 recommended actions with owners. No SIEM queries, IP addresses, or event IDs.

**SOC handoff format:** Operational package only — current IOC table with TTL and confidence score, rules deployed or pending (with CAB reference), hunting queries for residual activity, escalation criteria for new detections.

For intelligence products differentiated by audience, see [Field Manual — Intelligence Production](https://anpa1200.github.io/cti-analyst-field-manual/docs/intelligence-production/).

---

## Step 10 — Document and commit

**Role:** All · **Time:** 5 min per phase

```bash
git add 00-scope/ 01-evidence/ 03-analysis/
git commit -m "PROJ-001: reactive — evidence inventory and timeline complete"

git add 04-detections/
git commit -m "PROJ-001: detections — DET-001 through DET-004 validated via hayabusa"

git add 05-deliverables/
git commit -m "PROJ-001: deliverables — executive brief and SOC handoff complete"
```

Commit phase by phase — the git log is the audit trail. Never edit committed evidence files; use amendment documents. Never commit in bulk at the end.

**Feedback file:** `07-feedback/feedback.md` or `09-feedback/feedback.md` — what worked, what to improve, gaps that remain. This feeds the next PIR review cycle.

---

## AI-assisted outputs

**Role:** Analyst (review required) · **File:** `08-ai-outputs/`

AI tools (Claude, GPT-4, Gemini) are useful for first-draft generation of structured deliverables: timeline summaries, claims-ledger drafts, ATT&CK mapping tables from narrative reports, Sigma rule skeletons from TTP descriptions, and executive brief drafts.

The `08-ai-outputs/` directory holds AI-generated drafts that have been reviewed and corrected by a human analyst. The AI output is the starting point, not the deliverable. Every AI-generated claim must be verified against evidence before being promoted to `claims-ledger.md` or a deliverable file.

Do not commit AI-generated content to `03-analysis/`, `04-detections/`, or `05-deliverables/` without explicit analyst review and annotation. Evidence labels and confidence levels are analyst judgments — they cannot be delegated to an AI.

---

## Template reference

```
templates/
├── README.md                       ← template selection guide
├── reactive/                       ← A01, A05 patterns
│   ├── project.yml
│   ├── 00-scope/scope.md
│   ├── 01-evidence/README.md
│   ├── 02-sources/source-registry.md
│   ├── 03-analysis/
│   │   ├── timeline/timeline.md
│   │   ├── claims/claims-ledger.md
│   │   ├── attck-mapping/attck-mapping.md
│   │   └── attribution/attribution.md
│   ├── 04-detections/
│   │   ├── sigma/SIGMA-TEMPLATE.yml
│   │   └── hunt-plans/hunt-plan.md
│   └── 05-deliverables/
│       ├── executive-brief.md
│       └── soc-handoff.md
├── proactive/                      ← A02, A06 patterns
│   ├── project.yml
│   ├── 01-trigger-intelligence/
│   ├── 02-crown-jewels/
│   ├── 03-threat-model/
│   ├── 04-detection-backlog/
│   └── 07-deliverables/
├── full-cycle/                     ← A03, A07 patterns
│   ├── project.yml
│   ├── 01-stakeholders/
│   ├── 02-pirs/
│   ├── 03-collection-plan/
│   ├── 04-analysis/
│   ├── 05-sharing/
│   └── 06-governance/
└── adversary-emulation.md          ← A04, A08 patterns
```

Clone and initialize a new project:

```bash
git clone https://github.com/anpa1200/CTI_as_a_Code.git
cp -r CTI_as_a_Code/templates/reactive/ ./my-investigation/
cd my-investigation && git init
git add . && git commit -m "PROJ-NNN: scaffold initialized"
```

---

## Principles

**Evidence precedes conclusions.** The timeline and ATT&CK mapping must be complete before attribution is written. The detection backlog must trace to the ATT&CK mapping. The executive brief must trace to the claims ledger.

**Gaps are first-class findings.** A 4-hour Sysmon gap, a missing log source, a rule that fires too slowly — these are findings with the same standing as a confirmed adversary technique. Document them in the ATT&CK coverage matrix with the same rigor as a PASS.

**Version everything.** Every analytical decision is traceable in git history. The commit log explains why an assessment changed, not just what changed. If you refactor a claim, the previous version is recoverable.

**Confidence is mandatory.** Every claim carries a confidence level (High / Medium / Low) with rationale. "Unknown" is not a confidence level. "Insufficient data to assess" is. See [Field Manual — Estimative Language](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/estimative-language/).

---

## Related resources

| Resource | When to use |
|---|---|
| [Field Manual — Evidence Labels](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/evidence-labels/) | Before writing any claim in steps 4–6 |
| [Field Manual — Source Reliability](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/source-reliability/) | Before registering any collection source in step 3 |
| [Field Manual — CTI to Detection](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-to-detection/intelligence-to-detection/) | Before writing any Sigma rule in step 7 |
| [Field Manual — Attribution Methodology](https://anpa1200.github.io/cti-analyst-field-manual/docs/attribution/attribution-methodology/) | Before writing any attribution assessment in step 6 |
| [Field Manual — PIR/SIR/EEI](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/pir-sir-eei/) | Before writing any PIR in step 3 (full cycle) |
| [Training Assignments](/training) | Work through a populated case to see the methodology applied end-to-end |
| [Ecosystem](/ecosystem) | How Field Manual, Customer-Driven AI CTI, and Israel CTI connect to this project |
