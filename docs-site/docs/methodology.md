---
title: Methodology
sidebar_position: 3
---

# CTI as a Code — Methodology

CTI as a Code applies software engineering discipline to threat intelligence work: every claim is evidence-traced, every detection is version-controlled, every analysis step is reproducible. This page is the practitioner's guide — clone the repo, pick a methodology mode, follow the execution order, and produce portfolio-grade deliverables.

---

## Step 0 — Clone the project and start the lab

```bash
git clone https://github.com/anpa1200/CTI_as_a_Code.git
cd CTI_as_a_Code
cp .env.example .env        # fill in secrets before continuing
sudo sysctl -w vm.max_map_count=262144
docker compose up -d
./scripts/setup.sh          # first-time initialization
./scripts/health-check.sh   # verify all services are up
```

> **Tools:** [Docker Compose](https://docs.docker.com/compose/) · [OpenCTI](https://www.opencti.io/) *(open-source)* · [TheHive 5](https://thehive-project.org/) *(open-source)* · [Cortex](https://github.com/TheHive-Project/Cortex) *(open-source)* · [Elastic SIEM / Kibana](https://www.elastic.co/security) *(open-source core)* · [Logstash](https://www.elastic.co/logstash) *(open-source)*
>
> OpenCTI: STIX2-native intelligence platform — create threat actor profiles, link TTPs, import IOCs, and export investigation outputs as structured intelligence objects. Run the MITRE ATT&CK connector (`docker compose --profile connectors up -d`) to populate all tactics, techniques, and groups. TheHive 5: case management with evidence custody chain; create one case per investigation and attach all evidence sources as observables. Cortex: automated enrichment engine — analyzers run on indicators (IPs, domains, hashes) to pull VirusTotal, Shodan, and passive-DNS data without manual pivoting. Elastic SIEM: detection rule deployment and alert triage; import Sigma rules via the Kibana detection engine API. Logstash: log ingestion pipeline; point Winlogbeat, Filebeat, or custom inputs at port 5044.

After `health-check.sh` returns `HTTP 200` for all services, the lab is ready. See [Quick Start](./quick-start) for detailed port and credential reference.

---

## Step 1 — Choose your methodology and copy the template

```bash
# Reactive investigation (breach, incident, IOC triage)
cp -r templates/reactive/   my-org-incident-2024/

# Proactive threat modeling (pre-incident, detection backlog)
cp -r templates/proactive/  my-org-threat-assessment/

# Full CTI program (PIR framework, sharing, governance)
cp -r templates/full-cycle/ my-org-cti-program/

# Adversary emulation (detection validation)
cp templates/adversary-emulation.md  my-org-emulation-plan.md
```

> **Tools:** [Git](https://git-scm.com/) *(open-source)*
>
> CTI as a Code principle: every project lives in its own folder under version control. Commit after each phase (e.g., `git commit -m "PROJ-001: timeline complete"`). The git history becomes your audit trail — reviewable by CISO, IR Lead, or regulator. Never edit evidence files after committing them. Use a new file or an annotated amendment document instead.

| Mode | Template | Use when | Assignments |
|---|---|---|---|
| **Reactive** | `templates/reactive/` | Incident has occurred; you have evidence artifacts | A01, A05 |
| **Proactive** | `templates/proactive/` | Building detection capability before an incident | A02, A06 |
| **Full Cycle** | `templates/full-cycle/` | Standing up or maturing a CTI program | A03, A07 |
| **Emulation** | `templates/adversary-emulation.md` | Validating detection coverage against specific TTPs | A04, A08 |

---

## Step 2 — Scope the project

**File:** `00-scope/scope.md`

Define what is and is not in scope before analysis begins. Scope creep — adding systems or timeframes during analysis — is one of the most common ways investigation quality degrades. Write the scope statement first and get stakeholder sign-off.

> **Tools:** [TheHive 5](https://thehive-project.org/) *(open-source)*
>
> TheHive: create a case with severity, TLP, PAP markings, and attach the `scope.md` as the first case note. Assign evidence sources as case observables — this creates the custody chain before any analysis runs. Mark the case as "Investigating" only after scope is locked.

Scope document must address:
- **In-scope systems and time range** — explicit; no "and related systems"
- **Out-of-scope systems** — be explicit about what you will NOT investigate and why
- **Stakeholders** — who commissioned this work; who receives deliverables; who approves scope changes
- **PIRs (Priority Intelligence Requirements)** — 2–5 specific questions this project must answer; see the [Field Manual — PIR/SIR/EEI Framework](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/pir-sir-eei/) for how to write PIRs that drive collection
- **Evidence handling constraints** — classification, TLP, data sovereignty, legal holds

---

## Step 3 (Reactive) — Collect and inventory evidence

**File:** `01-evidence/README.md` → evidence inventory table

> **Tools:** [Velociraptor](https://docs.velociraptor.app/) *(open-source)* · [Plaso / log2timeline](https://github.com/log2timeline/plaso) *(open-source)* · [Hayabusa](https://github.com/Yamato-Security/hayabusa) *(open-source)* · [Timesketch](https://timesketch.org/) *(open-source)*
>
> Velociraptor: remote triage artifact collection from Windows/Linux hosts without rebooting; VQL queries extract specific Windows Event IDs (4624, 4688, 4662, 7045), Sysmon events, and registry keys across the entire timeline window — without shipping full raw disk images. Plaso / log2timeline: normalize disparate log formats (Winlogbeat JSON, VPN logs, PAM session exports, firewall logs, DNS resolver logs) into a single super-timeline in bodyfile format. Timesketch: ingest the Plaso output for collaborative multi-analyst investigation; tag adversary events, annotate ambiguous artifacts, and export a filtered timeline for the deliverable. Hayabusa: run Sigma-based detection directly against collected `.evtx` files; generates a CSV timeline with severity scores — especially useful for the initial triage pass before Timesketch is configured. TheHive: attach all collected evidence as case observables with MD5/SHA256 hashes and chain-of-custody timestamps.

For every evidence source, document in the inventory:

| Source | Systems | Time Range | Gap | Usability |
|---|---|---|---|---|
| `winlogbeat-host.jsonl` | HOST-01 | YYYY-MM-DD to YYYY-MM-DD | Sysmon gap 03:00–07:00 IST | High |
| VPN gateway logs | vpn-gw-01 | ... | None | High |

**Gap discipline:** Log gaps must be documented explicitly with: what event types are missing, what the gap duration is, what evidence does cover that window, and the confidence impact on any claims that depend on evidence from the gap window. See [Field Manual — Evidence Labels](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/evidence-labels/) for the correct labeling convention.

---

## Step 3 (Proactive) — Assess trigger intelligence

**File:** `01-trigger-intelligence/trigger-assessment.md` + `triggers/TRG-NNN-name.md` per trigger

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [MITRE ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)*
>
> OpenCTI: import peer incident reports, CERT advisories, and sector threat reports as Report objects; extract actor profiles, TTPs, and IOCs via the relationship graph. MISP: subscribe to sector-specific feeds (CERT-IL, CIRCL OSINT, FS-ISAC if available); tag incoming indicators with ATT&CK Galaxy entries for technique correlation. ATT&CK Navigator: build a "threat landscape" layer from all identified techniques across triggers; the resulting heatmap shows which techniques appear across multiple triggers — these are the highest-priority detection targets.

A trigger is an intelligence input that changes your threat assessment for a specific organization. For each trigger write:

- **What happened / what was reported** (observable fact)
- **Source and reliability** (Admiralty Scale: source A–F, information 1–6); see [Field Manual — Source Reliability](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/source-reliability/)
- **Relevance to this organization** — why does this trigger matter for THIS org specifically, not just the sector
- **Confidence** (High / Medium / Low with rationale)
- **ATT&CK techniques implied**
- **Detection action implied**

---

## Step 3 (Full Cycle) — Map stakeholders and develop PIRs

**Files:** `01-stakeholders/stakeholder-map.md` → `02-pirs/pir-register.md`

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)*
>
> OpenCTI: use the "Intelligence → Reports" workflow to cross-reference PIRs against existing intelligence reports — identify which PIRs are already partially answered by existing collection and which require new sources. MISP: configure collection feeds aligned to PIR scope; MISP event tags should reference PIR IDs so incoming intelligence is automatically associated with the requirement it satisfies.

Each PIR must be:
- **Answerable** — a specific question with a yes/no or assessed answer, not a research topic
- **Decision-relevant** — tied to a stakeholder decision that depends on the answer
- **Time-bounded** — has a deadline or review cadence
- **Business-grounded** — references a specific organizational risk, not a generic threat category

See [Field Manual — PIR/SIR/EEI Framework](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/pir-sir-eei/) for the complete PIR development methodology and worked examples.

---

## Step 4 — Analyse: build the timeline or threat model

**Files:**
- Reactive: `03-analysis/timeline/timeline.md`
- Proactive: `03-threat-model/scenarios/threat-scenarios.md`
- Full Cycle: `04-analysis/claims/claims-ledger.md`

> **Tools:** [Timesketch](https://timesketch.org/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) *(open-source)*
>
> Timesketch: build the chronological super-timeline from Plaso output; add analyst tags (`adversary_action`, `gap_start`, `detection_point`) to distinguish confirmed events from analyst inference. OpenCTI: create a Campaign or Incident object and link each timeline event to ATT&CK technique objects — this produces the structured ATT&CK-mapped report automatically. ATT&CK Navigator: for reactive cases, build a layer coloured by coverage status (green = detected, yellow = partial, red = missed); for proactive cases, overlay the threat landscape heatmap against your current coverage layer. DeTT&CT: score each technique against data sources using the YAML-based model; distinguishes "rule missing" (data source present, no rule) from "architectural gap" (data source absent) — these require different remediation paths.

**Claims discipline (all modes):** Every analytical claim in `claims-ledger.md` must carry:
- A claim ID (CL-NNN)
- The assertion in one sentence
- Supporting evidence references (file, timestamp, line)
- Confidence level (High / Medium / Low)
- Competing hypotheses considered

See [Field Manual — Evidence Labels](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/evidence-labels/) for the full evidence labeling convention. See the [Field Manual — Analysis of Competing Hypotheses](https://anpa1200.github.io/cti-analyst-field-manual/docs/analytic-methods/competing-hypotheses/) for the ACH workflow.

---

## Step 5 — ATT&CK mapping and source registration

**Files:** `03-analysis/attck-mapping/attck-mapping.md` + `02-sources/source-registry.md`

> **Tools:** [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)*
>
> ATT&CK Navigator: export the coverage layer as JSON and commit to `03-analysis/attck-mapping/navigator-layer.json` alongside the mapping table — this creates a reproducible, version-controlled coverage artefact. DeTT&CT: run `dettect.py datasources` against your log source inventory to generate the data source coverage layer; overlay with the threat layer to identify gaps automatically. OpenCTI: link each ATT&CK technique used by the adversary to the campaign object — builds the intelligence graph that feeds future PIR tasking. MISP: tag all indicators with `mitre-attack-pattern` galaxy entries for structured sharing with CERT-IL, sector peers, or downstream consumers.

ATT&CK mapping table format (reactive mode):

| # | Tactic | Technique | Sub | Evidence | Conf | Rule Fired? | Gap Type |
|---|---|---|---|---|---|---|---|
| 1 | Initial Access | T1566.001 | — | Email gateway log | High | Partial | Rule coverage incomplete |
| 2 | Credential Access | T1557 | — | VPN log anomaly | High | No | Rule missing |

Gap types: **Rule missing** (data source present, no rule deployed) · **Data source missing** (log source not in SIEM) · **Architectural gap** (log source does not exist — e.g., SS7 no logging) · **Partial** (rule fired but with significant delay or missing field)

---

## Step 6 (Reactive) — Attribution assessment

**File:** `03-analysis/attribution/attribution.md`

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [Maltego CE](https://www.maltego.com/maltego-community/) *(freemium)* · [VirusTotal](https://www.virustotal.com/) *(freemium)* · [Shodan](https://www.shodan.io/) *(freemium)*
>
> OpenCTI: compare observed infrastructure against existing threat actor profile graphs — does the C2 IP appear in prior campaigns? Does the tooling match known malware families? Use the "similarity score" and manual relationship review to identify overlap. MISP: cross-correlate IOCs from this incident with community events; a hit on a prior MISP event linking to a named campaign is significant corroborating evidence. Maltego CE: pivot from C2 IP → ASN → certificate CN → co-hosted domains; TLS certificate Subject Alternative Names frequently expose additional actor infrastructure not yet in threat intel feeds. VirusTotal: check prior detection history and passive DNS for C2 domains and IPs — first-seen date, associated files, and community comments. Shodan: query C2 IP for exposed services and banner data; open ports inconsistent with a legitimate CDN are an indicator of threat actor infrastructure.

**Attribution language discipline:** Never assert a named APT group unless the evidence supports it. Use the correct confidence language:

- *"Assessed as a [region]-nexus activity cluster"* — assessed, not confirmed
- *"Tradecraft consistent with publicly documented [actor] operations"* — comparison, not identity
- *"Insufficient evidence to attribute to a named group"* — accurate when you don't have enough

See [Field Manual — Attribution Methodology](https://anpa1200.github.io/cti-analyst-field-manual/docs/attribution/attribution-methodology/) for the complete framework including competing hypotheses, Admiralty Scale, and the confidence escalation ladder.

---

## Step 7 — Derive detections

**Files:** `04-detections/sigma/DET-NNN-name.yml` + `04-detections/hunt-plans/hunt-plan.md`

> **Tools:** [Sigma](https://sigmahq.io/) *(open-source)* · [pySigma](https://github.com/SigmaHQ/pySigma) *(open-source)* · [Uncoder.io](https://uncoder.io/) *(free web)* · [Hayabusa](https://github.com/Yamato-Security/hayabusa) *(open-source)* · [Chainsaw](https://github.com/WithSecureLabs/chainsaw) *(open-source)* · [Elastic SIEM](https://www.elastic.co/security) *(open-source core)*
>
> Sigma: write all detection rules in vendor-neutral YAML; version-control in `04-detections/sigma/`. The sigma/ directory is the canonical source of truth — SIEM-specific queries are generated from it, not written directly. pySigma: convert Sigma YAML to Elastic KQL, Splunk SPL, or Microsoft Sentinel KQL using `sigma convert -t es-qs -p ecs_windows rule.yml`. Uncoder.io: paste Sigma YAML in the browser for instant multi-platform conversion — faster for ad-hoc rule validation. Hayabusa: validate each new Sigma rule against the collected `.evtx` files to confirm it fires on the known true-positive events before deploying to production. Chainsaw: run a rapid Sigma scan across all collected event logs to verify that the raw event data exists before blaming the rule logic. Elastic SIEM: deploy validated rules via the Kibana detection engine or via the API (`POST /api/detection_engine/rules`); test against the incident index before activating on the live stream.

Every Sigma rule must include:
- `detection:` logic with at minimum one filter that reduces false positives
- `falsepositives:` populated — not left as `Unknown`
- `tags:` with the ATT&CK technique ID
- `level: critical | high | medium | low`
- Emulation annotation in a comment block: `# Validated: PASS/PARTIAL/FAIL | [date] | [test method]`

See [Field Manual — CTI to Detection](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-to-detection/intelligence-to-detection/) for the complete conversion methodology from CTI report to deployed Sigma rule.

---

## Step 8 (Emulation mode) — Execute and score

> **Tools:** [Invoke-AtomicRedTeam](https://github.com/redcanaryco/invoke-atomicredteam) *(open-source)* · [VECTR](https://vectr.io/) *(open-source community edition)* · [MITRE CALDERA](https://caldera.mitre.org/) *(open-source)* · [Hayabusa](https://github.com/Yamato-Security/hayabusa) *(open-source)* · [Chainsaw](https://github.com/WithSecureLabs/chainsaw) *(open-source)*
>
> Invoke-AtomicRedTeam: execute specific ATT&CK technique test cases from the Atomic Red Team library against lab hosts; each test is a versioned, documented procedure with setup, execution, and cleanup steps. VECTR: track every test module execution with PASS/PARTIAL/FAIL scoring, timestamps, and screenshots — this is the compliance evidence record for INCD-CID Section 8, BoI-CD 362, or similar requirements. MITRE CALDERA: automate multi-step adversary chains using the plugin-based agent; useful for simulating lateral movement sequences without scripting each step manually. Hayabusa and Chainsaw: run post-execution Sigma scans against lab event logs to confirm which rules fired and which were missed — produces the coverage matrix evidence without relying on SIEM alerting latency.

Execute modules in kill-chain sequence. **Execute log-clearing modules last.** After execution:
1. Capture all VECTR results before any cleanup
2. Run Hayabusa/Chainsaw against collected lab `.evtx` files to confirm evidence
3. Score each module: PASS (alert within criterion), PARTIAL (alert but with field missing), FAIL (no alert)
4. Distinguish FAIL types: rule missing vs. data source missing vs. rule not deployed (CAB not submitted)

---

## Step 9 — Produce deliverables

**Files:**
- Reactive: `05-deliverables/soc-handoff.md` + `05-deliverables/executive-brief.md`
- Proactive: `07-deliverables/executive-brief.md` + `07-deliverables/technical-brief.md`
- Full Cycle: `07-deliverables/` intelligence products (strategic, tactical, SOC flash)
- Emulation: `09-compliance-report/compliance-report.md`

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)*
>
> OpenCTI: export the incident or campaign graph as a STIX2 bundle (`Actions → Export → STIX2`) for structured sharing with CERT-IL, MISP, or upstream consumers. ATT&CK Navigator: export the final coverage layer as a PNG for embedding in executive briefs and compliance reports — a color-coded ATT&CK matrix communicates coverage status faster than any table. MISP: publish the MISP event at TLP:AMBER or TLP:WHITE to share indicators with sector peers; use the distribution level to control reach.

**Executive brief format:** Maximum 1 page. Written for a reader who has not seen the technical analysis. Contains: what happened (1 sentence), business impact (1–2 sentences), what was found (3 bullets), what was not detected (1 sentence), 3 recommended actions with owners. Does not contain: SIEM queries, IP addresses, event IDs.

**SOC handoff format:** Contains the operational package only — current IOC table with TTL and RF score, rules deployed or pending deployment, hunting queries for residual activity, escalation criteria for new detections.

For intelligence products differentiated by audience, see [Field Manual — Intelligence Production](https://anpa1200.github.io/cti-analyst-field-manual/docs/intelligence-production/).

---

## Step 10 — Document and commit

```bash
git add .
git commit -m "PROJ-NNN: [phase] complete — [one-line summary]"
```

> **Commit discipline:** The commit log is the audit trail. Each commit message should identify the project, the phase completed, and a factual summary. Do not commit in bulk at the end — commit phase by phase so the analytical history is reconstructed accurately.

**Feedback file:** `07-feedback/feedback.md` or `09-feedback/feedback.md` — document what worked, what to improve, and what gaps remain. This feeds the next PIR review cycle and improves future investigations.

---

## Template reference

Three blank scaffolds are in the `templates/` folder. Copy the one matching your methodology mode:

```
templates/
├── README.md                   ← template selection guide
├── reactive/                   ← for A01, A05 patterns
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
│       ├── soc-handoff.md
│       └── executive-brief.md
├── proactive/                  ← for A02, A06 patterns
│   ├── project.yml
│   ├── 01-trigger-intelligence/
│   ├── 02-crown-jewels/
│   ├── 03-threat-model/
│   ├── 04-detection-backlog/
│   └── 07-deliverables/
├── full-cycle/                 ← for A03, A07 patterns
│   ├── project.yml
│   ├── 01-stakeholders/
│   ├── 02-pirs/
│   ├── 03-collection-plan/
│   ├── 04-analysis/
│   ├── 05-sharing/
│   └── 06-governance/
└── adversary-emulation.md      ← for A04, A08 patterns
```

Full template content is in the [GitHub repository](https://github.com/anpa1200/CTI_as_a_Code/tree/main/templates). Clone and copy:

```bash
git clone https://github.com/anpa1200/CTI_as_a_Code.git
cp -r CTI_as_a_Code/templates/reactive/ ./my-investigation/
cd my-investigation
git init
git add .
git commit -m "PROJ-NNN: scaffold initialized"
```

---

## Principles

**Evidence precedes conclusions.** The timeline and ATT&CK mapping must be complete before attribution is written. The detection backlog must trace to the ATT&CK mapping. The executive brief must trace to the claims ledger. Working backwards from a preferred conclusion is not methodology — it is confirmation bias with extra steps.

**Gaps are first-class findings.** A 4-hour Sysmon gap, a missing log source, a rule that fires too slowly — these are findings with the same standing as a confirmed adversary technique. Document them in the ATT&CK coverage matrix with the same rigor as a PASS.

**Version everything.** Every analytical decision is traceable in git history. The commit log explains why an assessment changed, not just what changed. If you refactor a claim, the previous version is recoverable.

**Confidence is mandatory.** Every claim carries a confidence level (High / Medium / Low) with the rationale. "Unknown" is not a confidence level. "Insufficient data to assess" is. See [Field Manual — Estimative Language](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/estimative-language/) for the confidence framework.

---

## Related resources

| Resource | When to use |
|---|---|
| [Field Manual — Evidence Labels](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/evidence-labels/) | Before writing any claim in steps 4–6 |
| [Field Manual — Source Reliability](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/source-reliability/) | Before registering any collection source in step 3 |
| [Field Manual — CTI to Detection](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-to-detection/intelligence-to-detection/) | Before writing any Sigma rule in step 7 |
| [Field Manual — Attribution Methodology](https://anpa1200.github.io/cti-analyst-field-manual/docs/attribution/attribution-methodology/) | Before writing any attribution assessment in step 6 |
| [Field Manual — PIR/SIR/EEI](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/pir-sir-eei/) | Before writing any PIR in step 3 (full cycle) |
| [Training Assignments](./training) | Work through a populated case to see the methodology applied end-to-end |
| [Ecosystem](./ecosystem) | Understand how Field Manual, Customer-Driven AI CTI, and Israel CTI fit together |
