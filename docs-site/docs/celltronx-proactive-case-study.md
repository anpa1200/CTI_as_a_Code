---
id: celltronx-proactive-case-study
title: "CTI as a Code in Practice: Proactive Assessment — CelltronX Telecom"
sidebar_position: 4
---

# CTI as a Code in Practice: Proactive Assessment — CelltronX Telecom

**A complete walkthrough of the proactive methodology applied to a real training scenario: MuddyWater targeting Israeli telecom, five attack scenarios, a detection backlog, and five Sigma rules ready for deployment.**

*All organizations, names, and data are fictional. MuddyWater TTPs are drawn from published threat intelligence (CISA, Proofpoint, Deep Instinct, Symantec). This is training assignment A02 from the CTI as a Code repository.*

---

<figure>
<img src="/img/celltronx/cert-il-advisory-IL-2024-TAL-0847.png" alt="CERT-IL Advisory IL-2024-TAL-0847 — MuddyWater targeting Israeli telecom operators" />
<figcaption>CERT-IL Advisory IL-2024-TAL-0847 (TLP:AMBER, 2024-08-11) — the trigger for this assessment. MuddyWater targeting Israeli MNOs via SimpleHelp RMM lures, EMS portal exploitation, and roaming API credential collection.</figcaption>
</figure>

---

## Contents

- [The Scenario](#the-scenario)
- [Step 00: Initialize the Assessment Project](#step-00-initialize-the-assessment-project)
- [Step 0: Intake — Before Any Source Is Opened](#step-0-intake--before-any-source-is-opened)
- [Step P1: Trigger Intelligence — Three Sources Before You Believe Anything](#step-p1-trigger-intelligence--three-sources-before-you-believe-anything)
- [Step P2: Crown Jewels Analysis — What the Actor Would Take](#step-p2-crown-jewels-analysis--what-the-actor-would-take)
- [Step P3: Threat Actor Intelligence — MuddyWater Working Profile](#step-p3-threat-actor-intelligence--muddywater-working-profile)
- [Step P4: Attack Scenario Modeling — Five Paths In](#step-p4-attack-scenario-modeling--five-paths-in)
- [Step P5: Detection Gap Analysis — What Would Actually Fire](#step-p5-detection-gap-analysis--what-would-actually-fire)
- [Step P6: Detection Backlog — Five Rules the SOC Can Deploy This Week](#step-p6-detection-backlog--five-rules-the-soc-can-deploy-this-week)
- [Step P7: Deliverables — What Each Stakeholder Gets](#step-p7-deliverables--what-each-stakeholder-gets)
- [The Git History: What a Completed Assessment Looks Like](#the-git-history-what-a-completed-assessment-looks-like)
- [Key Lessons](#key-lessons)

---

## The Scenario

**CelltronX Telecom Ltd.** is a mid-sized Israeli mobile network operator headquartered in Tel Aviv. It operates a nationwide 4G/5G network with 8.2 million subscribers, 2,400 employees, and a technology stack built on Ericsson RAN, Comverse HLR, and Teligent SS7 gateway infrastructure. It is not a household name outside Israel — which is precisely what makes it attractive for intelligence collection rather than disruption.

On **Monday, 12 August 2024 at 09:15 IST**, the CISO receives a TLP:AMBER advisory from CERT-IL:

```
CERT-IL Advisory: IL-2024-TAL-0847
Classification: TLP:AMBER
Date: 2024-08-11

Iranian-nexus threat actor cluster assessed as MuddyWater (MOIS) has been
conducting targeted reconnaissance against Israeli mobile network operators
and their technology vendors. Observed activity includes:

  - LinkedIn profiling of network engineers and EMS administrators
  - Spear-phishing with SimpleHelp RMM lures posing as IT helpdesk onboarding
  - Attempted exploitation of internet-exposed Element Management System portals
  - Collection of roaming partner API credentials

Two Israeli MNOs have reported unauthorised access to roaming partner management
interfaces in Q3 2024. CERT-IL assesses intent: subscriber location data and
roaming interconnect credential collection.

IOCs: [RESTRICTED — TLP:AMBER — distributed separately]

Recommended actions: audit internet-exposed management portals, enforce MFA
on remote access, review roaming partner API key rotation schedule.
```

The CISO forwards the advisory with a single line: **"Are we exposed?"**

That question is the entire scope of this assessment. It has three answers that matter:

1. Does CelltronX match this actor's targeting criteria? *(PIR-001)*
2. If they walked in today, which systems would they reach and which controls would stop them? *(PIR-002)*
3. What is the minimum detection investment to change that picture? *(PIR-003)*

The assessment is proactive — no incident has occurred. The goal is not to find what happened. The goal is to answer those three questions before something does.

---

## Step 00: Initialize the Assessment Project

**Before opening a single source.** The folder structure is created, committed, and named before any analysis begins. This is not bureaucracy — it is the chain of custody for your analytical conclusions.

### 1. Clone the repository (one-time setup)

```bash
cd ~
git clone https://github.com/anpa1200/CTI_as_a_Code.git
```

This clone is your template source. Never do analysis inside it. Pull updates periodically:

```bash
cd ~/CTI_as_a_Code && git pull
```

### 2. Create your assessments folder

```bash
mkdir -p ~/assessments
```

Assessments are separate from reactive investigations. Use `~/investigations` for reactive cases and `~/assessments` for proactive work — they have different template structures.

### 3. Copy the proactive template

```bash
cp -r ~/CTI_as_a_Code/templates/proactive/ ~/assessments/ASSESS-2024-002-celltronx
```

Naming convention: `ASSESS-[YYYY]-[NNN]-[org-slug]`. Verify the structure:

```bash
ls ~/assessments/ASSESS-2024-002-celltronx/
```

Expected:
```
00-scope/     01-triggers/    02-sources/     03-analysis/
04-detections/   05-deliverables/   06-ai-outputs/   07-feedback/
README.md   intake-form.md   project.yml
```

The proactive template differs from reactive in two places: `01-triggers/` instead of `01-evidence/` (you are building the threat picture, not cataloguing collected evidence), and `03-analysis/` contains `crown-jewels/`, `actor/`, `scenarios/`, and `gap-map/` subdirectories instead of `timeline/` and `claims/`.

### 4. Initialize git inside the assessment folder

```bash
cd ~/assessments/ASSESS-2024-002-celltronx
git init
git add .
git commit -m "ASSESS-2024-002: scaffold initialized from proactive template — MuddyWater trigger"
```

This is commit zero. The CERT-IL advisory arrived on August 11. This commit timestamp proves the assessment began on August 12 — before any conclusions were drawn.

### 5. Fill in `project.yml`

```bash
nano project.yml
```

```yaml
project:
  id: "ASSESS-2024-002"
  name: "CelltronX Telecom — MuddyWater Proactive Assessment"
  type: proactive
  classification: TLP:AMBER
  status: in-progress

analyst:
  name: "Your Name"
  role: "CTI Analyst"
  contact: "your@email.com"

timeline:
  trigger_date: "2024-08-11"       # CERT-IL advisory received
  assessment_start: "2024-08-12"
  pir_deadline: "2024-08-16"       # 4 business days — CISO deadline
  delivery_deadline: "2024-08-20"

trigger:
  type: cert-advisory
  reference: "IL-2024-TAL-0847"
  actor: "MuddyWater"
  source: "CERT-IL TLP:AMBER"

pirs:
  - id: PIR-001
    question: "Does CelltronX match MuddyWater's current targeting criteria for Israeli telecom operators?"
    priority: high
    status: open
    due: "2024-08-16"
  - id: PIR-002
    question: "Which crown jewel systems are reachable via documented MuddyWater attack paths, and which existing controls would fail to detect or stop the actor?"
    priority: high
    status: open
    due: "2024-08-16"
  - id: PIR-003
    question: "What is the minimum detection investment to achieve material coverage against this actor's known TTPs within a two-week sprint?"
    priority: medium
    status: open
    due: "2024-08-20"

scope:
  in_scope:
    - "HLR subscriber database (Comverse — 8.2M records)"
    - "SS7/Sigtran gateway (Teligent SGW-4800)"
    - "Element Management System portal (Ericsson ENM — internet-exposed)"
    - "Roaming partner API gateway"
    - "Core network management VPN (Cisco AnyConnect)"
    - "Vendor remote access portal"
  out_of_scope:
    - "Active penetration testing or exploitation"
    - "Live SS7 traffic interception (legal constraint — ISP licensing)"
    - "Subscriber PII — referenced by system name only"

deliverables:
  - type: executive-brief
    status: pending
    audience: ciso
  - type: soc-handoff
    status: pending
    audience: soc-lead
  - type: sigma-rules
    count: 0
    status: pending
  - type: attck-navigator-layer
    status: pending

notes: "CERT-IL advisory IOCs distributed under TLP:AMBER — do not share beyond CelltronX security team. No penetration testing scope — assessment is threat-intelligence-led, not technical."
```

**Write `unknown` for fields you do not yet have values for.** A blank field means you forgot to fill it in. `unknown` means you checked and the answer is genuinely not yet available.

### 6. Commit the filled metadata

```bash
git add project.yml
git commit -m "ASSESS-2024-002: project.yml filled — 3 PIRs, CISO deadline Aug 16, TLP:AMBER scope"
```

The folder is now named, scoped, and version-controlled. The intake call can begin.

---

## Step 0: Intake — Before Any Source Is Opened

The CERT-IL advisory tells you the actor. The intake tells you the organization. You need both before you can say anything useful about exposure.

Run the intake as a structured call with the CISO and IT security lead. Use the template:

```bash
cp ~/CTI_as_a_Code/templates/proactive/intake-form.md \
   00-scope/intake-2024-08-12.md
nano 00-scope/intake-2024-08-12.md
```

### 1. Organization profile

```markdown
## Organization Profile

Organization: CelltronX Telecom Ltd.
Sector: Telecommunications — mobile network operator
Size: 2,400 employees
Subscribers: 8.2 million
Infrastructure: 4G/5G nationwide, Ericsson RAN, Comverse HLR, Teligent SS7
Headquarters: Tel Aviv
Regulatory: Israeli Communications Law, PDPA 2024
```

### 2. Internet-exposed assets (fill during the call — this changes everything)

Ask: *"Walk me through every system your team can reach from the internet without being on-site or on VPN."*

```markdown
## Internet-Exposed Assets

| System | URL / Port | Auth method | MFA? | Notes |
|---|---|---|---|---|
| Ericsson ENM portal | 185.x.x.x:443 | LDAP | No | Used by NOC engineers and Ericsson vendors |
| Roaming partner API | api.celltronx.co.il | API key (static) | N/A | 3 of 14 partners over HTTP |
| Core VPN (AnyConnect) | vpn.celltronx.co.il | LDAP + cert | Partial | 2 of 6 vendors — no MFA |
| Customer portal | my.celltronx.co.il | Username/password | SMS OTP | Out of scope |
| Vendor remote access | vendor.celltronx.co.il | Certificate | No | Comverse, Ericsson, Teligent |
```

**Stop the call here.** ENM on port 443 with no MFA is a critical finding. It takes 20 seconds for an actor with a vendor account password to authenticate. Note it now and come back to it in Step P4.

### 3. Installed tooling inventory

Ask: *"Do you use SimpleHelp, ScreenConnect, AnyDesk, or other remote support tools?"*

```markdown
## Remote Access and Support Tools

SimpleHelp: INSTALLED — IT helpdesk uses it for end-user support
  Server: simplehelp.celltronx.co.il (internal)
  Clients: installed on ~340 Windows workstations
  Approved server list: not formally documented

ScreenConnect: not installed
AnyDesk: not installed
TeamViewer: 2 machines — developer use, not centrally managed
```

**This is the second critical finding.** SimpleHelp is MuddyWater's preferred RMM tool. It is already installed. An actor who deploys SimpleHelp connecting to their own server will be indistinguishable from the legitimate IT helpdesk unless someone is watching outbound SimpleHelp connections.

### 4. Logging and detection coverage

Ask: *"What goes into your SIEM and what does not?"*

```markdown
## SIEM Coverage Inventory

In SIEM (Elastic):
  - Windows Security events — DCs and workstations (servers: 60%)
  - Perimeter firewall flows (ingress/egress — no east-west)
  - CrowdStrike EDR — workstations and 40% of servers
  - Cisco AnyConnect VPN authentication logs
  - Active Directory authentication (EID 4624, 4625, 4648)

NOT in SIEM (gaps):
  - Ericsson ENM audit log — NOT FORWARDED
  - WMI Operational log — NOT COLLECTED anywhere
  - Roaming API gateway access log — local only, not shipped
  - SS7/Sigtran signalling — no MAP/TCAP inspection capability
  - SimpleHelp connection log — not forwarded to SIEM
  - Vendor VPN session detail — authentication logged, no session content
```

### 5. Recent security events

Ask: *"Any unusual activity in the past 90 days — failed logins, new remote tools installed, vendor access outside normal hours?"*

```markdown
## Recent Events (Last 90 Days)

2024-06-03: Ericsson engineer logged into ENM at 02:30 IST — NOC confirmed it was
            a scheduled maintenance window. No ticket opened.
2024-07-14: 47 failed LDAP login attempts from 91.x.x.x — classified as scanner
            noise, no action taken.
2024-08-01: IT helpdesk reported 3 employees received "IT Support — new SimpleHelp
            client required" email. Two clicked. One installed the binary. IT removed
            the binary manually. Incident not formally documented.
```

**The August 1 event is significant.** An employee installed an unverified SimpleHelp binary 11 days before the CERT-IL advisory. This may be a failed initial access attempt. Add to `01-triggers/` as a secondary trigger and assess in Step P1.

### 6. Commit the intake

```bash
git add 00-scope/intake-2024-08-12.md
git commit -m "ASSESS-2024-002: intake complete — 5 critical findings: ENM no MFA, SimpleHelp installed, WMI gap, no ENM SIEM visibility, Aug-1 suspicious install event"
```

---

## Step P1: Trigger Intelligence — Three Sources Before You Believe Anything

You have one trigger — a CERT-IL advisory. That is not enough. You need three independent sources before you accept the actor attribution and build scenarios around it.

**Rule:** Actor attribution from a single source is a hypothesis. Attribution from three independent sources is an analytic judgment.

### 1. Open VS Code and create the intelligence query file

```bash
code ~/assessments/ASSESS-2024-002-celltronx/
```

Create `03-analysis/actor/intel-queries.http`. VS Code REST Client extension will run every block with one click.

```http
### Intel Queries — ASSESS-2024-002 CelltronX
### Source 1: OpenCTI internal platform
### Source 2: MISP threat intel sharing
### Source 3: Public reporting cross-reference

@OPENCTI_URL = http://localhost:8080
@OPENCTI_TOKEN = your_opencti_token_here
@MISP_URL = http://localhost:8081
@MISP_KEY = your_misp_key_here

# ── OpenCTI ──────────────────────────────────────────────────────────────────

### OpenCTI — MuddyWater threat actor object
GET {{OPENCTI_URL}}/api/v1/stix/domain-objects?types=threat-actor&name=MuddyWater
Authorization: Bearer {{OPENCTI_TOKEN}}

###

### OpenCTI — All ATT&CK techniques attributed to MuddyWater
GET {{OPENCTI_URL}}/api/v1/stix/relationships?fromId=MUDDYWATER_ID&type=uses&toTypes=attack-pattern&limit=50
Authorization: Bearer {{OPENCTI_TOKEN}}

###

### OpenCTI — Infrastructure attributed to MuddyWater (last 90 days)
GET {{OPENCTI_URL}}/api/v1/stix/observables?createdAfter=2024-05-01&markedBy=MuddyWater&types=domain-name,ipv4-addr
Authorization: Bearer {{OPENCTI_TOKEN}}

###

### OpenCTI — Malware families linked to MuddyWater
GET {{OPENCTI_URL}}/api/v1/stix/relationships?fromId=MUDDYWATER_ID&type=uses&toTypes=malware
Authorization: Bearer {{OPENCTI_TOKEN}}

# ── MISP ─────────────────────────────────────────────────────────────────────

### MISP — Events tagged MuddyWater, last 60 days
POST {{MISP_URL}}/events/restSearch
Authorization: {{MISP_KEY}}
Content-Type: application/json

{
  "tags": ["misp-galaxy:threat-actor=\"MuddyWater\""],
  "last": "60d",
  "type": ["domain", "ip-dst", "url", "filename", "md5", "sha256"],
  "to_ids": 1,
  "limit": 100
}

###

### MISP — Attribute search for SimpleHelp-related IOCs
POST {{MISP_URL}}/attributes/restSearch
Authorization: {{MISP_KEY}}
Content-Type: application/json

{
  "value": "%simplehelp%",
  "type": "domain",
  "tags": ["misp-galaxy:threat-actor=\"MuddyWater\""]
}
```

### 2. Pull and parse the OpenCTI response

Click **Send Request** on the MuddyWater actor block. Response pane:

```json
{
  "name": "MuddyWater",
  "aliases": ["TEMP.Zagros", "Seedworm", "Mango Sandstorm", "Storm-0842", "TA450"],
  "first_seen": "2017-01-01",
  "last_seen": "2024-08-09",
  "sophistication": "intermediate",
  "primary_motivation": "organizational-gain",
  "country": "IR",
  "sectors": ["telecommunications", "government", "defense", "education", "financial"],
  "regions": ["Israel", "Saudi Arabia", "Turkey", "Jordan", "UAE", "India", "Pakistan"]
}
```

Extract TTP list in the terminal (`Ctrl+`` `):

```bash
jq -r '.objects[] | select(.type == "attack-pattern") |
  [.external_references[0].external_id, .name] | @tsv' \
  03-analysis/actor/opencti-muddywater-bundle.json | sort
```

Output (2024 campaigns, telecom-relevant):

```
T1059.001   Command and Scripting Interpreter: PowerShell
T1078.003   Valid Accounts: Local Accounts
T1090.001   Proxy: Internal Proxy
T1105       Ingress Tool Transfer
T1110.003   Password Spraying
T1133       External Remote Services
T1219       Remote Access Software
T1505.003   Server Software Component: Web Shell
T1566.001   Phishing: Spearphishing Attachment
T1566.002   Phishing: Spearphishing Link
T1572       Protocol Tunneling
T1583.001   Acquire Infrastructure: Domains
T1590.005   Gather Victim Network Information: IP Addresses
T1592.002   Gather Victim Host Information: Software
```

Save to actor profile:

```bash
jq -r '.objects[] | select(.type == "attack-pattern") |
  .external_references[0].external_id' \
  03-analysis/actor/opencti-muddywater-bundle.json \
  > 03-analysis/actor/muddywater-attck-techniques.txt
```

**Source 1 verdict: CelltronX is in sector (telecommunications) and region (Israel). Targeting criteria match.**

### 3. Pull and parse the MISP response

Click **Send Request** on the MISP events block. Extract IOCs into hunt files:

```bash
# C2 IPs
jq -r '.response[] | select(.Attribute.type == "ip-dst") | .Attribute.value' \
  03-analysis/actor/misp-muddywater-response.json \
  > 03-analysis/actor/muddywater-c2-ips.txt

# Malicious domains
jq -r '.response[] | select(.Attribute.type == "domain") | .Attribute.value' \
  03-analysis/actor/misp-muddywater-response.json \
  > 03-analysis/actor/muddywater-domains.txt

# Filenames
jq -r '.response[] | select(.Attribute.type == "filename") | .Attribute.value' \
  03-analysis/actor/misp-muddywater-response.json \
  > 03-analysis/actor/muddywater-filenames.txt

wc -l 03-analysis/actor/muddywater-*.txt
```

Output:
```
 4 03-analysis/actor/muddywater-c2-ips.txt
 8 03-analysis/actor/muddywater-domains.txt
 7 03-analysis/actor/muddywater-filenames.txt
```

**Immediately check against CelltronX proxy logs:**

```bash
# Check C2 IPs against proxy access log (replace with your SIEM query equivalent)
grep -Ff 03-analysis/actor/muddywater-c2-ips.txt /path/to/proxy/access.log | wc -l
# Result: 0 — no hits (not currently compromised by this infrastructure)

# Check SimpleHelp-related domains
grep -Ff 03-analysis/actor/muddywater-domains.txt /path/to/dns/queries.log | wc -l
# Result: 0 — no hits
```

Zero hits on current infrastructure. This does **not** mean no compromise — it means no compromise via this specific known infrastructure. The August 1 incident (suspicious SimpleHelp install) used a binary, not a domain that would appear in DNS logs.

**Source 2 verdict: 19 IOCs retrieved. Three overlap with CERT-IL advisory — attribution independently corroborated.**

### 4. Cross-reference public reporting (Source 3)

Create `03-analysis/actor/public-sources.md`:

```markdown
## Public Reporting Cross-Reference

### Source: CISA Advisory AA24-241A (August 2024)
- MuddyWater using SimpleHelp 5.3.x exploitation + RMM for persistent access
- Spear-phishing lures masquerading as IT helpdesk onboarding
- Targets: government, telecommunications, defense sectors
- IOC overlap with MISP: YES (2 of 4 C2 IPs match)
- Relevance to CelltronX: HIGH — SimpleHelp is installed, sector matches

### Source: Proofpoint TA450 Report (July 2024)
- TA450 (MuddyWater alias) phishing campaigns with RMM lures
- Subject lines: "IT Support — Required Software Update" / "Helpdesk Onboarding"
- Aug-1 incident at CelltronX matches this pattern exactly
- IOC overlap with MISP: PARTIAL (domains not exact match — similar pattern)
- Relevance to CelltronX: CRITICAL — Aug-1 incident matches this campaign TTPs

### Source: Deep Instinct Blog — DarkDoor Backdoor (June 2024)
- DarkDoor backdoor specifically targeting Ericsson ENM (Element Management System)
- Post-exploitation after initial RMM access
- Used for network topology enumeration and base station configuration access
- Relevance to CelltronX: CRITICAL — CelltronX runs Ericsson ENM, exposed to internet
```

**Source 3 verdict: Three independent public reports confirm the same campaign targeting Israeli telecom with SimpleHelp RMM lures. Deep Instinct report specifically names Ericsson ENM — which CelltronX has exposed on the internet with no MFA.**

### 5. PIR-001 answer

```markdown
## PIR-001 Answer

Question: Does CelltronX match MuddyWater's current targeting criteria?

Answer: YES — HIGH CONFIDENCE

Evidence:
  - Sector match: telecommunications (confirmed in OpenCTI, CISA AA24-241A)
  - Region match: Israel (confirmed in OpenCTI, CERT-IL advisory)
  - Infrastructure match: Ericsson ENM exposed (confirmed target in Deep Instinct report)
  - Tool match: SimpleHelp installed (actor's preferred RMM — CISA AA24-241A)
  - Incident overlap: Aug-1 phishing attempt matches TA450 lure pattern (Proofpoint)
  - IOC overlap: 3 MISP IOCs match CERT-IL advisory independently

Sources: 3 independent (OpenCTI internal, MISP threat sharing, public reporting)
Confidence: HIGH
```

### 6. Commit trigger intelligence

```bash
git add 03-analysis/actor/ 01-triggers/
git commit -m "ASSESS-2024-002: trigger intelligence complete — PIR-001 answered YES HIGH CONFIDENCE; 3 independent sources; Aug-1 incident overlaps TA450 lure pattern"
```

---

## Step P2: Crown Jewels Analysis — What the Actor Would Take

Do not model attack scenarios before you know what matters. The crown jewels register is the input that determines which scenarios are Priority 1 and which are theoretical.

Score each asset on three dimensions:
- **Business Impact** (1–4): financial loss, regulatory exposure, operational disruption
- **Data Sensitivity** (1–4): subscriber PII, operational secrets, credentials
- **Recovery Time** (hours to restore): a system offline for 72h matters more than one offline for 1h

**Risk score = Business Impact × Data Sensitivity × (1 + log10(recovery_hours))**

### 1. Fill the crown jewels register

```bash
nano 03-analysis/crown-jewels/crown-jewels.yml
```

```yaml
assets:

  - id: CJ-001
    name: "HLR — Home Location Register"
    system: "Comverse Subscriber Database"
    description: >
      8.2M subscriber records: MSISDN, IMSI, location area, SIM status,
      call forwarding, supplementary services config. Real-time subscriber state.
    business_impact: 4          # regulatory notification + licensing deal risk
    data_sensitivity: 4         # subscriber PII + IMSI (enables SS7 attacks on any subscriber)
    recovery_time_hours: 72     # full integrity check required before live service restored
    internet_exposed: false
    vendor_access:
      - name: comverse
        mfa: true
        schedule: quarterly
    attacker_value: >
      Real-time subscriber location. IMSI harvest enables SS7 SendRoutingInfo
      for any subscriber across all roaming networks. SIM swap capability.
      8.2M records — direct regulatory breach triggering 24h notification clock.

  - id: CJ-002
    name: "SS7/Sigtran Gateway"
    system: "Teligent SGW-4800"
    description: >
      Interconnect with 14 roaming partners via SS7 MAP protocol.
      Processes: location queries (SRI-SM, ATI), call setup, SMS routing,
      location update handling.
    business_impact: 4
    data_sensitivity: 4
    recovery_time_hours: 4
    internet_exposed: false
    vendor_access:
      - name: teligent
        mfa: true
        schedule: as-needed
    attacker_value: >
      AnyTimeInterrogation enables real-time location of any subscriber without
      their knowledge. SendRoutingInfo returns routing info for targeted MSISDN.
      Full SS7 protocol abuse capability once signalling access is obtained.

  - id: CJ-003
    name: "Ericsson ENM (Element Management System)"
    system: "Ericsson Network Manager"
    description: >
      Manages 4G/5G RAN equipment across all base stations. Functions:
      base station configuration, software updates, alarm management,
      performance data, network topology view.
    business_impact: 3
    data_sensitivity: 3
    recovery_time_hours: 24
    internet_exposed: true       # *** EXPOSED — port 443, no MFA ***
    vendor_access:
      - name: ericsson
        mfa: false               # *** MFA NOT ENFORCED FOR VENDOR ACCOUNTS ***
        schedule: ad-hoc
    attacker_value: >
      Full network topology — all base station IPs, management VLANs, locations.
      Configuration push to base stations — potential service disruption or
      persistent implant in RAN. DarkDoor specifically targets ENM.
      Gateway to internal management networks post-exploitation.

  - id: CJ-004
    name: "Roaming Partner API Gateway"
    system: "Internal REST API"
    description: >
      REST API serving 14 international roaming partners. Functions:
      subscriber authentication, location queries, billing records.
      3 partners communicate via unencrypted HTTP with static API keys.
    business_impact: 3
    data_sensitivity: 4
    recovery_time_hours: 8
    internet_exposed: true
    vendor_access: []
    note: "Static API keys — no rotation schedule documented. 3 partners over HTTP."
    attacker_value: >
      Stolen API key enables subscriber queries from any network.
      Real-time location data for any subscriber traveling internationally.
      Keys reusable until manually rotated — no automatic expiry.

  - id: CJ-005
    name: "Core Network Management VPN"
    system: "Cisco AnyConnect"
    description: >
      Primary remote access for NOC engineers and 6 vendors.
      Provides access to all core network systems once authenticated.
    business_impact: 4
    data_sensitivity: 3
    recovery_time_hours: 2
    internet_exposed: true
    vendor_access:
      - name: comverse
        mfa: true
      - name: ericsson
        mfa: true
      - name: teligent
        mfa: true
      - name: vendor-4
        mfa: false               # *** NO MFA ***
      - name: vendor-5
        mfa: false               # *** NO MFA ***
      - name: vendor-6
        mfa: false               # *** NO MFA ***
    attacker_value: >
      Pivot to any core network system. Three vendor accounts have no MFA —
      compromise of vendor workstation gives direct VPN access.
      All HLR, SS7, and ENM management traffic traverses this VPN.
```

### 2. Build the exposure matrix

```bash
nano 03-analysis/crown-jewels/exposure-matrix.md
```

```markdown
## Exposure Matrix

| Asset | Exposed | Vendor Access | MFA Enforced | Actor TTP Alignment | Risk Score |
|---|---|---|---|---|---|
| ENM (CJ-003) | YES — port 443 | Ericsson (no MFA) | NO | DarkDoor targets ENM explicitly | CRITICAL |
| Roaming API (CJ-004) | YES | None | N/A (static keys) | Actor collects roaming creds | HIGH |
| Core VPN (CJ-005) | YES | 3 vendors no MFA | PARTIAL | Supply chain pivot | HIGH |
| HLR (CJ-001) | No | Comverse (MFA) | YES | Reachable post-pivot from VPN | HIGH |
| SS7 GW (CJ-002) | No | Teligent (MFA) | YES | Reachable post-pivot | MEDIUM |

Critical path: ENM (internet) → lateral movement → Core VPN → HLR/SS7
Alternative path: Vendor VPN (no MFA) → Core VPN → HLR/SS7
```

### 3. Commit crown jewels analysis

```bash
git add 03-analysis/crown-jewels/
git commit -m "ASSESS-2024-002: crown jewels — 5 assets scored; ENM + Roaming API + 3 vendor VPN accounts are critical exposure; HLR and SS7 reachable post-pivot"
```

---

## Step P3: Threat Actor Intelligence — MuddyWater Working Profile

Build a working profile — not a wiki entry. Every TTP must map to three things: the data source CelltronX has (or does not have), a detection approach, and whether a rule exists. If it does not exist, it becomes a backlog item.

### 1. Export the full TTP profile from OpenCTI

```bash
# Download the full STIX bundle for MuddyWater
curl -s "{{OPENCTI_URL}}/api/v1/stix/bundle?id=MUDDYWATER_ID" \
  -H "Authorization: Bearer {{OPENCTI_TOKEN}}" \
  -o 03-analysis/actor/muddywater-stix-bundle.json

# Extract techniques with names and descriptions
jq -r '.objects[] | select(.type == "attack-pattern") |
  [.external_references[0].external_id,
   .name,
   (.description // "" | .[0:120])] | @tsv' \
  03-analysis/actor/muddywater-stix-bundle.json \
  > 03-analysis/actor/muddywater-ttp-list.tsv

cat 03-analysis/actor/muddywater-ttp-list.tsv
```

### 2. Build the actor working profile

```bash
nano 03-analysis/actor/muddywater-profile.md
```

```markdown
## MuddyWater — Working Profile for CelltronX Assessment

### Identity
- Primary name: MuddyWater
- Aliases: TEMP.Zagros, Seedworm, Mango Sandstorm, Storm-0842, TA450
- Attribution: Iranian Ministry of Intelligence and Security (MOIS)
- Sophistication: Intermediate (prefers living-off-the-land and legitimate tools)
- Motivation: Intelligence collection — subscriber data, government network access
- Active since: 2017; continuous operations through 2024

### Targeting Criteria — Telecom Operations (2024)
- Sector: Telecommunications, Government, Defense
- Region: Israel (primary 2024 focus), Saudi Arabia, Turkey, Jordan
- Organization size: No preference — both large MNOs and smaller regional operators
- Technology preference: Organizations running Ericsson ENM, exposed management portals
- Entry preference: Internet-exposed management portals, vendor supply chain

### Signature Behaviors (confirmed in ≥3 independent reports)

**1. SimpleHelp RMM as persistence mechanism (T1219)**
The actor uses SimpleHelp — a legitimate remote support tool — to establish
persistent access. The binary is signed and trusted by AV/EDR. The only
detection indicator is outbound connection to a non-approved SimpleHelp server.
CelltronX risk: CRITICAL — SimpleHelp is already installed on 340 workstations.

**2. LDAP password spraying against internet-exposed portals (T1110.003)**
Actor uses slow spraying (1 attempt per account per 8–12 minutes) to avoid
lockout policies. Targets: ENM LDAP backend, AnyConnect VPN, OWA.
CelltronX risk: HIGH — ENM LDAP exposed, no brute-force threshold enforced.

**3. Ligolo-ng protocol tunneling post-compromise (T1572)**
After initial foothold, actor deploys Ligolo-ng — an open-source reverse
TLS tunnel tool — to route all C2 traffic through an encrypted tunnel
appearing as outbound HTTPS to a legitimate-looking domain.
CelltronX risk: MEDIUM — no JA3/JARM fingerprinting deployed at perimeter.

**4. Web shell deployment on management portals (T1505.003)**
Post-authentication, actor uploads web shells to ENM or similar portals via
file upload functions. DarkDoor backdoor delivered this way in confirmed cases.
CelltronX risk: CRITICAL — ENM file upload is accessible after LDAP auth.

**5. Living-off-the-land in core network (T1059.001, WMI)**
Actor uses PowerShell and WMI to traverse systems after initial foothold.
Avoids custom malware on core infrastructure.
CelltronX risk: HIGH — WMI Operational log not collected anywhere.

### Infrastructure Patterns
- C2 domains: typosquatting vendor names (ericss0n-support.com, comverse-remote.net)
- SimpleHelp servers: low-cost hosting ASNs (Frantech Solutions, Hostinger, G-Core)
- Ligolo-ng relays: VPS on ports 11601, 8443, or 9001
- Phishing infrastructure: registered 3–10 days before campaign launch
```

### 3. Check the August 1 incident against actor profile

```bash
nano 01-triggers/aug-1-incident-assessment.md
```

```markdown
## Assessment: August 1, 2024 — Suspicious SimpleHelp Install

Event: 3 CelltronX employees received email "IT Support — new SimpleHelp
client required". 2 clicked. 1 installed the binary. IT removed manually.

Comparison against MuddyWater TA450 lure pattern (Proofpoint, July 2024):
  Subject line match: "IT Support — Required Software Update" vs "IT Support — new
    SimpleHelp client required" — HIGH SIMILARITY
  Technique: SimpleHelp lure — EXACT MATCH (T1219)
  Timing: Aug 1 — 10 days before CERT-IL advisory issued on Aug 11
    (consistent with actor operating before org becomes aware)

Assessment: Aug-1 incident is LIKELY a failed initial access attempt by
the same actor or a related cluster. Confidence: MEDIUM.
  - MEDIUM (not HIGH) because: binary was removed, no network connection
    to actor server confirmed in logs, and the domain in the email was
    not found in MISP IOC list.

Recommended action: Retrieve the original email headers + attachment
hash and submit to CERT-IL for cross-reference against IL-2024-TAL-0847 IOCs.
```

### 4. Commit actor intelligence

```bash
git add 03-analysis/actor/ 01-triggers/
git commit -m "ASSESS-2024-002: actor intelligence — MuddyWater TTP profile; 14 techniques; Aug-1 incident assessed LIKELY failed access attempt (MEDIUM); PIR-001 confirmed"
```

---

## Step P4: Attack Scenario Modeling — Five Paths In

Each scenario answers the same question: *if this actor used this path today, would CelltronX's current controls detect it, delay it, or stop it?*

The answer for four out of five is: **No.**

### Scenario format

Each scenario has:
- **Trigger**: the precondition that makes this path available
- **Attack path**: step-by-step kill chain with ATT&CK technique at each step
- **Crown jewels at risk**: which assets are exposed if the path succeeds
- **Detection verdict**: what would fire under current controls
- **Verdict**: WOULD CATCH / WOULD NOT CATCH / PARTIAL

---

### TRG-001 — Phishing → SimpleHelp RMM → HLR Access

**Probability: HIGH**
SimpleHelp is installed. Actor lures match IT helpdesk patterns. August 1 precedent shows employees click.

```
Kill chain:

[Phishing email — "IT Support: new SimpleHelp client required"]
  ↓  T1566.001  Spearphishing Attachment
  ↓  Employee clicks, downloads, installs SimpleHelp client
     pointing to actor's server (not the approved internal server)

[Actor has persistent RMM session to employee workstation]
  ↓  T1219  Remote Access Software
  ↓  T1133  External Remote Services

[PowerShell recon from workstation]
  ↓  T1059.001  Command and Scripting Interpreter: PowerShell
  ↓  T1057  Process Discovery
  ↓  T1082  System Information Discovery
     — identify domain, connected systems, VPN status

[LDAP password spray against AD]
  ↓  T1110.003  Password Spraying
  ↓  Actor uses 1 attempt/account/10 min — below lockout threshold
     — targeting service accounts, vendor accounts, admin accounts

[Lateral movement to server with HLR management client installed]
  ↓  T1021.002  SMB/Windows Admin Shares
  ↓  Access HLR Comverse management interface with discovered credentials
     — no additional MFA on HLR management from internal network

[Bulk subscriber data export via Comverse API]
  ↓  T1213  Data from Information Repositories
  ↓  8.2M records — MSISDN, IMSI, location area

[Exfiltration via Ligolo-ng tunnel]
  ↓  T1572  Protocol Tunneling
  ↓  T1041  Exfiltration Over C2 Channel
```

**Crown jewels at risk:** CJ-001 (HLR — 8.2M records), CJ-005 (Core VPN post-spray)

**Detection analysis:**

| Step | ATT&CK | Data in SIEM? | Alert rule? | Verdict |
|---|---|---|---|---|
| Phishing delivery | T1566.001 | No (email gateway not in SIEM) | No | MISS |
| SimpleHelp to unknown server | T1219 | Partial (firewall flows) | No rule on SimpleHelp | MISS |
| PowerShell recon | T1059.001 | Yes (Sysmon EID 1 on workstation) | No alert for recon commands | MISS |
| Password spray | T1110.003 | Yes (AD EID 4625 in SIEM) | No correlation rule | MISS |
| SMB lateral movement | T1021.002 | Partial (AD logon events) | No rule for off-hours service accounts | MISS |
| HLR API export | T1213 | No (HLR logs not in SIEM) | No | MISS |
| Ligolo-ng exfil | T1572 | Partial (firewall flows) | No JA3/port anomaly rule | MISS |

**Verdict: WOULD NOT CATCH. 0/7 steps detected.**

---

### TRG-002 — ENM Exploitation → RAN Configuration Access

**Probability: HIGH**
ENM is internet-exposed on port 443. No MFA. DarkDoor specifically targets ENM. Actor has published tools for this exact path.

```
Kill chain:

[Shodan query identifies CelltronX ENM on 185.x.x.x:443]
  ↓  T1590.005  Gather Victim Network Information: IP Addresses
  ↓  T1592.002  Gather Victim Host Information: Software
     — ENM version fingerprinted from login page headers

[Credential spray against ENM LDAP login]
  ↓  T1110.003  Password Spraying
  ↓  Targets: ericsson-support, enm-admin, vendor accounts from LinkedIn recon
     — 1 attempt per account per 8 minutes — no lockout policy on ENM

[Authentication as vendor account]
  ↓  T1078.003  Valid Accounts: Local Accounts
  ↓  No MFA prompt — direct access to ENM dashboard

[DarkDoor web shell uploaded via ENM file upload function]
  ↓  T1505.003  Server Software Component: Web Shell
  ↓  Persistent server-side access — survives ENM restarts

[Network topology enumeration]
  ↓  T1016  System Network Configuration Discovery
  ↓  T1018  Remote System Discovery
  ↓  All base station IPs, management VLAN addresses, NOC network map

[Pivot to internal management network via ENM connectivity]
  ↓  T1021  Remote Services
  ↓  ENM has direct access to base station management interfaces (OSS network)
```

**Crown jewels at risk:** CJ-003 (ENM — full topology), CJ-001/CJ-002 (reachable via OSS network)

**Detection analysis:**

| Step | ATT&CK | Data in SIEM? | Alert rule? | Verdict |
|---|---|---|---|---|
| Shodan recon | T1590.005 | No (external, passive) | N/A | UNDETECTABLE |
| ENM credential spray | T1110.003 | **NO — ENM audit log not in SIEM** | No | MISS |
| Vendor auth outside hours | T1078.003 | **NO — ENM audit log not in SIEM** | No | MISS |
| Web shell upload | T1505.003 | **NO — no FIM on ENM** | No | MISS |
| Topology enumeration | T1016 | **NO — ENM activity not in SIEM** | No | MISS |
| Internal pivot from ENM | T1021 | Partial (internal firewall) | No east-west rule | MISS |

**Verdict: WOULD NOT CATCH. ENM is a complete blind spot. 0/5 steps detected.**
**Note: This verdict changes immediately once ENM audit logs are forwarded to SIEM (4 hours of work).**

---

### TRG-003 — Supply Chain: Vendor VPN → Core Network

**Probability: MEDIUM**
Three vendor accounts have no MFA on AnyConnect VPN. A compromised vendor laptop is sufficient for access.

```
Kill chain:

[Compromise a vendor engineer's workstation (spear-phishing or watering hole)]
  ↓  T1566  Phishing (against vendor, outside CelltronX's detection perimeter)
  ↓  Actor targets vendor-4, vendor-5, or vendor-6 — all have VPN access

[Extract CelltronX VPN credentials or certificate from vendor laptop]
  ↓  T1552.004  Unsecured Credentials: Private Keys
  ↓  T1555     Credentials from Password Stores
  ↓  AnyConnect certificate + cached credential sufficient for authentication

[Actor connects to CelltronX Core VPN as vendor account]
  ↓  T1133  External Remote Services
  ↓  T1078  Valid Accounts
  ↓  No MFA — authentication succeeds from any IP

[Access to all systems vendor account can reach]
  ↓  Vendor-4 has access to HLR management — reaches CJ-001
  ↓  Vendor-5 has access to SS7 gateway config — reaches CJ-002
  ↓  Both reach OSS network — lateral movement available
```

**Crown jewels at risk:** CJ-001 (HLR), CJ-002 (SS7), CJ-005 (Core VPN itself)

**Detection analysis:**

| Step | ATT&CK | Data in SIEM? | Alert rule? | Verdict |
|---|---|---|---|---|
| Vendor workstation compromise | T1566 | No (external) | N/A | UNDETECTABLE |
| Credential extraction | T1552.004 | No (external) | N/A | UNDETECTABLE |
| VPN auth from anomalous ASN | T1133 | YES (AnyConnect logs in SIEM) | **No rule on vendor ASN anomaly** | MISS |
| VPN auth off-hours | T1078 | YES (AnyConnect logs in SIEM) | **No off-hours vendor rule** | MISS |
| HLR/SS7 access via vendor | T1078 | No (HLR/SS7 logs not in SIEM) | No | MISS |

**Verdict: WOULD NOT CATCH. Data exists for the VPN step but no rule deployed. 0/3 detectable steps have rules.**

---

### TRG-004 — Roaming API Key Theft → Subscriber Tracking

**Probability: MEDIUM**
Static API keys from 14 roaming partners. Three use HTTP. A passive network position at a roaming partner gives API key access. No rotation schedule.

```
Kill chain:

[Compromise a roaming partner network (or passive interception on HTTP partner)]
  ↓  (Out of scope — external to CelltronX)
  ↓  API key extracted from roaming partner's configuration

[Use stolen key to query CelltronX Roaming API]
  ↓  T1078  Valid Accounts (valid API key)
  ↓  Queries appear legitimate — same format as roaming partner production traffic

[SendRoutingInfo / AnyTimeInterrogation for target subscriber]
  ↓  T1592  Gather Victim Host Information
  ↓  Returns: current serving network, location area, routing number
  ↓  Enables: real-time location tracking of any CelltronX subscriber
     without any alert or notification
```

**Crown jewels at risk:** Subscriber location data for all 8.2M subscribers.

**Detection analysis:**

| Step | ATT&CK | Data in SIEM? | Alert rule? | Verdict |
|---|---|---|---|---|
| API key theft (external) | T1552 | No (external) | N/A | UNDETECTABLE |
| API query from new IP | T1078 | **NO — Roaming API logs not in SIEM** | No | MISS |
| Query volume anomaly | T1592 | **NO — no baseline or DLP on API** | No | MISS |

**Verdict: WOULD NOT CATCH. This is an architectural gap — valid credentials against a legitimate interface produce no anomaly signal.**
**Mitigation is architectural: mutual TLS between partners, rate limiting, anomaly detection on API key usage volume.**

---

### TRG-005 — Passive Reconnaissance (Pre-Attack Positioning)

**Probability: HIGH (assessed as already ongoing per CERT-IL advisory)**

```
Reconnaissance path:

[LinkedIn scraping — identify ENM admins, NOC engineers, Ericsson contacts]
  ↓  T1591.004  Gather Victim Org Information: Identify Roles

[Shodan — internet-exposed assets: ENM portal, VPN, API gateway]
  ↓  T1590.005  Gather Victim Network Information: IP Addresses

[Certificate Transparency — enumerate subdomains, vendor portals]
  ↓  T1596.003  Search Open Technical Databases

[GitHub — search for CelltronX configs, credentials, API keys in public repos]
  ↓  T1593.003  Search Code Repositories

[Passive DNS — map infrastructure changes, identify new services]
  ↓  T1596.001  Search Open Technical Databases: DNS/Passive DNS
```

**Detection verdict: ALL STEPS UNDETECTABLE.** Reconnaissance is external and passive.

**What CelltronX can do:**
- Enable GitHub secret scanning (free, immediate)
- Subscribe to Shodan Alert on CelltronX IP ranges (free)
- Monitor Certificate Transparency for new certs on CelltronX domains

**Verdict: CANNOT CATCH with current capability — but some signals are achievable with zero budget.**

---

### Summary table

```bash
nano 03-analysis/scenarios/scenario-summary.md
```

```markdown
## Scenario Summary

| # | Scenario | Probability | Crown Jewels | Steps Detected | Verdict |
|---|---|---|---|---|---|
| TRG-001 | Phishing → SimpleHelp → HLR | HIGH | HLR (8.2M) | 0/7 | WOULD NOT CATCH |
| TRG-002 | ENM Exploitation → RAN | HIGH | ENM, HLR, SS7 | 0/5 | WOULD NOT CATCH |
| TRG-003 | Vendor VPN → Core | MEDIUM | HLR, SS7 | 0/3 detectable | WOULD NOT CATCH |
| TRG-004 | Roaming API Abuse | MEDIUM | 8.2M subscriber locations | 0/3 | ARCHITECTURAL GAP |
| TRG-005 | Passive Reconnaissance | HIGH (ongoing) | N/A | 0/5 | UNDETECTABLE |
```

### Commit scenarios

```bash
git add 03-analysis/scenarios/
git commit -m "ASSESS-2024-002: 5 attack scenarios modeled (TRG-001 to TRG-005); all 5 would not be caught; PIR-002 answered — ENM + vendor VPN are critical failure points"
```

---

## Step P5: Detection Gap Analysis — What Would Actually Fire

Map every technique from the five scenarios against the data source inventory. The output is not a list of rules to write — it is a prioritised gap register that tells an engineering team exactly what work is required and in what order.

### 1. Build the data source scoring file

```bash
nano 03-analysis/gap-map/data-sources.yml
```

```yaml
# CelltronX Data Source Inventory — ASSESS-2024-002
# Score: 3=full, 2=partial, 1=present/not useful, 0=absent

data_sources:

  windows_security_events:
    score: 2
    status: partial
    products: [elastic-siem]
    note: "DCs and workstations covered. Server coverage 60%. No filtering on high-value servers."

  process_creation:
    score: 2
    status: partial
    products: [crowdstrike, sysmon]
    note: "Workstations: full. Servers: 40%. No Sysmon on servers near HLR/SS7."

  network_flows_perimeter:
    score: 2
    status: partial
    products: [elastic-siem]
    note: "Ingress/egress covered. No east-west visibility inside core network."

  authentication_vpn:
    score: 3
    status: present
    products: [elastic-siem]
    note: "Cisco AnyConnect authentication logs fully ingested. No anomaly rules deployed."

  authentication_ad:
    score: 3
    status: present
    products: [elastic-siem]
    note: "EID 4624/4625/4648 fully ingested. No password spray rule deployed."

  enm_audit_log:
    score: 0
    status: absent
    products: []
    note: "GAP — ENM writes JSON audit to /var/log/enm/audit.log. Not forwarded to SIEM."
    remediation: "Logstash filebeat input on ENM host. Estimated effort: 4 hours."

  wmi_operational:
    score: 0
    status: absent
    products: []
    note: "GAP — Microsoft-Windows-WMI-Activity/Operational log not collected anywhere."
    remediation: "Add WMI log to Winlogbeat config on all servers. Estimated effort: 2 hours."

  simplehelp_connections:
    score: 0
    status: absent
    products: []
    note: "GAP — SimpleHelp connection log not forwarded to SIEM."
    remediation: "Forward SimpleHelp server log to Logstash. Also add to CrowdStrike exclusion review."

  roaming_api_log:
    score: 0
    status: absent
    products: []
    note: "GAP — API gateway access log written locally, not shipped to SIEM."
    remediation: "Add Filebeat on API gateway host. Estimated effort: 3 hours."

  ss7_signalling:
    score: 0
    status: absent
    products: []
    note: "ARCHITECTURAL GAP — No MAP/TCAP inspection capability. Requires specialist hardware."
    remediation: "SS7 firewall with MAP inspection (e.g. P1 Security GSRK). Strategic investment."

  vendor_vpn_session_detail:
    score: 1
    status: present_not_useful
    products: [elastic-siem]
    note: "Authentication event logged. No session content, no ASN baseline, no time-of-day rule."
```

### 2. Run DeTT&CT against the data source inventory

```bash
# Install DeTT&CT if not already installed
pip install dettect

# Generate data source overview
python3 dettect.py ds -fd 03-analysis/gap-map/data-sources.yml -l \
  -o 03-analysis/gap-map/dettect-data-source-report.html
```

Open the HTML report in VS Code Live Preview. The heatmap shows:

- **Green (score 2–3):** Windows Security events, process creation on workstations, VPN auth, AD auth
- **Yellow (score 1):** Vendor VPN session detail (present but not actionable)
- **Red (score 0):** ENM audit, WMI, SimpleHelp connections, Roaming API, SS7

### 3. Build the gap register

```bash
nano 03-analysis/gap-map/gap-register.md
```

```markdown
## Detection Gap Register — ASSESS-2024-002

### GAP-001: ENM Audit Log Not in SIEM
Type: Data source missing
Impact: TRG-002 (ENM exploitation) is completely invisible — 0/5 steps detected
Remediation: Logstash filebeat input on ENM host → parse JSON audit log → index to Elastic
Effort: 4 hours (single engineer)
Priority: CRITICAL — highest-probability + highest-impact scenario

### GAP-002: WMI Operational Log Not Collected
Type: Data source missing
Impact: Actor's primary execution method (T1047) is invisible on all systems
Remediation: Add WMI log path to Winlogbeat config across all servers; restart service
Effort: 2 hours (automated via Ansible)
Priority: HIGH — covers TRG-001 and TRG-002 lateral movement

### GAP-003: SimpleHelp Outbound Connections Not Monitored
Type: Rule missing (firewall data exists)
Impact: TRG-001 first stage (SimpleHelp to actor server) not detected
Remediation: Deploy DET-001 (Sigma rule — see Step P6)
Effort: 30 minutes (Sigma rule deployment)
Priority: CRITICAL — SimpleHelp already installed, Aug-1 incident precedent

### GAP-004: LDAP/AD Password Spray — No Correlation Rule
Type: Rule missing (data exists: EID 4625 in SIEM)
Impact: TRG-001 and TRG-002 spray phase undetected despite data being available
Remediation: Deploy DET-003 (Sigma rule)
Effort: 30 minutes
Priority: HIGH — data is already in SIEM, this is pure rule gap

### GAP-005: Vendor VPN — No ASN or Time-of-Day Baseline
Type: Rule missing (data exists: AnyConnect logs in SIEM)
Impact: TRG-003 (vendor compromise → VPN) is undetected despite data available
Remediation: Deploy DET-004 (Sigma rule) + 1-week baseline of vendor ASNs
Effort: 1 week (baseline) + 30 minutes (rule deployment)
Priority: HIGH

### GAP-006: ENM — No File Integrity Monitoring
Type: Coverage incomplete
Impact: Web shell deployment (DarkDoor) on ENM would not be detected
Remediation: Enable ENM built-in FIM feature; alert on modification of /var/www paths
Effort: 2 hours (ENM configuration)
Priority: HIGH — direct mitigation for TRG-002 web shell step

### GAP-007: Roaming API — No Log Ingestion
Type: Data source missing
Impact: TRG-004 (API key abuse) completely invisible
Remediation: Filebeat on API gateway → Logstash → rate-limiting rule
Effort: 3 hours (ingestion) + baseline required
Priority: MEDIUM — TRG-004 is medium probability

### GAP-008: SS7 Protocol — No MAP/TCAP Inspection
Type: Architectural gap
Impact: TRG-004 (SS7 abuse) undetectable at signalling level
Remediation: SS7 firewall with MAP protocol inspection (strategic investment)
Effort: 3–6 months (procurement + deployment)
Priority: LOW (for this sprint — roadmap item)

### Summary

| Gap type | Count | Work required |
|---|---|---|
| Data source missing | 4 (GAP-001, 002, 007, 008) | Infrastructure changes |
| Rule missing | 3 (GAP-003, 004, 005) | Detection sprint — data already in SIEM |
| Coverage incomplete | 1 (GAP-006) | Configuration change |
| Architectural gap | 1 (GAP-008) | Strategic investment |
```

### 4. Commit gap analysis

```bash
git add 03-analysis/gap-map/
git commit -m "ASSESS-2024-002: gap analysis complete — 4 data-source gaps, 3 rule-missing, 1 coverage-incomplete, 1 arch-gap; ENM log forwarding is single highest-leverage fix"
```

---

## Step P6: Detection Backlog — Five Rules the SOC Can Deploy This Week

Rules are prioritised by `Likelihood × Impact`. All five can be deployed from data already in SIEM or achievable within this sprint.

Write each rule to its own file:

```bash
mkdir -p 04-detections/sigma
```

### DET-001 — SimpleHelp Outbound to Non-Approved Server

**Priority: Critical | Data required: Network connection logs (already in SIEM via CrowdStrike)**
**Prerequisite: Document the approved SimpleHelp server address (simplehelp.celltronx.co.il)**

```bash
nano 04-detections/sigma/DET-001-simplehelp-unknown-server.yml
```

```yaml
title: SimpleHelp RMM Outbound Connection to Unapproved Server
id: 7a3f9b2c-1d4e-5f6a-8b9c-0d1e2f3a4b5c
status: experimental
description: |
  Detects SimpleHelp RMM client connecting to a server not in the approved
  server allowlist. MuddyWater uses legitimate SimpleHelp binaries pointed
  at actor-controlled servers — the binary is trusted, only the destination
  changes. Deploy this rule first: it is the earliest and most reliable
  detection point for TRG-001.
  
  Requires: approved SimpleHelp server list (SimpleHelp admin → Server Settings
  → Server Address). Add all approved IPs/hostnames to filter_approved.
references:
  - https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-241a
  - https://www.proofpoint.com/us/blog/threat-insight/security-brief-ta450-uses-linked-rmm
author: anpa1200 — ASSESS-2024-002
date: 2024-08-15
tags:
  - attack.persistence
  - attack.t1219
  - attack.t1133
  - detection.emerging_threats
logsource:
  category: network_connection
  product: windows
detection:
  selection:
    Image|endswith: '\SimpleHelp.exe'
    Initiated: 'true'
  filter_internal:
    DestinationIp|cidr:
      - '10.0.0.0/8'
      - '172.16.0.0/12'
      - '192.168.0.0/16'
  filter_approved_server:
    DestinationHostname|contains: 'simplehelp.celltronx.co.il'
    # Add approved IPs here: DestinationIp: ['10.x.x.x']
  condition: selection and not (filter_internal or filter_approved_server)
falsepositives:
  - New approved SimpleHelp server not yet in allowlist (update filter_approved_server)
  - Vendor using their own SimpleHelp server (add to allowlist with ticket reference)
level: high
```

**Convert to Elastic:**
```bash
sigma convert -t elastic-lucene 04-detections/sigma/DET-001-simplehelp-unknown-server.yml
```

**Threshold:** Any hit = P1 alert. SimpleHelp connecting to an unknown server has no legitimate explanation.

---

### DET-002 — ENM Authentication Outside Business Hours

**Priority: Critical | Data required: ENM audit log (requires GAP-001 remediation first)**
**Prerequisite: Forward ENM audit log to SIEM (see GAP-001, 4-hour effort)**

```bash
nano 04-detections/sigma/DET-002-enm-login-after-hours.yml
```

```yaml
title: Ericsson ENM Authentication Outside Business Hours
id: 2b5d8e1f-4a7c-9b0d-3e6f-1c4a7b0d3e6f
status: experimental
description: |
  Detects successful or failed authentication to Ericsson ENM outside defined
  business hours (07:00–19:00 IST, Sunday–Thursday). MuddyWater ENM operations
  have been observed during night hours to avoid NOC staff.
  
  This rule cannot fire until GAP-001 is remediated (ENM audit log forwarding).
  Estimated effort for GAP-001: 4 hours.
references:
  - https://www.deepinstinct.com/blog/darkdoor-backdoor-ericsson-ems
author: anpa1200 — ASSESS-2024-002
date: 2024-08-15
tags:
  - attack.initial_access
  - attack.t1078.003
  - attack.t1133
logsource:
  product: ericsson_enm
  category: authentication
detection:
  selection:
    event.action:
      - 'LOGIN_SUCCESS'
      - 'LOGIN_FAILURE'
  filter_business_hours:
    event.hour|gte: 7
    event.hour|lte: 19
    event.day_of_week|lt: 6      # 1=Sun … 6=Fri; 7=Sat excluded
  condition: selection and not filter_business_hours
falsepositives:
  - Emergency NOC work — should generate change ticket referencing this alert
  - Ericsson planned maintenance window — pre-approve via change management
level: high
```

**Note for engineering team:** ENM audit log format is JSON, written to `/var/log/enm/audit.log`. Logstash configuration:
```
input { file { path => "/var/log/enm/audit.log" codec => json } }
filter {
  date { match => ["timestamp", "ISO8601"] target => "@timestamp" }
  ruby { code => "event.set('event.hour', event.get('@timestamp').time.hour)" }
  ruby { code => "event.set('event.day_of_week', event.get('@timestamp').time.wday)" }
}
output { elasticsearch { hosts => ["localhost:9200"] index => "enm-audit-%{+YYYY.MM}" } }
```

---

### DET-003 — LDAP Password Spray — Multiple Accounts Single Source

**Priority: High | Data required: AD EID 4625 (already in SIEM)**
**Prerequisite: None — rule can be deployed immediately**

```bash
nano 04-detections/sigma/DET-003-ldap-password-spray.yml
```

```yaml
title: LDAP Password Spray — Multiple Unique Accounts from Single Source
id: 5c8f1a4d-7e0b-3c6f-9a2d-5e8b1c4d7e0b
status: experimental
description: |
  Detects password spraying against LDAP-backed services (ENM, VPN, OWA, AD).
  MuddyWater uses slow-spray: 1 attempt per account per 8–12 minutes to stay
  below lockout threshold. Detection signature: many unique accounts, few
  failures per account, from a single IP in a short window.
  
  Threshold tuned for spray pattern: >10 unique accounts in 30 minutes,
  <5 failures per account (to distinguish spray from targeted brute-force).
author: anpa1200 — ASSESS-2024-002
date: 2024-08-15
tags:
  - attack.credential_access
  - attack.t1110.003
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4625
    LogonType: 3
  filter_known_scanners:
    IpAddress:
      - '::1'
      - '127.0.0.1'
  condition: selection and not filter_known_scanners
  timeframe: 30m
  groupby:
    - IpAddress
  condition_aggregate: count() > 10 and dc(TargetUserName) > 10
falsepositives:
  - Misconfigured service account cycling through multiple accounts
  - Password manager synchronisation failure
  - Legitimate audit or compliance scan (document in CMDB)
level: medium
```

**Splunk equivalent (if your SIEM is Splunk):**
```spl
index=wineventlog EventCode=4625 LogonType=3 earliest=-30m
| stats dc(TargetUserName) as unique_accounts, count by IpAddress
| where unique_accounts > 10
| sort -unique_accounts
```

**Elastic equivalent (KQL):**
```
event.code:4625 AND winlog.event_data.LogonType:3
| date_histogram field=@timestamp interval=30m
| terms field=source.ip
| cardinality field=winlog.event_data.TargetUserName
| where cardinality > 10
```

---

### DET-004 — Vendor VPN Authentication from Anomalous ASN

**Priority: High | Data required: Cisco AnyConnect logs (already in SIEM)**
**Prerequisite: 1-week baseline of vendor source ASNs**

```bash
nano 04-detections/sigma/DET-004-vendor-vpn-asn-anomaly.yml
```

```yaml
title: Vendor VPN Authentication from Unexpected ASN or Country
id: 9d2e5b8f-1c4a-7d0e-3f6c-9a2e5b8f1c4a
status: experimental
description: |
  Detects CelltronX vendor VPN authentication from an ASN not associated
  with that vendor's baseline source geography. MuddyWater supply chain attacks
  begin with vendor workstation compromise; the actor authenticates as the vendor
  from Iranian or low-cost hosting ASNs rather than the vendor's corporate network.
  
  Step 1: Run 30-day baseline query to identify all vendor source ASNs.
  Step 2: Add approved ASNs to filter_known_vendor_asns.
  Step 3: Deploy rule.
  
  Baseline query: index=vpn | stats dc(src_ip) by user, src_asn | where user="vendor*"
author: anpa1200 — ASSESS-2024-002
date: 2024-08-15
tags:
  - attack.initial_access
  - attack.t1078.003
  - attack.t1133
logsource:
  product: cisco_asa
  category: vpn
detection:
  selection:
    event.action: 'GROUP_AUTH_SUCCEEDED'
    cisco.asa.group: 'CelltronX-Vendor-VPN'
  filter_known_vendor_asns:
    # Populate from baseline — example values:
    source.as.number:
      - '12849'    # Comverse Networks — Israel
      - '43766'    # Ericsson Israel
      - '197422'   # Teligent Networks — Poland
      # Add remaining approved ASNs after baseline
  filter_business_hours:
    # Optional: add time-of-day filter after business hours baseline
    event.hour|gte: 7
    event.hour|lte: 20
  condition: selection and not filter_known_vendor_asns
falsepositives:
  - Vendor engineer working from home on personal ISP (request VPN exception ticket)
  - Vendor using new corporate ISP (update filter_known_vendor_asns)
  - Vendor using mobile hotspot during travel
level: high
```

**Note:** Run the baseline first. Deploy the rule with an `observe` mode for 72 hours before setting to `alert`. Tune aggressively — every false positive removes a real detection point.

---

### DET-005 — Ligolo-ng Tunnel Indicator — Non-Standard TLS Port

**Priority: Medium | Data required: Firewall flows (already in SIEM)**
**Prerequisite: None — deploy immediately**

```bash
nano 04-detections/sigma/DET-005-ligolo-ng-tunnel.yml
```

```yaml
title: Potential Ligolo-ng Reverse Tunnel — TLS on Non-Standard Port
id: 3f6c9a2e-5b8f-1c4a-7d0e-3f6c9a2e5b8f
status: experimental
description: |
  Detects outbound TCP connections on ports commonly used by Ligolo-ng reverse
  tunnel tool. Ligolo-ng creates a TLS tunnel from victim to actor relay,
  appearing as HTTPS but on non-standard ports. Used by MuddyWater post-compromise
  for C2 traffic and internal network pivoting.
  
  Default Ligolo-ng ports: 11601 (documented), also seen on 8443, 9001, 4433.
  Tune by adding known-legitimate services using these ports to the allowlist.
references:
  - https://github.com/nicocha30/ligolo-ng
author: anpa1200 — ASSESS-2024-002
date: 2024-08-15
tags:
  - attack.command_and_control
  - attack.t1572
  - attack.t1090.001
logsource:
  category: network_connection
  product: windows
detection:
  selection:
    DestinationPort:
      - 11601
      - 11602
      - 9001
    Protocol: tcp
    Initiated: 'true'
  filter_internal:
    DestinationIp|cidr:
      - '10.0.0.0/8'
      - '172.16.0.0/12'
      - '192.168.0.0/16'
  filter_known_services:
    # Add any internal services running on these ports
    DestinationHostname|contains: 'celltronx.co.il'
  condition: selection and not (filter_internal or filter_known_services)
falsepositives:
  - Internal application using non-standard port (document in CMDB)
  - Developer tooling or testing
level: medium
```

**JARM fingerprinting alternative:** The JARM fingerprint for Ligolo-ng's TLS implementation is documented in public tooling. If your perimeter firewall supports TLS fingerprinting (Palo Alto, Fortinet), add the JARM rule for zero false positives.

### Commit the detection backlog

```bash
git add 04-detections/sigma/
git commit -m "ASSESS-2024-002: detection backlog — 5 Sigma rules DET-001 to DET-005; DET-001 and DET-003 deployable immediately; DET-002 requires GAP-001 (ENM log forwarding) first; DET-004 requires 1-week ASN baseline"
```

---

## Step P7: Deliverables — What Each Stakeholder Gets

### 1. Executive Brief — For the CISO

```bash
nano 05-deliverables/executive-brief.md
```

```markdown
# Executive Brief — CelltronX Telecom Proactive Assessment
# Classification: TLP:AMBER | Date: 2024-08-16 | Analyst: [Name]

## Bottom Line Up Front

MuddyWater is actively targeting Israeli mobile network operators for subscriber
intelligence collection. CelltronX matches their targeting criteria on every
dimension: sector, geography, and installed technology.

Three attack paths exist today that would not be detected under current controls.
The single most critical exposure is the Ericsson ENM portal — internet-accessible,
no MFA, and the specific target of a backdoor (DarkDoor) that this actor deploys.
We have no visibility into this system.

## The Three Immediate Actions (This Week — Zero Budget)

1. Enforce MFA on the ENM portal or take it offline from the internet.
   Eliminates the highest-probability, highest-impact attack path.
   Effort: 2 hours. Cost: zero.

2. Forward ENM audit log to the SIEM.
   Gives the SOC visibility into a critical system they currently cannot see.
   Effort: 4 hours. Cost: zero.

3. Enforce MFA on all three vendor VPN accounts currently without it.
   Closes the supply chain entry point.
   Effort: 1 day. Cost: zero.

## Detection Coverage

| Scenario | Current | After Sprint |
|---|---|---|
| Phishing → SimpleHelp → HLR | 0/7 detected | 3/7 detected |
| ENM exploitation → RAN access | 0/5 detected | 3/5 detected (after ENM log forwarding) |
| Vendor VPN compromise → Core | 0/3 detected | 2/3 detected |
| Roaming API key abuse | 0/3 detected | 0/3 (architectural gap) |

## Regulatory Exposure

TRG-001 (HLR access via SimpleHelp) would expose subscriber MSISDN, IMSI,
and location area for all 8.2 million subscribers. This triggers a 24-hour
notification obligation under Israeli Privacy Protection Law 2024 and GDPR
Article 33. Current detection capability: 0/7 steps detected.

## Investment Required

Two-week sprint:
- 5 Sigma rules (provided)
- 4 Logstash pipeline additions (GAP-001, GAP-002, GAP-007 + one additional)
- 1 vendor ASN baseline (1 week)
Estimated engineering effort: 40 hours total.
```

### 2. SOC Handoff — For the Security Operations Lead

```bash
nano 05-deliverables/soc-handoff.md
```

```markdown
# SOC Handoff — CelltronX Proactive Assessment
# Classification: TLP:AMBER | Date: 2024-08-16

## Immediate IOC Block List

Deploy these to the perimeter firewall immediately. No analysis required —
confirmed MuddyWater infrastructure from three independent sources:

C2 IPs (block outbound):
  [Contents of 03-analysis/actor/muddywater-c2-ips.txt]

Malicious domains (DNS sinkhole or block):
  [Contents of 03-analysis/actor/muddywater-domains.txt]

Ligolo-ng relay indicators:
  [Contents of 03-analysis/actor/muddywater-filenames.txt — binary names]

## Sigma Rules — Deployment Order

1. DET-001 — SimpleHelp to unknown server [deploy immediately, no prerequisites]
2. DET-003 — LDAP password spray [deploy immediately, no prerequisites]
3. DET-005 — Ligolo-ng tunnel [deploy immediately, no prerequisites]
4. DET-004 — Vendor VPN ASN anomaly [deploy after 1-week ASN baseline]
5. DET-002 — ENM login after hours [deploy after GAP-001: ENM log forwarding]

## Hunt Actions (Manual — This Week)

HUNT-001: SimpleHelp server inventory
  Query all SimpleHelp client connections from the last 90 days.
  Confirm every destination is simplehelp.celltronx.co.il.
  Any other destination = investigate immediately.
  
  KQL: process.name:"SimpleHelp.exe" AND network.direction:egress
       AND NOT destination.ip:10.0.0.0/8

HUNT-002: August 1 incident follow-up
  Retrieve binary hash from the laptop that installed the unverified
  SimpleHelp client on 2024-08-01. Submit hash to CERT-IL for IOC
  cross-reference against IL-2024-TAL-0847.
  Contact: [CERT-IL contact from advisory]

HUNT-003: ENM account audit
  Pull all ENM accounts → identify vendor accounts, inactive accounts,
  accounts with no recent login. Disable any account not actively in use.
  ENM admin path: Security → User Management → Export Account List

## Infrastructure Gaps (Requires Engineering Work)

GAP-001: ENM audit log not in SIEM [4 hours — highest priority]
GAP-002: WMI log not collected [2 hours]
GAP-007: Roaming API log not shipped [3 hours]
```

### 3. Commit all deliverables

```bash
git add 05-deliverables/
git commit -m "ASSESS-2024-002: deliverables complete — executive brief, SOC handoff, hunt plans; PIR-003 answered — 40h sprint achieves material coverage on 3 of 5 scenarios; status: closed"
```

Update `project.yml`:

```bash
sed -i 's/status: in-progress/status: closed/' project.yml
git add project.yml
git commit -m "ASSESS-2024-002: project closed — all 3 PIRs answered; deliverables delivered 2024-08-16"
```

---

## The Git History: What a Completed Assessment Looks Like

```bash
git log --oneline
```

```
a7f3c1d  ASSESS-2024-002: project closed — all 3 PIRs answered; deliverables delivered 2024-08-16
b8e2d4f  ASSESS-2024-002: deliverables complete — executive brief, SOC handoff, hunt plans; PIR-003 answered
c9f1e5a  ASSESS-2024-002: detection backlog — 5 Sigma rules DET-001 to DET-005; DET-001 and DET-003 deployable immediately
d0a2f6b  ASSESS-2024-002: gap analysis complete — 4 data-source gaps, 3 rule-missing, 1 coverage-incomplete, 1 arch-gap; ENM log forwarding is single highest-leverage fix
e1b3g7c  ASSESS-2024-002: 5 attack scenarios modeled (TRG-001 to TRG-005); all 5 would not be caught; PIR-002 answered
f2c4h8d  ASSESS-2024-002: actor intelligence — MuddyWater TTP profile; 14 techniques; Aug-1 incident assessed LIKELY failed access attempt (MEDIUM); PIR-001 confirmed
g3d5i9e  ASSESS-2024-002: crown jewels — 5 assets scored; ENM + Roaming API + 3 vendor VPN accounts are critical exposure
h4e6j0f  ASSESS-2024-002: trigger intelligence complete — PIR-001 answered YES HIGH CONFIDENCE; 3 independent sources; Aug-1 incident overlaps TA450 lure pattern
i5f7k1g  ASSESS-2024-002: intake complete — 5 critical findings: ENM no MFA, SimpleHelp installed, WMI gap, no ENM SIEM visibility, Aug-1 suspicious install event
j6g8l2h  ASSESS-2024-002: project.yml filled — 3 PIRs, CISO deadline Aug 16, TLP:AMBER scope
k7h9m3i  ASSESS-2024-002: scaffold initialized from proactive template — MuddyWater trigger
```

Eleven commits. Every analytical step is timestamped and auditable. The git log proves — to any reviewer, auditor, or regulator — what was known at each point and in what sequence the analysis was performed.

The assessment closed 4 business days after the CERT-IL advisory arrived. Three PIRs answered. Five Sigma rules delivered. Three immediate zero-cost mitigations recommended.

---

## Key Lessons

**1. The trigger is not the threat.** The CERT-IL advisory names MuddyWater. That is not enough to scope an assessment. The threat to CelltronX specifically is the intersection of MuddyWater's TTPs and CelltronX's actual environment — ENM exposed, SimpleHelp installed, August 1 precedent. Two organizations receiving the same advisory have different assessments because they have different environments.

**2. The intake determines the scenarios, not the actor.** If the intake had revealed ENM was behind a WAF with MFA enforced, TRG-002 would have been de-prioritised. If SimpleHelp had not been installed, TRG-001 probability would drop from HIGH to LOW. The actor profile gives you the technique set. The intake gives you the probability weights.

**3. A zero-detection verdict is a deliverable, not a failure.** Five scenarios modeled. Four would not be caught. That finding — precisely stated, with the specific data source gaps and rule gaps named — is the most valuable output of the assessment. It gives the engineering team a sprint plan, not a vague recommendation to "improve detection."

**4. Some gaps cannot be ruled on.** TRG-004 (roaming API abuse) and TRG-005 (passive reconnaissance) have no detection options under any rule-writing approach. Write that plainly in the executive brief. The CISO decides whether to fund the architectural mitigation — that is not the analyst's decision to make or to obscure.

**5. Three-source rule applies to proactive too.** The assessment could have been written from the CERT-IL advisory alone in two hours. It would have been wrong in two places: SimpleHelp probability would have been underweighted (no knowledge of installed base), and August 1 incident would have been missed (no intake). The intake and three-source intelligence check are not process overhead — they are where the assessment-specific signal comes from.

**6. The highest-value finding costs nothing to fix.** ENM exposed to the internet with no MFA is critical. Fixing it costs two hours and zero budget. The gap analysis makes this visible. The executive brief makes it actionable. The analyst's job is to make the right answer obvious — not to design the solution.

---

## Continue Learning

| Next step | Link |
|---|---|
| Run this assessment yourself | [Assignment A02 — CelltronX](/docs/training/02-proactive-celltronx) |
| Full proactive methodology reference | [CTI as a Code Methodology — Proactive Mode](/docs/cti-as-a-code-methodology) |
| Reactive counterpart — post-breach investigation | [LifeTech Pharma Case Study](/docs/lifetech-pharma-case-study) |
| Reactive technical walkthrough | [Reactive Walkthrough](/docs/reactive-walkthrough) |
| MuddyWater and Iranian-nexus sector context | [Israel Government Threat Actors CTI](https://1200km.com/israel-government-threat-actors-cti/) |
| CTI Analyst Field Manual — proactive tradecraft | [Field Manual](https://1200km.com/cti-analyst-field-manual/) |
| Full CTI Portfolio | [1200km.com/cti.html](https://1200km.com/cti.html) |
