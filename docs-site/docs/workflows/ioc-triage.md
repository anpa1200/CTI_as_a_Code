---
id: ioc-triage
title: IOC Triage Workflow
sidebar_position: 1
---

# IOC Triage Workflow

This workflow covers the end-to-end process of receiving a suspicious indicator, enriching it, correlating it with known threat intel, and producing a finished intelligence product. It is a core step in both the [reactive investigation](/CTI_as_a_Code/workflows/reactive-investigation) and [proactive assessment](/CTI_as_a_Code/workflows/proactive-assessment) workflows.

## Scenario

A [Kibana](/CTI_as_a_Code/services/elastic-siem) [SIEM](/CTI_as_a_Code/services/elastic-siem) detection rule fires on an outbound connection to an unknown IP. You need to determine whether it is malicious, attribute it if possible, and decide whether to escalate to a full incident.

---

## Step 1: Alert triage in [Kibana](/CTI_as_a_Code/services/elastic-siem)

1. Navigate to **Security → Alerts**
2. Find the alert: `Outbound connection to unknown external IP`
3. Review the alert details:
   - Source host, user, process
   - Destination IP and port
   - Timestamp, duration
4. Click **Investigate in timeline** to see surrounding activity

If the event looks anomalous, proceed to enrichment.

---

## Step 2: Open a [TheHive](/CTI_as_a_Code/services/thehive-cortex) case

1. In [Kibana](/CTI_as_a_Code/services/elastic-siem), copy the destination IP
2. Open [TheHive](/CTI_as_a_Code/services/thehive-cortex) (http://localhost:9100)
3. **New Case → From scratch**
   - Title: `Suspicious outbound connection to <IP>`
   - TLP: AMBER
   - Severity: Medium
   - Tags: `triage`, `outbound`, `unknown-ip`
4. In the **Observables** tab: **Add observable → IP address** → paste the IP

---

## Step 3: [Cortex](/CTI_as_a_Code/services/thehive-cortex) enrichment

1. In the Observables tab, select the IP observable
2. Click **Actions → Analyze**
3. Run these analyzers:
   - `AbuseIPDB` — abuse confidence score
   - `Shodan_Host` — open ports, banners, geolocation ([Shodan](https://www.shodan.io))
   - `IPInfo_1_0` — ASN, org, country
   - `VirusTotal_GetReport` — VT community score ([VirusTotal](https://www.virustotal.com))

**Review results:**
- AbuseIPDB confidence > 50% → likely malicious
- [Shodan](https://www.shodan.io) shows port 4444 or 8080 open → potential C2 profile
- [VirusTotal](https://www.virustotal.com) flagged by 5+ vendors → confirmed malicious

---

## Step 4: Pivot in [OpenCTI](/CTI_as_a_Code/services/opencti)

1. Open [OpenCTI](/CTI_as_a_Code/services/opencti) (http://localhost:8080)
2. Search for the IP in the search bar
3. If the MITRE ATT&CK connector has been running, check:
   - Is the IP associated with any known **Intrusion Set**?
   - What **Campaigns** reference this infrastructure?
   - What **Malware** is linked to this IP?

If no results, add the IP as a new indicator:
- **Analysis → Indicators → Create indicator**
- Pattern: `[ipv4-addr:value = '<IP>']`
- Main observable type: IP
- TLP: AMBER
- Confidence: (set from Cortex results)

---

## Step 5: Infrastructure pivoting

If the IP belongs to a threat actor's infrastructure, expand the investigation:

1. In [OpenCTI](/CTI_as_a_Code/services/opencti), view the IP entity → **Knowledge** tab
2. Explore the graph: look for related domains, other IPs, malware hashes
3. For each new IOC found, add it as an observable in the [TheHive](/CTI_as_a_Code/services/thehive-cortex) case

Common pivots:
- IP → WHOIS org → other IPs registered to same org
- Domain → registrar/nameserver → sibling domains
- Hash → imphash/pehash → related samples

---

## Step 6: Attribution (if possible)

Check if the TTP pattern matches a known group:

1. In [OpenCTI](/CTI_as_a_Code/services/opencti), review the **Techniques** associated with the linked malware
2. Compare against MITRE ATT&CK **Intrusion Sets** → **Techniques used** (explore interactively in [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/))
3. If 3+ TTPs overlap with a known group, note it as a hypothesis (not a confirmed attribution)

Document confidence level in the TheHive case custom field `confidence_level`.

---

## Step 7: Close the case

Update the [TheHive](/CTI_as_a_Code/services/thehive-cortex) case:
- **Status**: TruePositive / FalsePositive / Indeterminate
- **Summary**: fill in the case summary with your findings
- **Task**: mark enrichment tasks complete

If escalating:
- Raise severity to **High** or **Critical**
- Add responders (block IP in firewall via [Cortex](/CTI_as_a_Code/services/thehive-cortex) responder if available)
- Notify relevant stakeholders via [TheHive](/CTI_as_a_Code/services/thehive-cortex)'s notification rules

---

## Output artefacts

| Artefact | Location |
|---|---|
| Enriched observables | [TheHive](/CTI_as_a_Code/services/thehive-cortex) case → Observables |
| Analyzer reports | [TheHive](/CTI_as_a_Code/services/thehive-cortex) case → Observable → Analysis tab |
| STIX indicator | [OpenCTI](/CTI_as_a_Code/services/opencti) → Analysis → Indicators |
| Timeline evidence | [Kibana](/CTI_as_a_Code/services/elastic-siem) → Timeline (saved) |
| Case report (PDF) | [TheHive](/CTI_as_a_Code/services/thehive-cortex) → Case → Export |

---

## Ecosystem

- [Ecosystem overview](/CTI_as_a_Code/ecosystem) — all tools and integrations in the lab
- [CTI as a Code Methodology](/CTI_as_a_Code/cti-as-a-code-methodology) — the step-by-step process this workflow fits into
- [CTI Portfolio](https://1200km.com/cti.html) — worked examples and published assessments
- [CTI Analyst Field Manual](https://1200km.com/cti-analyst-field-manual/) — reference companion for IOC triage
