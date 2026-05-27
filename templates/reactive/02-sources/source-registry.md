# Intelligence Source Registry

**Project:** [project.yml → project.id]

Admiralty Scale: Source reliability A (completely reliable) – F (reliability cannot be judged).  
Information reliability: 1 (confirmed) – 6 (truth cannot be judged).

---

## Internal Sources

| ID | Source | Type | Admiralty | Notes |
|---|---|---|---|---|
| INT-001 | SIEM / Elastic | Log telemetry | A/2 | Primary forensic source |
| INT-002 | EDR (Velociraptor) | Endpoint telemetry | A/2 | |
| INT-003 | Network monitoring | NetFlow / PCAP | A/2 | |
| INT-004 | Email security gateway | Mail logs | A/2 | |

---

## External / OSINT Sources

| ID | Source | Type | Admiralty | TLP | Notes |
|---|---|---|---|---|---|
| EXT-001 | CERT-IL | Government advisory | A/2 | TLP:AMBER | |
| EXT-002 | VirusTotal | IOC enrichment | C/3 | TLP:WHITE | Hash/IP lookups |
| EXT-003 | Shodan | Infrastructure recon | C/3 | TLP:WHITE | |
| EXT-004 | URLScan.io | Domain analysis | C/3 | TLP:WHITE | |
| EXT-005 | MISP | Community threat intel | B/3 | TLP:AMBER | Sector sharing |

---

## Source Limitations

| Source | Known Limitation |
|---|---|
| | |
