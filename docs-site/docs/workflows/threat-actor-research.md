---
id: threat-actor-research
title: Threat Actor Research Workflow
sidebar_position: 2
---

# Threat Actor Research Workflow

A structured approach to building a threat actor profile using the lab — from open-source collection to a finished STIX-structured intelligence product in OpenCTI.

## Objective

Produce a comprehensive, STIX2-structured profile of a threat actor that can be shared with defensive teams and queried programmatically for indicator matching.

---

## Step 1: Collection — gather raw reporting

Starting points:
- MITRE ATT&CK Groups page (already in OpenCTI after MITRE connector sync)
- Vendor threat reports (Mandiant, CrowdStrike, Recorded Future, Secureworks)
- ISAC feeds
- Academic papers, conference presentations

In OpenCTI, check if the actor already exists:

1. **Threats → Intrusion Sets** → search by name or alias
2. If found, review existing knowledge and note gaps
3. If not found, create a new **Intrusion Set**

---

## Step 2: Structure — create the actor in OpenCTI

### Create the Intrusion Set

**Analysis → Intrusion Sets → Create**

| Field | What to fill |
|---|---|
| Name | Primary name (e.g., `APT29`) |
| Aliases | Alternative names (`Cozy Bear`, `Midnight Blizzard`, `The Dukes`) |
| Description | 2–3 sentence summary |
| First seen | Earliest documented activity date |
| Last seen | Most recent confirmed activity |
| Sophistication | `advanced-persistent-threat` |
| Goals | `espionage`, `data-theft` |
| TLP | AMBER (internal) or GREEN (shareable) |

### Link to tactics and techniques

1. Open the new Intrusion Set → **Knowledge** tab
2. **Add relationship → Uses (Attack Pattern)**
3. Search for ATT&CK techniques: `T1566.001` (Spearphishing Attachment), etc.
4. For each technique, record the supporting report as a **reference**

### Link to malware

1. **Arsenal → Malware → Create** (if not yet in OpenCTI)
2. Back in the Intrusion Set → **Add relationship → Uses (Malware)**
3. Repeat for tools

### Link to indicators (IOCs)

1. **Analysis → Indicators → Create indicator**
2. Pattern: STIX2 pattern (e.g., `[domain-name:value = 'evil.example.com']`)
3. Link the indicator to the Intrusion Set: **Add relationship → Indicates (Intrusion Set)**

---

## Step 3: Validation — confidence scoring

For each piece of evidence, apply the Admiralty Scale:

| Source reliability | Info reliability | Combined confidence |
|---|---|---|
| A (completely reliable) | 1 (confirmed) | High |
| B (usually reliable) | 2 (probably true) | Medium-high |
| C (fairly reliable) | 3 (possibly true) | Medium |
| D (not usually reliable) | 4 (doubtfully true) | Low |

Record confidence level (0–100) on each OpenCTI relationship. Use the **Confidence** field when creating relationships.

---

## Step 4: Detection — generate hunting queries

From the ATT&CK techniques linked to the actor, generate detection hypotheses:

### Kibana KQL

For each technique, write a Kibana detection rule:

```
# T1566.001 - Spearphishing Attachment
process.name: "winword.exe" AND process.parent.name: "outlook.exe"
  AND event.type: "process_start"
```

Add the rule in Kibana: **Security → Rules → Create rule → Custom query**

### Elastic EQL (behavioral)

For technique chaining (e.g., initial access → lateral movement):

```eql
sequence by host.name
  [process where process.name == "winword.exe" and event.action == "start"]
  [process where process.parent.name == "winword.exe" and
   process.name in ("cmd.exe", "powershell.exe", "wscript.exe")]
```

---

## Step 5: Product — export the intelligence

### Export from OpenCTI

**Threats → Intrusion Sets → <actor> → Actions → Export → STIX2 bundle**

The bundle contains the actor, all linked TTPs, malware, tools, indicators, and relationships — ready to share with other platforms.

### TheHive case for tracking

Create a TheHive case for the research activity itself:

- Title: `Threat Actor Research: <actor name>`
- Add the PDF reports as attachments
- Link IOCs as observables
- Run Cortex analyzers on key IOCs to validate they are currently active

### Written intelligence product

Structure your written product as:

1. **Executive summary** (3–5 sentences, non-technical)
2. **Threat actor overview** (who, motivation, targets, first seen)
3. **TTP analysis** (primary techniques with ATT&CK IDs)
4. **Infrastructure analysis** (IP ranges, domains, hosting patterns)
5. **Indicators of compromise** (table: type, value, confidence, date)
6. **Detection recommendations** (specific Kibana rules referencing lab-generated queries)
7. **Confidence assessment** (Admiralty Scale per major claim)

---

## Completed lab state

After running this workflow for one actor, the lab should have:

- OpenCTI: structured STIX2 profile with relationships
- Kibana: 3–5 detection rules based on actor TTPs
- TheHive: research case with source attachments
- Exported STIX2 bundle ready for sharing
