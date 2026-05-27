# Tools Reference

This document covers every tool used in the CTI Lab — the Docker lab stack, analysis tools that run on the host, and browser-only web tools. It also lists full system requirements and a per-assignment coverage matrix so you know exactly what to install before starting a given scenario.

---

## Overview

| Category | Where it runs | How to get it |
|---|---|---|
| **Lab stack** | Docker containers (auto-started) | `docker compose up -d` |
| **Host analysis tools** | Your workstation | Install individually (see below) |
| **Web tools** | Browser | No installation |

---

## 1. Lab Stack — Docker Services

All services below start with `docker compose up -d`. Exact image tags are pinned in `docker-compose.yml`.

| Service | Image | Version | Purpose | URL | Profile |
|---|---|---|---|---|---|
| **Elasticsearch** | `docker.elastic.co/elasticsearch/elasticsearch` | 8.13.4 | Shared data store; SIEM index; TheHive + Cortex backend | http://localhost:9200 | core |
| **Kibana** | `docker.elastic.co/kibana/kibana` | 8.13.4 | Elastic SIEM UI; detection rules; dashboards; timeline | http://localhost:5601 | core |
| **OpenCTI** | `opencti/platform` | 6.4.1 | Threat intelligence platform; intelligence graph; STIX 2.1 | http://localhost:8080 | core |
| **OpenCTI Worker** | `opencti/worker` | 6.4.1 | Background job processors for OpenCTI (2 replicas) | — | core |
| **TheHive** | `strangebee/thehive` | 5.3.6-1 | Incident response case management; evidence custody | http://localhost:9100 | core |
| **Cortex** | `thehiveproject/cortex` | 3.1.8-1 | Automated enrichment; analyzer runner (VirusTotal, Shodan, etc.) | http://localhost:9002 | core |
| **MinIO** | `minio/minio` | 2024-01-16 | S3-compatible object store for OpenCTI and TheHive attachments | http://localhost:9001 | core |
| **RabbitMQ** | `rabbitmq` | 3.12-management-alpine | Message broker for OpenCTI workers | http://localhost:15672 | core |
| **Redis** | `redis` | 7.2-alpine | OpenCTI cache and pub/sub | — | core |
| **Logstash** | `docker.elastic.co/logstash/logstash` | 8.13.4 | Log ingestion pipeline; Beats input on :5044 | http://localhost:9600 | `logstash` |
| **MITRE ATT&CK connector** | `opencti/connector-mitre` | 6.4.1 | Syncs full ATT&CK dataset into OpenCTI (techniques, groups, software) | — | `connectors` |

**Default credentials** (change in `.env` before starting):

| Service | Username | Password source |
|---|---|---|
| OpenCTI | `admin@cti-lab.local` | `OPENCTI_ADMIN_PASSWORD` in `.env` |
| Kibana / Elasticsearch | `elastic` | `ELASTIC_PASSWORD` in `.env` |
| TheHive | set on first login | — |
| Cortex | set on first login | — |
| MinIO | `cti_minio` | `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` in `.env` |
| RabbitMQ | `cti_rabbit` | `RABBITMQ_DEFAULT_USER` / `RABBITMQ_DEFAULT_PASS` in `.env` |

---

## 2. Analysis Tools — Install on Host

These tools run on your workstation, not in Docker. All open-source tools are listed first within each category.

### DFIR and Evidence Collection

| Tool | License | Install | Version | Used for |
|---|---|---|---|---|
| **Velociraptor** | AGPL-3.0 | [GitHub releases](https://github.com/Velocidex/velociraptor/releases) | 0.7+ | Remote artifact collection from live endpoints; VQL queries across evidence sources |
| **DFIR-IRIS** | LGPL-3.0 | Docker: [docs.dfir-iris.org](https://docs.dfir-iris.org) | 2.4+ | Case management with full evidence custody chain; audit trail for regulatory compliance |

### Windows Event Log Analysis

| Tool | License | Install | Version | Used for |
|---|---|---|---|---|
| **Hayabusa** | GPL-3.0 | [GitHub releases](https://github.com/Yamato-Security/hayabusa/releases) — single binary | 2.16+ | Fast `.evtx` parsing to CSV/JSON timeline; Sigma rule scanning; gap detection when SIEM didn't fire |
| **Chainsaw** | Apache-2.0 | [GitHub releases](https://github.com/WithSecureLabs/chainsaw/releases) — single binary | 2.9+ | Rapid Sigma-based scan of local event logs; confirms raw evidence before blaming SIEM rule |

### Timeline Analysis

| Tool | License | Install | Version | Used for |
|---|---|---|---|---|
| **Timesketch** | Apache-2.0 | Docker: [timesketch.org](https://timesketch.org) | 20240101+ | Collaborative super-timeline; tag events, add analyst comments, share working timeline |
| **Plaso / log2timeline** | Apache-2.0 | `pip install plaso` | 20240308+ | Normalize multiple log formats (Winlogbeat, VPN, PAM, NetFlow) into a single super-timeline |

### Detection Engineering

| Tool | License | Install | Version | Used for |
|---|---|---|---|---|
| **Sigma + pySigma** | LGPL-2.1 | `pip install pySigma pySigma-backend-elasticsearch` | pySigma 0.10+ | Write vendor-neutral YAML detection rules; convert to Elastic KQL, Splunk SPL, QRadar, etc. |
| **DeTT&CT** | GPL-3.0 | `pip install dettect` or [GitHub](https://github.com/rabobank-cdc/DeTTECT) | 1.5+ | Score detection coverage per ATT&CK technique; produce coverage YAML; identify data-source gaps |
| **Uncoder CLI** | open-source | `pip install uncoder-core` | latest | Local Sigma ↔ SIEM query conversion (alternative to the web tool) |

### Adversary Emulation and Detection Validation

| Tool | License | Install | Version | Used for |
|---|---|---|---|---|
| **Atomic Red Team** | MIT | `git clone https://github.com/redcanaryco/atomic-red-team` | latest | Pre-built atomic tests for 90%+ of ATT&CK techniques; one test per technique ID |
| **Invoke-AtomicRedTeam** | MIT | `Install-Module -Name invoke-atomicredteam` (PowerShell) | 1.0+ | PowerShell wrapper for Atomic Red Team; `--ExecutionLogPath` for timestamped logs |
| **MITRE CALDERA** | Apache-2.0 | `git clone https://github.com/mitre/caldera` + `pip install -r requirements.txt` | 5.0+ | Agent-based emulation platform; chain atomics into multi-step scenarios; autonomous operation |
| **VECTR** | BSD-3-Clause | Docker: [vectr.io](https://vectr.io) | 9.0+ | Plan, track, and document emulation modules; PASS/PARTIAL/FAIL recording; coverage reports |

### Threat Intelligence Platforms

| Tool | License | Install | Version | Used for |
|---|---|---|---|---|
| **MISP** | AGPL-3.0 | Docker: [misp-project.org](https://www.misp-project.org/download) | 2.4.190+ | Structured indicator sharing; ATT&CK Galaxy tagging; TLP enforcement; TAXII feeds |
| **Yeti** | Apache-2.0 | Docker: [yeti-platform.io](https://yeti-platform.io) | 2.1+ | OSINT-focused indicator storage; paste-site and blog monitoring; relationship tracking |
| **TRAM** | Apache-2.0 | Docker/local: [GitHub](https://github.com/center-for-threat-informed-defense/tram) | latest | ML-assisted ATT&CK technique mapping from free-text threat reports (first-pass draft) |

### OSINT and Infrastructure Analysis

| Tool | License | Install | Version | Used for |
|---|---|---|---|---|
| **SpiderFoot** | MIT | `pip install spiderfoot` or Docker | 4.0+ | Automated OSINT collection against domains, IPs, org names; scheduled scans |
| **Maltego CE** | Freemium | [maltego.com/maltego-community](https://www.maltego.com/maltego-community) | 4.3+ | OSINT pivoting across domains, IPs, ASNs, registrant data; visual link analysis |

### Threat Modeling

| Tool | License | Install | Version | Used for |
|---|---|---|---|---|
| **OWASP Threat Dragon** | Apache-2.0 | Desktop app or web: [owasp.org/www-project-threat-dragon](https://owasp.org/www-project-threat-dragon) | 2.2+ | Dataflow diagrams with STRIDE threat enumeration per component; structured threat lists |
| **PyTM** | MIT | `pip install pytm` | 1.3+ | Define system components in Python code; auto-generate DFD diagrams and threat reports |

### Reporting and Documentation

| Tool | License | Install | Version | Used for |
|---|---|---|---|---|
| **Obsidian** | Freeware (local) | [obsidian.md](https://obsidian.md) | 1.5+ | Drafting intelligence products in linked markdown; local storage for classified content |
| **Joplin** | AGPL-3.0 | [joplinapp.org](https://joplinapp.org) | 2.14+ | Encrypted local note-taking for sensitive regulatory drafts (INCD, BDA notifications) |
| **LibreOffice** | MPL-2.0 | Package manager or [libreoffice.org](https://www.libreoffice.org) | 7.6+ | Formatted PDF output for compliance reports and executive summaries; no cloud upload |
| **Pandoc** | GPL-2.0 | `apt install pandoc` or [pandoc.org](https://pandoc.org) | 3.1+ | Convert markdown drafts to PDF/DOCX; automate report formatting |

### Development and Automation

| Tool | License | Install | Version | Used for |
|---|---|---|---|---|
| **Grafana** | AGPL-3.0 | Docker or `apt install grafana` | 10.0+ | Program metrics dashboards (detection deploy rate, time-to-detection, gap closure rate) |
| **GitLab CE** | MIT (CE) | Docker or [about.gitlab.com](https://about.gitlab.com) | 16.0+ | Detection backlog tracking; version-controlled runbooks; CI pipelines for rule testing |
| **n8n** | Sustainable Use | Docker: `docker run n8nio/n8n` | 1.30+ | Workflow automation; sanitization pipelines (strip classified fields before sharing) |
| **draw.io desktop** | Apache-2.0 | [github.com/jgraph/drawio-desktop](https://github.com/jgraph/drawio-desktop/releases) | 24.0+ | Architecture diagrams; trust boundary maps; threat model visuals |

---

## 3. Web Tools — Browser Only

No installation required. Bookmark these before starting the training.

| Tool | License | URL | Used for |
|---|---|---|---|
| **ATT&CK Navigator** | Apache-2.0 | [mitre-attack.github.io/attack-navigator](https://mitre-attack.github.io/attack-navigator/) | Technique heatmaps; coverage layers; threat scenario overlays |
| **Uncoder.io** | Free (online) | [uncoder.io](https://uncoder.io) | Sigma ↔ SIEM query conversion in browser; no install; supports 20+ targets |
| **VirusTotal** | Freemium | [virustotal.com](https://www.virustotal.com) | IP/domain/hash reputation; passive DNS; infrastructure enrichment |
| **Shodan** | Freemium | [shodan.io](https://www.shodan.io) | Exposed services on actor infrastructure; TLS certificate data; ASN context |
| **Censys** | Freemium | [search.censys.io](https://search.censys.io) | Alternative to Shodan; certificate chain pivoting |
| **URLScan.io** | Free | [urlscan.io](https://urlscan.io) | Safely analyze lookalike domains without visiting them; screenshot and redirect capture |
| **PassiveDNS** | Free | [passivedns.mnemonic.no](https://passivedns.mnemonic.no) | Historical DNS resolution for C2 domains |
| **TRAM web** | Apache-2.0 | [tram.mitre-engenuity.org](https://tram.mitre-engenuity.org) | Cloud-hosted version of TRAM for one-off TTP extraction |
| **Microsoft Threat Modeling Tool** | Free | [aka.ms/tmt](https://aka.ms/tmt) | Windows desktop; wizard-based STRIDE enumeration; useful as a checklist |
| **draw.io web** | Apache-2.0 | [diagrams.net](https://www.diagrams.net) | Web-based diagramming when desktop install is not available |
| **FIRST CTI SIG PIR templates** | Free reference | [first.org/global/sigs/cti](https://www.first.org/global/sigs/cti) | PIR writing format reference used by government and commercial CTI teams |

---

## 4. System Requirements

### Hardware

| Tier | RAM | CPU | Disk | What it supports |
|---|---|---|---|---|
| **Minimum** | 12 GB | 4 cores | 40 GB | Docker lab only (core services) |
| **Standard** | 16 GB | 6 cores | 80 GB | Docker lab + host analysis tools |
| **Recommended** | 32 GB | 8 cores | 150 GB | Full lab + CALDERA + VECTR + MISP + Timesketch concurrently |

> Elasticsearch heap is set to 2 GB by default. If RAM is limited, reduce other services:  
> TheHive/Cortex JVM: `-Xmx512m` each. OpenCTI: `NODE_OPTIONS=--max-old-space-size=4096`.

### Host Operating System

| OS | Support | Notes |
|---|---|---|
| **Ubuntu 22.04 / 24.04 LTS** | Full | Primary target; all scripts tested here |
| **Debian 12** | Full | Equivalent to Ubuntu; same package manager |
| **Other Linux (kernel 5+)** | Full | May need minor package name adjustments |
| **macOS 13+ (Intel)** | Partial | Docker Desktop required; lower performance for Elastic heap |
| **macOS 13+ (Apple Silicon)** | Partial | Docker Desktop required; some images lack ARM builds — use `--platform linux/amd64` |
| **Windows 11 + WSL2** | Partial | All Docker services work; Hayabusa/Chainsaw run in WSL2; Invoke-AtomicRedTeam needs native PowerShell |

### Software Prerequisites

| Software | Minimum version | Purpose | Install |
|---|---|---|---|
| **Docker Engine** | 24.0 | Container runtime | [docs.docker.com/engine/install](https://docs.docker.com/engine/install/) |
| **Docker Compose** | v2.20 | Service orchestration | Bundled with Docker Desktop; `apt install docker-compose-plugin` on Linux |
| **Git** | 2.40 | Clone repo; version control for runbooks | `apt install git` |
| **Python** | 3.10+ | DeTT&CT, pySigma, Plaso, SpiderFoot, CALDERA, PyTM | `apt install python3 python3-pip python3-venv` |
| **PowerShell** | 7.4+ | Invoke-AtomicRedTeam execution | [github.com/PowerShell/PowerShell](https://github.com/PowerShell/PowerShell/releases) |
| **Node.js** | 18 LTS | CALDERA web UI build | `apt install nodejs npm` or [nodejs.org](https://nodejs.org) |
| **Go** | 1.21+ | Building Hayabusa from source (pre-built binaries available; Go not required if using binaries) | [go.dev/dl](https://go.dev/dl/) |
| **Rust** | 1.75+ | Building Chainsaw from source (pre-built binaries available) | `curl https://sh.rustup.rs -sSf \| sh` |

> **Minimum viable setup** for the Docker lab only: Docker Engine 24+ and Docker Compose v2. Python and PowerShell are only needed for host analysis tools.

### Disk Space Breakdown

| Component | Approximate size |
|---|---|
| Docker images (all core services) | ~8 GB |
| Elasticsearch data (lab usage) | 5–20 GB depending on log volume |
| OpenCTI + MinIO objects | 2–5 GB |
| Host analysis tools (all combined) | ~3 GB |
| Training scenario data / reports | < 50 MB |
| **Total (standard usage)** | **~20–35 GB** |

---

## 5. Tool Coverage by Assignment

Use this matrix to know exactly which tools to have ready before starting a given assignment. **Lab stack tools** (Elastic, OpenCTI, TheHive, Cortex) are always required and not repeated in the table.

| Tool | A1 Reactive | A2 Proactive | A3 Full Cycle | A4 Emulation | A5 Gov Reactive | A6 Gov Proactive | A7 Gov Cycle | A8 Gov Emulation |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **ATT&CK Navigator** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Sigma / pySigma** | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | ✓ |
| **Uncoder.io** | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | ✓ |
| **DeTT&CT** | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Hayabusa** | ✓ | — | — | ✓ | ✓ | — | — | ✓ |
| **Chainsaw** | ✓ | — | — | ✓ | ✓ | — | — | ✓ |
| **Velociraptor** | ✓ | — | — | — | ✓ | — | — | — |
| **DFIR-IRIS** | ✓ | — | — | — | ✓ | ✓ | — | ✓ |
| **Timesketch** | ✓ | — | — | — | ✓ | — | — | — |
| **Plaso / log2timeline** | ✓ | — | — | — | ✓ | — | — | — |
| **Atomic Red Team** | — | — | — | ✓ | — | — | — | ✓ |
| **Invoke-AtomicRedTeam** | — | — | — | ✓ | — | — | — | ✓ |
| **MITRE CALDERA** | — | — | — | ✓ | — | — | — | ✓ |
| **VECTR** | — | ✓ | — | ✓ | — | ✓ | ✓ | ✓ |
| **TRAM** | ✓ | — | — | ✓ | ✓ | — | — | ✓ |
| **MISP** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Yeti** | — | ✓ | ✓ | — | — | ✓ | ✓ | — |
| **SpiderFoot** | — | — | ✓ | — | — | — | ✓ | — |
| **Maltego CE** | ✓ | — | — | ✓ | ✓ | — | — | — |
| **VirusTotal** | ✓ | ✓ | — | ✓ | ✓ | ✓ | — | — |
| **Shodan / Censys** | ✓ | — | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| **URLScan.io** | — | ✓ | — | — | — | ✓ | — | — |
| **OWASP Threat Dragon** | — | ✓ | — | — | — | ✓ | — | — |
| **PyTM** | — | ✓ | — | — | — | ✓ | — | — |
| **draw.io** | — | ✓ | ✓ | — | — | ✓ | ✓ | — |
| **Obsidian** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Joplin** | ✓ | — | — | — | ✓ | ✓ | — | ✓ |
| **LibreOffice** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Grafana** | — | — | ✓ | — | — | — | ✓ | — |
| **GitLab / GitHub** | — | ✓ | ✓ | ✓ | — | — | ✓ | ✓ |
| **n8n** | — | — | ✓ | — | — | — | ✓ | — |

**Minimum install for each track:**

- **Private sector track only (A1–A4):** ATT&CK Navigator + Sigma/pySigma + Hayabusa + Chainsaw + DeTT&CT + MISP + Obsidian + LibreOffice
- **Government track only (A5–A8):** Same as above + DFIR-IRIS + Atomic Red Team + Invoke-AtomicRedTeam + VECTR + Joplin
- **Full lab (all 8):** All tools in the matrix

---

## 6. Network Requirements

| Requirement | Details |
|---|---|
| Internet access | Required for initial Docker image pulls, threat feed connectors, and web tools (VirusTotal, Shodan, URLScan.io) |
| Ports (localhost) | 8080, 5601, 9100, 9002, 9001, 9200, 15672, 5672, 9000 — must be free on the host |
| Internal DNS | Docker internal DNS handles service-to-service communication on `cti-net` automatically |
| Air-gap operation | Possible after initial image pull; web tools (VirusTotal, Shodan) will not be available; ATT&CK Navigator can be self-hosted |
| Logstash Beats input | Port 5044 — expose to other hosts on the network if ingesting logs from remote endpoints |
