# Threat Actor Profile: CEDAR-SIGNAL

**TLP: WHITE**  
**Source:** Commercial threat intelligence platform (Recorded Future / Mandiant — composite, fictional)  
**Date:** 2024-10-14  
**Confidence:** B/2 (Usually reliable source; probably true)

---

## Overview

CEDAR-SIGNAL is an intrusion cluster assessed with **moderate confidence** to operate
in support of Iranian national intelligence objectives. The cluster specializes in
targeting telecommunications operators and government communications infrastructure
across the Middle East, North Africa, and Eastern Mediterranean.

**First observed:** 2020 (limited activity)  
**Significantly active since:** 2022  
**Primary motivation:** Espionage — subscriber surveillance, call interception, government
official location tracking  
**Secondary motivation:** Pre-positioning — assessed to maintain persistent access in
telecommunications infrastructure for potential future disruptive operations  
**Estimated team size:** 8–15 operators (assessed from operational tempo and code reuse)

---

## Targeting Profile

**Primary sectors:** Telecommunications operators, ISPs, government communications agencies  
**Primary geographies:** Israel, UAE, Jordan, Bahrain, Saudi Arabia, Cyprus  
**Specific targets within telecom:**
- Network Operations Center (NOC) staff
- OSS/BSS engineers with access to network management systems
- IT administrators managing telecom core infrastructure
- Employees with privileged access to SS7/Diameter gateways

**NOT observed targeting:** Consumer-facing staff, call center personnel, billing staff
(unless they have access to CDR or billing database exports)

---

## TTPs (ATT&CK Mapping)

| Phase | Technique | ID | Confidence |
|---|---|---|---|
| Initial Access | Spearphishing — ISO/LNK dropper to NOC/OSS staff | T1566.001 | High |
| Initial Access | Exploit public-facing NMS (Ericsson ENM, Nokia NetAct) | T1190 | Medium |
| Execution | PowerShell dropper (base64, HTTPS download) | T1059.001 | High |
| Persistence | Scheduled task + SSH authorized_keys on Linux | T1053.005, T1098.004 | High |
| Persistence | Service account creation resembling legitimate accounts | T1136.001 | High |
| Defense Evasion | Domain fronting via CDN (Cloudflare, Akamai) | T1090.004 | Medium |
| Defense Evasion | C2 beacon at 4–8h intervals (low-and-slow) | T1071.001 | High |
| Credential Access | Keylogging on compromised workstations | T1056.001 | Medium |
| Discovery | SS7 network discovery via NetAct management API | T1016 | High |
| Collection | SS7 MAP queries for subscriber location | T1040 | High |
| Collection | CDR export from billing database | T1005 | Medium |
| Exfiltration | DNS TXT tunneling (custom encoding) | T1048.003 | High |
| Exfiltration | HTTPS to C2 (Cloudflare fronted) | T1041 | High |

---

## Infrastructure Patterns

- **Domain registration:** Lookalike domains registered 1–14 days before first observed use
- **Registrars:** Namecheap, Porkbun, Epik (consistent across confirmed clusters)
- **TLS:** Let's Encrypt certificates; blank Organization field
- **Hosting:** VPS providers (Vultr, DigitalOcean, Hetzner); /24 blocks reserved per campaign
- **DNS TTL:** 300 seconds (enables rapid IP rotation on detection)
- **C2 protocol:** HTTPS with domain fronting; mimics Microsoft/Google CDN traffic patterns

---

## Targeting Overlap with CelltronX

CelltronX matches CEDAR-SIGNAL's ideal targeting profile on FIVE criteria:
1. Israeli telecommunications operator (primary sector)
2. Holds Israeli government contracts (PMO encrypted communications)
3. Has SS7 infrastructure (documented target capability)
4. Has Ericsson ENM in its network (documented exploitation target)
5. Has cross-border operations in UAE and Cyprus (both CEDAR-SIGNAL target geographies)

**Assessment:** CelltronX should treat CEDAR-SIGNAL as a **likely active threat**.
The lookalike domain registrations (TRG-003) are consistent with CEDAR-SIGNAL pre-attack
infrastructure setup observed in prior campaigns.

---

## Historical Incidents Attributed to CEDAR-SIGNAL (Selected)

| Date | Target | Method | Outcome |
|---|---|---|---|
| 2022-Q3 | Bahraini telecom operator | NetAct exploitation | 90-day access; CDR exfiltration |
| 2023-Q2 | Jordanian telecom | Spearphishing ISO | SS7 location tracking of 400 subscribers |
| 2024-Q1 | UAE telecom (unconfirmed) | Unknown initial access | Brief access; no confirmed data exfiltration |
| 2024-Q3 | Israeli telecom (peer incident, TRG-002) | Spearphishing ISO | SS7 location tracking of 1,800 subscribers |
