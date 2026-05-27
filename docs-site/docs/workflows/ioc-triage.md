---
id: ioc-triage
title: IOC Triage Workflow
sidebar_position: 1
---

# IOC Triage Workflow

This workflow covers the end-to-end process of receiving a suspicious indicator, enriching it, correlating it with known threat intel, and producing a finished intelligence product.

## Scenario

A Kibana SIEM detection rule fires on an outbound connection to an unknown IP. You need to determine whether it is malicious, attribute it if possible, and decide whether to escalate to a full incident.

---

## Step 1: Alert triage in Kibana

1. Navigate to **Security → Alerts**
2. Find the alert: `Outbound connection to unknown external IP`
3. Review the alert details:
   - Source host, user, process
   - Destination IP and port
   - Timestamp, duration
4. Click **Investigate in timeline** to see surrounding activity

If the event looks anomalous, proceed to enrichment.

---

## Step 2: Open a TheHive case

1. In Kibana, copy the destination IP
2. Open TheHive (http://localhost:9100)
3. **New Case → From scratch**
   - Title: `Suspicious outbound connection to <IP>`
   - TLP: AMBER
   - Severity: Medium
   - Tags: `triage`, `outbound`, `unknown-ip`
4. In the **Observables** tab: **Add observable → IP address** → paste the IP

---

## Step 3: Cortex enrichment

1. In the Observables tab, select the IP observable
2. Click **Actions → Analyze**
3. Run these analyzers:
   - `AbuseIPDB` — abuse confidence score
   - `Shodan_Host` — open ports, banners, geolocation
   - `IPInfo_1_0` — ASN, org, country
   - `VirusTotal_GetReport` — VT community score

**Review results:**
- AbuseIPDB confidence > 50% → likely malicious
- Shodan shows port 4444 or 8080 open → potential C2 profile
- VT flagged by 5+ vendors → confirmed malicious

---

## Step 4: Pivot in OpenCTI

1. Open OpenCTI (http://localhost:8080)
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

1. In OpenCTI, view the IP entity → **Knowledge** tab
2. Explore the graph: look for related domains, other IPs, malware hashes
3. For each new IOC found, add it as an observable in the TheHive case

Common pivots:
- IP → WHOIS org → other IPs registered to same org
- Domain → registrar/nameserver → sibling domains
- Hash → imphash/pehash → related samples

---

## Step 6: Attribution (if possible)

Check if the TTP pattern matches a known group:

1. In OpenCTI, review the **Techniques** associated with the linked malware
2. Compare against MITRE ATT&CK **Intrusion Sets** → **Techniques used**
3. If 3+ TTPs overlap with a known group, note it as a hypothesis (not a confirmed attribution)

Document confidence level in the TheHive case custom field `confidence_level`.

---

## Step 7: Close the case

Update the TheHive case:
- **Status**: TruePositive / FalsePositive / Indeterminate
- **Summary**: fill in the case summary with your findings
- **Task**: mark enrichment tasks complete

If escalating:
- Raise severity to **High** or **Critical**
- Add responders (block IP in firewall via Cortex responder if available)
- Notify relevant stakeholders via TheHive's notification rules

---

## Output artefacts

| Artefact | Location |
|---|---|
| Enriched observables | TheHive case → Observables |
| Analyzer reports | TheHive case → Observable → Analysis tab |
| STIX indicator | OpenCTI → Analysis → Indicators |
| Timeline evidence | Kibana → Timeline (saved) |
| Case report (PDF) | TheHive → Case → Export |
