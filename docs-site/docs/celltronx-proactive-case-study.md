---
id: celltronx-proactive-case-study
title: "Case Study: CelltronX Telecom — Proactive Threat Assessment"
sidebar_position: 4
description: "Complete proactive CTI walkthrough — MuddyWater targeting Israeli telecom, crown jewels analysis, attack scenario modeling, detection gap mapping, and five Sigma rules ready for deployment."
---

# Case Study: CTI as a Code in Practice — CelltronX Telecom Proactive Assessment

<figure>
<img src="/img/celltronx/00-cover.png" alt="CelltronX Telecom — Proactive Threat Assessment" />
</figure>

> *A threat arrived before the breach. The question is not whether MuddyWater targets Israeli telecom — they do. The question is whether CelltronX's controls would catch them if they walked in today.*

:::note All scenario data is fictional
CelltronX Telecom, its systems, employees, and all IOCs in this article are invented for training. MuddyWater TTPs are drawn from published threat intelligence — CISA advisories, Symantec, Deep Instinct, and Proofpoint public reporting. The methodology and tool workflows are real and reproducible.
:::

---

## What This Case Study Demonstrates

This article applies the full [Proactive CTI Methodology](/docs/cti-as-a-code-methodology#proactive-mode) to a single organization from trigger through client deliverables. The analyst never waits for an alert. The investigation begins with a CERT advisory and ends with a detection backlog the SOC can action the same week.

It is the worked answer to [Assignment A02 — Proactive: CelltronX Telecom](/docs/training/02-proactive-celltronx).

**Ecosystem links:**
- [Full methodology](/docs/cti-as-a-code-methodology) — proactive mode step-by-step
- [Reactive counterpart](/docs/lifetech-pharma-case-study) — what the same methodology looks like post-breach
- [Training assignment A02](/docs/training/02-proactive-celltronx) — the student brief for this scenario
- [Ecosystem overview](/docs/ecosystem) — how this fits the broader CTI portfolio

---

## The Scenario

**CelltronX Telecom Ltd.** is a mid-sized Israeli mobile network operator — 2,400 employees, 8.2 million subscribers, nationwide 4G/5G infrastructure. It is not a household name outside Israel, which is exactly why it is interesting to an intelligence collector.

The assessment is not triggered by an incident. It is triggered by a CERT advisory.

**CERT-IL TLP:AMBER — IL-2024-TAL-0847 (summarised):**
> *Iranian-nexus threat actor cluster assessed as MuddyWater (MOIS-linked) has been observed conducting targeted reconnaissance against Israeli mobile network operators and their technology vendors. Activity includes LinkedIn profiling of network engineers, spear-phishing with SimpleHelp RMM lures, and attempted exploitation of internet-exposed Element Management System (EMS) portals. Two Israeli MNOs have reported unauthorised access to roaming partner management interfaces in Q3 2024. CERT-IL assesses collection intent: subscriber location data and roaming interconnect credentials.*

The CISO forwards the advisory with three words: **"Are we exposed?"**

That question is the entire scope of this assessment.

---

## Step 00 — Initialize the Project

```bash
cp -r templates/proactive-case assessments/ASSESS-2024-002-celltronx
cd assessments/ASSESS-2024-002-celltronx
git init
git add .
git commit -m "ASSESS-2024-002: initialize CelltronX proactive assessment — MuddyWater trigger"
```

<figure>
<img src="/img/celltronx/01-project-structure.png" alt="Proactive assessment project folder structure" />
<figcaption>The proactive template creates the same git-tracked structure as reactive — intake, scope, actor intelligence, scenarios, detections, deliverables. Analysis begins only after the folder is committed.</figcaption>
</figure>

Fill `project.yml` immediately:

```yaml
id: ASSESS-2024-002
type: proactive
organization: CelltronX Telecom Ltd.
classification: TLP:AMBER
status: active
analyst: anpa1200
created: 2024-08-12
trigger:
  type: cert-advisory
  reference: IL-2024-TAL-0847
  date: 2024-08-11
  summary: "MuddyWater targeting Israeli MNOs — RMM abuse, EMS exploitation, roaming partner access"
priority_intelligence_requirements:
  - id: PIR-001
    text: "Does CelltronX match MuddyWater's current targeting criteria?"
    due: 2024-08-16
    status: open
  - id: PIR-002
    text: "Which crown jewel systems are reachable via documented MuddyWater attack paths, and which existing controls would fail?"
    due: 2024-08-16
    status: open
  - id: PIR-003
    text: "What is the minimum detection investment to achieve material coverage against this actor's known TTPs?"
    due: 2024-08-20
    status: open
scope:
  in_scope:
    - HLR / subscriber database (Comverse — 8.2M records)
    - SS7/Sigtran gateway (Teligent SGW-4800)
    - Element Management System portal (Ericsson ENM — internet-exposed)
    - Roaming partner API gateway
    - Core network management VPN
    - Vendor remote access portal
  out_of_scope:
    - Production SS7 live traffic interception (legal constraint)
    - Penetration testing / active exploitation
    - Subscriber PII — referenced by system name only
```

---

## Step 0 — Intake Call

**Run the intake before opening a single source.** The advisory gives you the actor. The intake gives you the organization.

[Use the proactive intake form](/intake-proactive) or copy the markdown template:

```bash
cp templates/proactive/intake-form.md assessments/ASSESS-2024-002-celltronx/00-scope/intake-2024-08-12.md
```

<figure>
<img src="/img/celltronx/02-intake-form.png" alt="Completed proactive intake form for CelltronX" />
<figcaption>The intake captures what the advisory cannot: existing control inventory, known vendor access points, recent security events, and regulatory constraints. The answers reshape the attack scenarios before a single TTP is mapped.</figcaption>
</figure>

**Critical findings from the intake call:**

| Finding | Detail | Impact on assessment |
|---|---|---|
| ENM portal exposed | Ericsson ENM accessible via internet on port 443 — no MFA | Direct exploitation path — Priority 1 scenario |
| SimpleHelp already installed | IT helpdesk uses SimpleHelp for remote support | Actor's preferred RMM already present — attribution evasion |
| Roaming partners | 14 roaming partners with active API keys, 3 via unencrypted XML | Lateral movement target — interconnect credentials |
| No WMI logging | WMI events not forwarded to SIEM | Gap: MuddyWater's primary execution method is invisible |
| Vendor VPN | 6 vendors with persistent VPN access, 2 with no MFA | Supply chain entry point — no anomaly detection on vendor accounts |

The intake also surfaces the **regulatory constraint**: CelltronX falls under Israeli Communications Law Amendment 2024, which requires subscriber data breach notification within 24 hours. This means the exfiltration scenario has a legal clock.

---

## Step P1 — Trigger Intelligence

Do not rely on the CERT advisory alone. Three independent sources before you accept the actor attribution.

### 1. OpenCTI — Pull the Actor Profile

Open VS Code. Create `03-analysis/actor/ioc-queries.http`:

```http
### OpenCTI — MuddyWater actor object
GET {{OPENCTI_URL}}/api/v1/stix/domain-objects?types=threat-actor&name=MuddyWater
Authorization: Bearer {{OPENCTI_TOKEN}}

###

### OpenCTI — All TTPs linked to MuddyWater
GET {{OPENCTI_URL}}/api/v1/stix/relationships?fromId={{MUDDYWATER_ID}}&type=uses&toTypes=attack-pattern
Authorization: Bearer {{OPENCTI_TOKEN}}

###

### OpenCTI — Infrastructure: domains and IPs attributed to MuddyWater (last 90 days)
GET {{OPENCTI_URL}}/api/v1/stix/observables?createdAfter=2024-05-01&markedBy=MuddyWater
Authorization: Bearer {{OPENCTI_TOKEN}}
```

Click **Send Request** on each block. Response pane shows:

```json
{
  "name": "MuddyWater",
  "aliases": ["TEMP.Zagros", "Seedworm", "Mango Sandstorm", "Storm-0842", "TA450"],
  "first_seen": "2017-01-01",
  "last_seen": "2024-08-09",
  "sophistication": "intermediate",
  "primary_motivation": "organizational-gain",
  "country": "IR",
  "sectors": ["telecommunications", "government", "defense", "education"],
  "regions": ["Israel", "Saudi Arabia", "Turkey", "Jordan", "UAE", "India"]
}
```

**CelltronX is telecommunications, in Israel. PIR-001 answer: Yes — CelltronX matches targeting criteria.**

### 2. MISP — Search for Recent IOCs

```http
### MISP — Events tagged MuddyWater, last 60 days
POST {{MISP_URL}}/events/restSearch
Authorization: {{MISP_KEY}}
Content-Type: application/json

{
  "tags": ["misp-galaxy:threat-actor=\"MuddyWater\""],
  "last": "60d",
  "type": ["domain", "ip-dst", "url", "filename"],
  "to_ids": 1,
  "limit": 50
}
```

<figure>
<img src="/img/celltronx/03-misp-search.png" alt="MISP search results for MuddyWater IOCs" />
<figcaption>MISP returns 23 actionable IOCs from the last 60 days: 8 SimpleHelp-related domains, 4 C2 IPs, 7 phishing lure filenames, and 4 Ligolo-ng tunnel relay IPs. Three of the 4 C2 IPs overlap with CERT-IL's advisory — attribution confirmed from two independent sources.</figcaption>
</figure>

Pull the IOC table into VS Code and check against CelltronX's DNS/proxy logs immediately:

```bash
# Extract IPs from MISP response into a hunt list
jq -r '.response[] | select(.Attribute.type == "ip-dst") | .Attribute.value' misp-response.json \
  > 03-analysis/actor/muddywater-c2-ips.txt

wc -l 03-analysis/actor/muddywater-c2-ips.txt
# 4

# Check against proxy logs (sample — replace with your SIEM query)
grep -f 03-analysis/actor/muddywater-c2-ips.txt /var/log/proxy/access.log | wc -l
# 0  — no hits in CelltronX proxy logs (good — not yet compromised)
```

### 3. Cross-Reference — Public Reporting

Three sources confirm the same campaign:

| Source | Finding | Link |
|---|---|---|
| CISA AA24-241A | MuddyWater using SimpleHelp 5.3.x exploitation + RMM for persistent access | Public |
| Proofpoint TA450 | Phishing lures masquerading as IT helpdesk onboarding emails | Public |
| Deep Instinct | DarkDoor backdoor deployed post-RMM access; targets Ericsson and Nokia EMS | Public |

**Critical finding from Deep Instinct report:** DarkDoor specifically targets Ericsson EMS (ENM). CelltronX runs Ericsson ENM exposed to the internet. This moves ENM from a theoretical exposure to a **confirmed actor target**.

Commit:

```bash
git add 00-scope/ 03-analysis/actor/
git commit -m "ASSESS-2024-002: trigger intelligence — MuddyWater confirmed, PIR-001 answered (yes — targeting criteria match)"
```

---

## Step P2 — Crown Jewels Analysis

You cannot score risk without knowing what matters. Fill the crown jewels register before modelling attack scenarios.

<figure>
<img src="/img/celltronx/04-crown-jewels.png" alt="Crown jewels analysis register for CelltronX" />
<figcaption>Crown jewels scored by Business Impact (financial + regulatory + reputational) × Data Sensitivity × Recovery Time. The HLR subscriber database and SS7 gateway score highest. ENM is the highest-risk internet-exposed asset.</figcaption>
</figure>

```yaml
# 03-analysis/crown-jewels/crown-jewels.yml
assets:
  - id: CJ-001
    name: HLR — Home Location Register (Comverse Subscriber Database)
    description: 8.2M subscriber records — MSISDN, IMSI, location area, SIM status, call forwarding
    business_impact: critical
    data_sensitivity: high   # subscriber PII, location data — GDPR + Israeli Privacy Protection Law
    recovery_time: 72h       # full restore from backup; live service not restored until data integrity confirmed
    internet_exposed: false
    vendor_access: comverse  # Comverse engineers have quarterly access windows
    attacker_value: "Real-time subscriber location, IMSI for SS7 attacks, SIM swap capability"

  - id: CJ-002
    name: SS7/Sigtran Gateway (Teligent SGW-4800)
    description: Interconnect with 14 roaming partners via SS7. Processes location queries, call setup, SMS routing.
    business_impact: critical
    data_sensitivity: high
    recovery_time: 4h
    internet_exposed: false
    vendor_access: teligent
    attacker_value: "SendRoutingInfo, AnyTimeInterrogation — real-time tracking of any subscriber"

  - id: CJ-003
    name: Ericsson ENM (Element Management System)
    description: Manages 4G/5G RAN equipment — base station config, software updates, alarms
    business_impact: high
    data_sensitivity: medium
    recovery_time: 24h
    internet_exposed: true   # PORT 443 — auth via LDAP, no MFA
    vendor_access: ericsson
    attacker_value: "Network topology map, base station push — potential for outage or persistent implant in RAN"

  - id: CJ-004
    name: Roaming Partner API Gateway
    description: REST API for 14 roaming partners — authentication via static API keys, 3 over HTTP
    business_impact: high
    data_sensitivity: high
    recovery_time: 8h
    internet_exposed: true
    vendor_access: none
    attacker_value: "API keys reusable for subscriber queries from roaming networks"

  - id: CJ-005
    name: Core Network Management VPN
    description: Cisco AnyConnect — used by NOC engineers and 6 vendors for core network access
    business_impact: critical
    data_sensitivity: medium
    recovery_time: 2h
    internet_exposed: true
    vendor_access: multiple
    attacker_value: "Pivot to any core network system once authenticated"
```

**Exposure matrix:**

| Asset | Internet-Exposed | Vendor Access | MFA | Actor TTP Alignment |
|---|---|---|---|---|
| ENM (CJ-003) | ✅ Yes | ✅ Ericsson | ❌ No | ✅ DarkDoor targets ENM |
| Roaming API (CJ-004) | ✅ Yes | ❌ No | ❌ Static keys | ✅ Actor collects roaming creds |
| Core VPN (CJ-005) | ✅ Yes | ✅ 6 vendors | ❌ 2 vendors no MFA | ✅ Supply chain vector |
| HLR (CJ-001) | ❌ No | ✅ Comverse | ✅ Yes | ⚠️ Reachable post-pivot |
| SS7 GW (CJ-002) | ❌ No | ✅ Teligent | ✅ Yes | ⚠️ Reachable post-pivot |

---

## Step P3 — Threat Actor Intelligence

Build a working actor profile — not a wiki entry. Every TTP needs: evidence source, detection data source, whether CelltronX has that data source.

<figure>
<img src="/img/celltronx/05-actor-profile.png" alt="MuddyWater actor profile in OpenCTI" />
<figcaption>OpenCTI actor profile for MuddyWater with linked attack patterns, malware families, and infrastructure. The relationship graph shows DarkDoor and SlugResin backdoors connected to telecom targeting campaigns.</figcaption>
</figure>

### MuddyWater TTP Profile — Telecom-Relevant Techniques

Extract from OpenCTI using VS Code REST Client:

```http
### OpenCTI — Export MuddyWater ATT&CK techniques as STIX bundle
GET {{OPENCTI_URL}}/api/v1/stix/bundle?id={{MUDDYWATER_ID}}&types=attack-pattern
Authorization: Bearer {{OPENCTI_TOKEN}}
```

Parse the response with jq:

```bash
jq -r '.objects[] | select(.type == "attack-pattern") | 
  [.external_references[0].external_id, .name] | @tsv' \
  muddywater-bundle.json | sort
```

Output — techniques confirmed in 2024 campaigns:

```
T1059.001   Command and Scripting: PowerShell
T1078.003   Valid Accounts: Local Accounts (vendor credentials)
T1090.001   Proxy: Internal Proxy (Ligolo-ng)
T1105       Ingress Tool Transfer (SimpleHelp, ScreenConnect)
T1110.003   Password Spraying (against VPN and OWA)
T1133       External Remote Services (RMM tools as persistent access)
T1219       Remote Access Software (SimpleHelp, AnyDesk, RemoteUtils)
T1505.003   Server Software Component: Web Shell
T1566.001   Phishing: Spearphishing Attachment
T1566.002   Phishing: Spearphishing Link (IT helpdesk lures)
T1572       Protocol Tunneling (Ligolo-ng)
T1583.001   Acquire Infrastructure: Domains (typosquatting CelltronX suppliers)
T1590.005   Gather Victim Network Info: IP Addresses (Shodan recon)
T1592.002   Gather Victim Host Info: Software (EMS version fingerprinting)
```

**Actor signature behaviours** (confirmed in ≥3 independent reports):

1. **SimpleHelp as persistence:** Actor installs SimpleHelp on victim machines posing as IT support. Because SimpleHelp is legitimate software, AV and EDR do not flag it. The legitimate binary is the implant.

2. **Ligolo-ng tunnelling:** After initial foothold, deploys Ligolo-ng to create an encrypted tunnel from victim network to actor-controlled relay. All further C2 traffic appears as outbound HTTPS to a legitimate-looking domain.

3. **Living off the land in telecom:** Actor avoids custom malware on core network systems. Uses WMI, PowerShell, and built-in network management CLI tools to traverse systems. Leaves minimal forensic footprint.

4. **EMS as pivot:** In confirmed telecom targeting, ENM/EMS access is used to enumerate base station configurations and push configuration changes — not just for intelligence collection but for potential disruption capability.

5. **Roaming credential theft:** API keys from roaming partner interfaces have been found in actor infrastructure, suggesting collection of interconnect credentials for subscriber tracking across networks.

---

## Step P4 — Attack Scenario Modeling

Five scenarios. Each maps to crown jewels, actor TTPs, and a go/no-go detection verdict.

### TRG-001 — Phishing → SimpleHelp RMM → HLR Access

**Probability: High.** SimpleHelp is already installed. Actor uses IT helpdesk lures.

```
Attack path:
  [Phishing email → "IT helpdesk onboarding" lure]
    ↓ T1566.001
  [Employee clicks → downloads SimpleHelp client with actor's server configured]
    ↓ T1219 / T1133
  [Actor has persistent RMM access to employee workstation]
    ↓ T1059.001 (PowerShell)
  [Password spray against LDAP / AD]
    ↓ T1110.003
  [Lateral movement via SMB to server with HLR management client]
    ↓ T1021.002
  [Query HLR for subscriber records via legitimate management interface]
    ↓ T1213 (Data from Information Repositories)
  [Exfil via Ligolo-ng tunnel to actor relay]
    ↓ T1572 / T1041
```

**Crown jewels at risk:** CJ-001 (HLR), CJ-005 (Core VPN post-spray)

**Detection gaps:**
- SimpleHelp outbound connections not baselined — no alert on new SimpleHelp server
- LDAP password spray: events exist in AD, no correlation rule
- HLR management interface queries: logged locally, not in SIEM
- Ligolo-ng tunnel: appears as HTTPS to legitimate domain — no JA3/JARM fingerprinting

**Go/No-Go verdict: WOULD NOT CATCH.** Zero detection rules would fire on this path.

---

### TRG-002 — ENM Exploitation → RAN Configuration Access

**Probability: High.** ENM exposed, no MFA. DarkDoor specifically targets ENM.

```
Attack path:
  [Shodan recon → CelltronX ENM portal on 185.x.x.x:443 identified]
    ↓ T1590.005 / T1592.002
  [Credential stuffing / password spray against LDAP-backed ENM login]
    ↓ T1110.003 (using vendor account list from LinkedIn)
  [Authentication as ericsson-vendor account (no MFA)]
    ↓ T1078.003
  [DarkDoor web shell dropped via ENM file upload function]
    ↓ T1505.003
  [Network topology enumerated: all base stations, IP addresses, management VLANs]
    ↓ T1016 / T1018
  [Pivot to core network via discovered management interfaces]
    ↓ T1021
```

**Crown jewels at risk:** CJ-003 (ENM), CJ-001/CJ-002 (post-pivot)

**Detection gaps:**
- ENM login failures: logged in ENM audit log, not in SIEM
- Vendor account login outside business hours: no baseline or alert
- Web shell upload: no file integrity monitoring on ENM
- Network enumeration from ENM: no internal detection on ENM-initiated scans

**Go/No-Go verdict: WOULD NOT CATCH.** ENM is a blind spot — no telemetry in SIEM.

---

### TRG-003 — Supply Chain: Vendor VPN → Core Network

**Probability: Medium.** Two vendors lack MFA on VPN. One vendor (Comverse) has quarterly access to HLR.

```
Attack path:
  [Compromise Comverse engineer laptop (phishing or watering hole)]
    ↓ T1566 / T1189
  [Comverse VPN certificate / credentials extracted from compromised laptop]
    ↓ T1552.004 (Credentials in Files)
  [Actor connects to CelltronX core VPN as Comverse]
    ↓ T1133
  [Access HLR management interface directly — no additional auth]
    ↓ T1078
  [Subscriber bulk export via Comverse API]
    ↓ T1530 / T1213
```

**Crown jewels at risk:** CJ-001 (HLR), CJ-002 (SS7 gateway — also on Comverse's access list)

**Detection gaps:**
- Vendor VPN connections: logged, no anomaly detection (time of day, source IP, volume)
- Comverse API export volume: no DLP baseline — bulk export indistinguishable from backup
- SS7 gateway access via Comverse: logged locally, not in SIEM

**Go/No-Go verdict: WOULD NOT CATCH.** Vendor traffic is trusted and unmonitored.

---

### TRG-004 — Roaming API Key Theft → Subscriber Tracking

**Probability: Medium.** 3 roaming partners use unencrypted XML over HTTP. Actor collects interconnect credentials.

```
Attack path:
  [Compromise roaming partner network (easier target)]
    ↓ (out of scope — external)
  [Extract CelltronX API key from roaming partner's config]
    ↓ T1552 (from partner)
  [Use stolen API key to query CelltronX roaming gateway]
    ↓ T1078 (valid credentials)
  [SendRoutingInfo / AnyTimeInterrogation for target subscriber location]
    ↓ T1592 (collection)
```

**Crown jewels at risk:** CJ-004 (Roaming API), subscriber location data for all 8.2M users

**Detection gaps:**
- API key use from new IP: no geolocation alert on API gateway
- Query volume per key: no rate limiting or anomaly detection
- SS7 protocol commands: no MAP/TCAP inspection on signalling links

**Go/No-Go verdict: WOULD NOT CATCH.** Valid credentials bypass all controls.

---

### TRG-005 — Reconnaissance Only (Pre-Attack Positioning)

**Probability: High (already assessed as ongoing per CERT-IL advisory).**

```
Reconnaissance path:
  [LinkedIn scraping: identify ENM admins, NOC engineers, Ericsson contacts]
    ↓ T1591.004
  [Shodan: identify ENM portal, roaming API, VPN endpoints]
    ↓ T1590.005
  [Certificate Transparency: map CelltronX subdomains and vendor portals]
    ↓ T1596.003
  [GitHub: search for CelltronX config files, API keys in repos]
    ↓ T1593.003
  [Passive DNS: identify infrastructure changes, new services]
    ↓ T1596.001
```

**Detection gaps:** All reconnaissance is passive and external. No detection possible.

**Go/No-Go verdict: UNDETECTABLE at current capability.** However, some signals are detectable: GitHub secret scanning, Certificate Transparency monitoring, and Shodan exposure alerts are all achievable.

---

## Step P5 — Detection Gap Analysis

Map all five scenarios to ATT&CK. Score each technique against three dimensions: data source present, ingestion status, alert rule deployed.

<figure>
<img src="/img/celltronx/06-attck-gap-map.png" alt="ATT&CK detection gap heatmap for CelltronX" />
<figcaption>The gap heatmap shows red across initial access and persistence techniques. Green exists only for commodity malware detection where CrowdStrike EDR fires. The entire telecom-specific attack path — ENM exploitation, SS7 abuse, RMM persistence — is undetected.</figcaption>
</figure>

### Gap Register

Use [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) to score data source coverage:

```bash
python3 dettect.py ds -fd data-sources-celltronx.yml -l
```

```yaml
# data-sources-celltronx.yml — CelltronX data source inventory
data_sources:
  - data_source: Windows Event Logs
    date_registered: 2023-01-01
    date_connected: 2023-01-15
    products: [Elastic SIEM]
    comment: "Domain controllers and workstations — server coverage 60%"
    available_for_data_analytics: true

  - data_source: Network Traffic
    date_registered: 2023-06-01
    date_connected: 2023-07-01
    products: [Elastic SIEM]
    comment: "Perimeter firewall only — no internal segment visibility"
    available_for_data_analytics: true

  - data_source: Process Creation
    date_registered: 2024-01-01
    date_connected: 2024-01-15
    products: [CrowdStrike Falcon, Sysmon]
    comment: "User workstations only — servers at 40% coverage"
    available_for_data_analytics: true

  - data_source: ENM Audit Logs
    date_registered: null
    date_connected: null
    products: []
    comment: "GAP — ENM audit log not forwarded to SIEM"
    available_for_data_analytics: false

  - data_source: WMI Activity
    date_registered: null
    date_connected: null
    products: []
    comment: "GAP — WMI Operational log not collected"
    available_for_data_analytics: false

  - data_source: Authentication Logs — Vendor VPN
    date_registered: 2023-01-01
    date_connected: 2023-01-15
    products: [Elastic SIEM]
    comment: "Logs present but no anomaly detection deployed"
    available_for_data_analytics: true

  - data_source: SS7/Sigtran Signalling
    date_registered: null
    date_connected: null
    products: []
    comment: "GAP — no MAP/TCAP inspection capability"
    available_for_data_analytics: false

  - data_source: Roaming API Gateway Logs
    date_registered: 2023-01-01
    date_connected: null
    comment: "GAP — logs generated locally, not shipped to SIEM"
    available_for_data_analytics: false
```

**Gap summary:**

| Gap type | Count | Sprint required |
|---|---|---|
| **Data source missing** | 4 | Infrastructure project — ENM, WMI, SS7, Roaming API forwarding |
| **Rule missing** | 6 | Detection sprint — data exists but no rule deployed |
| **Coverage incomplete** | 3 | Tuning sprint — partial deployment or mis-configured |
| **Architectural gap** | 1 | Strategic — no SS7 protocol inspection capability |

**The single most consequential gap:** ENM audit logs not in SIEM. TRG-002 (ENM exploitation — highest-probability, highest-impact scenario) is completely invisible. Fixing this requires one Logstash pipeline — no new hardware, no vendor contract.

---

## Step P6 — Detection Backlog

Five Sigma rules prioritised by `Likelihood × Impact`. All target gaps where data exists or can be collected within one sprint.

### DET-001 — SimpleHelp Outbound to Non-Baseline Server (Priority: Critical)

```yaml
title: SimpleHelp RMM Outbound Connection to Unknown Server
id: 7a3f9b2c-1d4e-5f6a-8b9c-0d1e2f3a4b5c
status: experimental
description: |
  Detects SimpleHelp RMM client connecting to a server not in the approved
  SimpleHelp server allowlist. MuddyWater uses SimpleHelp with actor-controlled
  servers to establish persistent access while evading AV/EDR.
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
  filter_approved:
    DestinationIp|cidr:
      - '10.0.0.0/8'
      - '172.16.0.0/12'
      - '192.168.0.0/16'
    DestinationHostname|contains:
      - 'simplehelp.celltronx.co.il'  # approved internal server
  condition: selection and not filter_approved
falsepositives:
  - New approved SimpleHelp server not yet allowlisted
  - Vendor SimpleHelp installation pointing to vendor's own server (should be in allowlist)
level: high
```

**Deployment note:** Run `sigma convert -t elastic-lucene DET-001.yml` and paste into Kibana rule editor. Set threshold: any hit = P1 alert. SimpleHelp should never call home to an unknown server.

---

### DET-002 — ENM Login Outside Business Hours (Priority: Critical)

```yaml
title: Ericsson ENM Authentication Outside Business Hours
id: 2b5d8e1f-4a7c-9b0d-3e6f-1c4a7b0d3e6f
status: experimental
description: |
  Detects successful or failed authentication to the Ericsson ENM portal
  outside defined business hours (07:00–19:00 IST). MuddyWater operations
  targeting telecom EMS systems have been observed during night hours to
  avoid detection by on-call NOC staff.
  Requires ENM audit log forwarding to SIEM — see GAP-001.
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
    event.day_of_week|lt: 6  # Monday=1, Saturday=6
  condition: selection and not filter_business_hours
falsepositives:
  - Emergency NOC activity — should generate a change ticket
  - Ericsson support access during maintenance window (document in ticket)
level: high
```

**Data source prerequisite:** Forward ENM audit log to Logstash. ENM writes JSON audit events to `/var/log/enm/audit.log`. Logstash filebeat input + grok filter for `event.hour` parsing. Estimated effort: 4 hours.

---

### DET-003 — LDAP Password Spray from Single Source (Priority: High)

```yaml
title: LDAP Authentication Spray — Multiple Accounts Single Source
id: 5c8f1a4d-7e0b-3c6f-9a2d-5e8b1c4d7e0b
status: experimental
description: |
  Detects password spraying against LDAP-backed services (ENM, VPN, OWA)
  from a single source IP. MuddyWater uses credential spraying with slow
  timing (1 attempt per account per 10 minutes) to avoid lockout policies.
  Threshold tuned for spray pattern: >10 unique accounts, <5 failures per account.
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
    EventID: 4625  # Failed logon
    LogonType: 3   # Network
  condition: selection
falsepositives:
  - Misconfigured service account
  - User error after password change
level: medium
aggregation:
  group-by:
    - IpAddress
  timespan: 30m
  count: unique(TargetUserName) > 10
  having: count(TargetUserName) < 5  # per account — spray signature
```

**Splunk equivalent:**
```spl
index=wineventlog EventCode=4625 LogonType=3 earliest=-30m
| stats dc(TargetUserName) as unique_accounts, count by IpAddress, TargetUserName
| where unique_accounts > 10
| stats max(unique_accounts) as accounts_sprayed by IpAddress
| where accounts_sprayed > 10
```

---

### DET-004 — Vendor VPN Login from Anomalous ASN (Priority: High)

```yaml
title: Vendor VPN Authentication from Unexpected Country or ASN
id: 9d2e5b8f-1c4a-7d0e-3f6c-9a2e5b8f1c4a
status: experimental
description: |
  Detects Cisco AnyConnect VPN authentication from a vendor account originating
  from an ASN or country not associated with that vendor's baseline.
  MuddyWater supply chain attacks begin with compromise of vendor infrastructure;
  the actor then authenticates as the vendor from Iranian/Turkish hosting ASNs.
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
  filter_known_vendors:
    # Approved vendor ASNs — populate from 6-month baseline
    source.as.number|contains:
      - '12849'   # Comverse HQ (Israel)
      - '43766'   # Ericsson Israel
      - '197422'  # Teligent Poland
      - '6805'    # Telefónica (roaming)
  condition: selection and not filter_known_vendors
falsepositives:
  - Vendor engineer working remotely or from new office (request change ticket)
  - Vendor using new ISP (update baseline)
level: high
```

---

### DET-005 — Ligolo-ng Tunnel Relay Pattern (Priority: Medium)

```yaml
title: Potential Ligolo-ng Tunnel — TLS to Non-Standard Port
id: 3f6c9a2e-5b8f-1c4a-7d0e-3f6c9a2e5b8f
status: experimental
description: |
  Detects outbound TLS connections to non-standard ports that match Ligolo-ng's
  default tunnel configuration. Ligolo-ng creates a reverse TLS tunnel from
  victim to actor relay, appearing as legitimate HTTPS but on ports 11601 or
  custom high ports. Used by MuddyWater post-compromise for C2 and pivot.
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
  selection_tls:
    DestinationPort:
      - 11601  # Ligolo-ng default
      - 11602
      - 8888
      - 9001
    Protocol: tcp
  filter_known:
    DestinationIp|cidr:
      - '10.0.0.0/8'
      - '172.16.0.0/12'
      - '192.168.0.0/16'
  condition: selection_tls and not filter_known
falsepositives:
  - Custom application using non-standard TLS port (document in CMDB)
  - Developer tooling
level: medium
```

**JARM fingerprinting alternative:** If your perimeter supports TLS inspection, the JARM fingerprint for Ligolo-ng relay is documented in public threat intel. Deploy as a network detection rule for zero false positives.

Commit the backlog:

```bash
git add 04-detections/sigma/ 03-analysis/
git commit -m "ASSESS-2024-002: detection backlog — 5 Sigma rules (DET-001 to DET-005); gap register 4 data-source, 6 rule-missing, 3 coverage-incomplete, 1 arch-gap"
```

---

## Step P7 — Deliverables

### Executive Brief (1 page — for CISO)

**Bottom line:** MuddyWater is actively targeting Israeli mobile network operators for subscriber intelligence collection. CelltronX matches their targeting criteria. Three attack paths have a zero-detection verdict under current controls.

**The critical exposure:** The Ericsson ENM network management portal is accessible from the internet with no MFA. A threat actor with published interest in exactly this system can authenticate as a vendor account, deploy a web shell, and enumerate the entire radio access network within 20 minutes. We have no visibility into this system today.

**Three immediate actions (this week, no budget required):**

1. **Take ENM offline from the internet or enable MFA** — eliminates the highest-probability, highest-impact attack path. Cost: zero. Effort: 2 hours.
2. **Forward ENM audit log to SIEM** — gives visibility into an asset the SOC currently cannot see. Cost: zero. Effort: 4 hours.
3. **Enforce MFA on all vendor VPN accounts** — closes the supply chain path. Cost: zero. Effort: 1 day.

**Detection investment required for material coverage:** 5 Sigma rules (provided), 4 Logstash pipeline additions, 1 baseline exercise (SimpleHelp approved servers). Estimated effort: 2-week sprint.

**Regulatory exposure:** TRG-001 (HLR access via SimpleHelp) would give the actor bulk subscriber data including MSISDN, IMSI, and location area. Under Israeli Privacy Protection Law 2024 and GDPR Article 33, this triggers a 24-hour notification obligation. Current detection capability: **0/5 techniques detected**.

---

### SOC Handoff Package

```
04-detections/sigma/
  DET-001-simplehelp-unknown-server.yml       ← Deploy immediately, no prerequisites
  DET-002-enm-login-after-hours.yml           ← Deploy after GAP-001 (ENM log forwarding)
  DET-003-ldap-password-spray.yml             ← Deploy immediately
  DET-004-vendor-vpn-asn-anomaly.yml          ← Deploy after ASN baseline (1 week)
  DET-005-ligolo-ng-tunnel.yml                ← Deploy immediately

04-detections/hunt-plans/
  HUNT-001-simplehelp-servers.md              ← Manual hunt: inventory all SimpleHelp instances and verify server list
  HUNT-002-enm-accounts.md                   ← Manual hunt: enumerate all ENM accounts, flag vendor accounts with no recent MFA

03-analysis/actor/
  muddywater-c2-ips.txt                       ← 4 IOCs — block at perimeter immediately
  muddywater-domains.txt                      ← 8 domains — add to DNS sinkhole
  muddywater-simplehelp-servers.txt           ← 3 known actor SimpleHelp servers
```

**IOC deployment (immediate — no analysis required):**

```bash
# Block 4 confirmed C2 IPs at perimeter
cat 03-analysis/actor/muddywater-c2-ips.txt | while read ip; do
  echo "Blocking $ip..."
  # palo-alto: set security policy rule MuddyWater-Block destination $ip action deny
done

# Add 8 C2 domains to DNS sinkhole
cat 03-analysis/actor/muddywater-domains.txt
# updatesvc-helper[.]com
# simpleconnect-relay[.]net
# helpdesk-mgmt[.]io
# [... 5 more]
```

---

### ATT&CK Navigator Layer

Import `03-analysis/attck-mapping/celltronx-attck-layer.json` into [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/):

- **Red** — rule missing (data exists, no alert)
- **Orange** — coverage incomplete
- **Yellow** — data source missing (infrastructure required before rules can be written)
- **Green** — detected (CrowdStrike covers commodity malware entry)

The layer shows the full telecom attack path from T1566 to T1213 in red — visible to the SOC in one screenshot, actionable as a sprint plan.

---

## Key Lessons

**1. Proactive CTI answers a specific question, not a general one.** The PIRs define the output. "Are we a target?" (PIR-001) is answered in Step P1. "What would they do?" (PIR-002) is answered in Steps P3-P4. "What do we build?" (PIR-003) is answered in Steps P5-P6. The assessment ends when the PIRs are answered — not when everything is perfect.

**2. Crown jewels determine scenario priority.** Five scenarios were modeled. TRG-001 and TRG-002 were prioritised not because they are more sophisticated but because they touch HLR and ENM — the highest-scoring assets. A scenario that reaches a low-value system gets lower engineering priority regardless of probability.

**3. The hardest finding to deliver is the one you cannot detect.** TRG-004 (roaming API abuse via stolen key) has **zero detection points** — it uses valid credentials against a legitimate interface. The mitigation is architectural (rate limiting, anomaly detection on API key usage, mutual TLS for roaming partners). No Sigma rule solves this. Write it plainly in the executive brief.

**4. Data source gaps are findings, not prerequisites.** ENM logs not in SIEM is not a project dependency to solve before the assessment is complete — it is a finding that belongs in the deliverable. The assessment answer is: *"We cannot detect TRG-002 and will not be able to until ENM audit logs are forwarded."* The CISO decides whether to fund that work.

**5. The actor is less important than the path.** MuddyWater is the trigger, not the constraint. Any actor who uses SimpleHelp for persistence, LDAP password spraying, and vendor VPN access — which is most financially and state-motivated actors operating in this region — would follow TRG-001 or TRG-003. The detections are actor-agnostic. The value of the assessment outlives MuddyWater's current campaign.

---

## Detection Coverage: Before and After

| Scenario | Before Assessment | After Sprint | Change |
|---|---|---|---|
| TRG-001 SimpleHelp → HLR | 0/5 techniques | 3/5 (DET-001, DET-003, DET-005) | +3 |
| TRG-002 ENM Exploitation | 0/5 techniques | 3/5 (DET-002, DET-003 + ENM log) | +3 (after GAP-001) |
| TRG-003 Vendor VPN → HLR | 0/4 techniques | 2/4 (DET-004 + VPN baseline) | +2 |
| TRG-004 Roaming API Abuse | 0/3 techniques | 0/3 (architectural gap) | 0 |
| TRG-005 Recon | 0/5 techniques | 0/5 (external/passive) | 0 |

**Total coverage improvement:** 0 → 8 detection points across 4 techniques and 3 scenarios with a 2-week sprint.

The two scenarios that remain at zero (TRG-004 and TRG-005) require architectural investment, not detection engineering. They go into the roadmap, not the sprint.

---

## Git History: What a Completed Proactive Assessment Looks Like

```bash
git log --oneline
```

```
7a3f9b2  ASSESS-2024-002: deliverables — exec brief, SOC handoff, ATT&CK layer; all PIRs answered; closed
c8d1e5f  ASSESS-2024-002: Sigma rules DET-001 to DET-005 + hunt plans
9b2a4c1  ASSESS-2024-002: ATT&CK gap mapping — 14 techniques, 4 data-source gaps, 6 rule-missing
3f6a8d2  ASSESS-2024-002: attack scenario modeling — 5 scenarios, TRG-001 to TRG-005
5a9b3c4  ASSESS-2024-002: crown jewels analysis — 5 assets scored, exposure matrix
8c2d6f1  ASSESS-2024-002: actor intelligence — MuddyWater TTP profile, MISP IOCs, 3 sources
4b7e1a3  ASSESS-2024-002: trigger intelligence — PIR-001 answered (yes — targeting criteria match)
2d5f9c7  ASSESS-2024-002: intake complete — critical findings: ENM exposed, SimpleHelp installed, no WMI logging
a1e4b8f  ASSESS-2024-002: initialize CelltronX proactive assessment — MuddyWater trigger
```

Nine commits. Every analytical step is timestamped and auditable. The git log is the chain of custody for the assessment — it proves what was known when each decision was made.

---

## Continue Learning

| Next step | Link |
|---|---|
| Run this assessment yourself | [Assignment A02 — CelltronX](/docs/training/02-proactive-celltronx) |
| Full proactive methodology reference | [CTI as a Code Methodology](/docs/cti-as-a-code-methodology#proactive-mode) |
| Reactive counterpart — post-breach investigation | [LifeTech Pharma Case Study](/docs/lifetech-pharma-case-study) |
| Technical walkthrough — all tool commands | [Proactive Walkthrough](/docs/proactive-walkthrough) |
| Detection rules from this case | Step P6 — Sigma rules above |
| ATT&CK Navigator — import this case's layer | Available in `03-analysis/attck-mapping/` |
| Full CTI Portfolio | [anpa1200.github.io/cti.html](https://anpa1200.github.io/cti.html) |
| CTI Analyst Field Manual — proactive tradecraft | [Field Manual](https://anpa1200.github.io/cti-analyst-field-manual/) |
| Israel CTI — MuddyWater sector context | [Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/) |
