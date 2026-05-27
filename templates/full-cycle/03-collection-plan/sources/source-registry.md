# Intelligence Source Registry

**Program:** [project.yml → project.id]  
**Last updated:** YYYY-MM-DD

Admiralty Scale: Source A (completely reliable) – F (reliability cannot be judged) / Information 1 (confirmed) – 6 (truth cannot be judged).

---

## Government and Official Sources

| ID | Source | Type | Admiralty | TLP Received | Access Method | Cost | PIRs Supported |
|---|---|---|---|---|---|---|---|
| SRC-001 | CERT-IL | National CERT | A/2 | TLP:AMBER | Portal / Email | Free | PIR-001, PIR-002 |
| SRC-002 | INCD | National authority | A/1 | TLP:RED | Classified channel | Free | PIR-001 |
| SRC-003 | FinCERT (Bank of Israel) | Sector CERT | A/2 | TLP:AMBER | MOU required | Free | PIR-003 |

---

## Commercial Threat Intelligence Feeds

| ID | Source | Type | Admiralty | TLP | Cost | PIRs Supported | Renewal |
|---|---|---|---|---|---|---|---|
| SRC-010 | | Threat feed | | | | | YYYY-MM-DD |

---

## OSINT Sources

| ID | Source | Type | Admiralty | Notes |
|---|---|---|---|---|
| SRC-020 | VirusTotal | IOC enrichment | C/3 | Hash, IP, domain lookup |
| SRC-021 | Shodan | Infrastructure intel | C/3 | External exposure monitoring |
| SRC-022 | URLScan.io | Domain/URL analysis | C/3 | Phishing domain investigation |
| SRC-023 | GitHub | Code / tool tracking | C/3 | Adversary tooling, exposed credentials |

---

## Peer Intelligence Sources

| ID | Source | Type | Admiralty | Sharing Agreement | TLP |
|---|---|---|---|---|---|
| SRC-030 | [Peer org 1] | Industry peer | B/3 | Bilateral MOU | TLP:AMBER |
| SRC-031 | [Sector ISAC] | Community | B/3 | ISAC membership | TLP:GREEN |

---

## Internal Sources

| ID | Source | Type | Admiralty | Notes |
|---|---|---|---|---|
| SRC-040 | Elastic SIEM | Log telemetry | A/2 | Primary internal source |
| SRC-041 | Velociraptor EDR | Endpoint telemetry | A/2 | Hunt queries |
| SRC-042 | Network monitoring | NetFlow / PCAP | A/2 | |
| SRC-043 | Email security gateway | Mail logs | A/2 | Phishing detection |

---

## Deprecated Sources

| ID | Source | Deprecated Date | Reason |
|---|---|---|---|
| | | | |
