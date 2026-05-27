# CTI as a Code

A full Linux Cyber Threat Intelligence lab and structured CTI methodology framework, running on Docker Compose.

**CTI as Code**: Version-controlled, IDE-based CTI investigations — evidence-traced claims, template-driven projects, reproducible analysis, deployable detections.

**Stack:** OpenCTI · TheHive 5 · Cortex · Elastic SIEM (ES + Kibana) · Logstash

**Documentation site:** https://anpa1200.github.io/cti-lab/

---

## Services

| Service | URL | Default User |
|---|---|---|
| OpenCTI | http://localhost:8080 | `admin@cti-lab.local` |
| Kibana (SIEM) | http://localhost:5601 | `elastic` |
| TheHive | http://localhost:9100 | (set on first login) |
| Cortex | http://localhost:9002 | (set on first login) |
| MinIO Console | http://localhost:9001 | `cti_minio` |
| RabbitMQ Mgmt | http://localhost:15672 | `cti_rabbit` |
| Elasticsearch | http://localhost:9200 | `elastic` |

---

## Quick Start

**Requirements:** Docker Engine 24+, Docker Compose v2.x, 16 GB RAM (12 GB minimum)

```bash
git clone https://github.com/anpa1200/CTI_as_a_Code.git
cd CTI_as_a_Code

# 1. Configure credentials
cp .env.example .env
nano .env   # change ALL passwords and generate UUIDs/secrets (see comments in file)

# 2. Start core services
docker compose up -d

# 3. One-time setup (sets Kibana password, creates MinIO buckets)
./scripts/setup.sh

# 4. (Optional) Start MITRE ATT&CK connector
docker compose --profile connectors up -d

# 5. (Optional) Start Logstash log ingestion
docker compose --profile logstash up -d
```

---

## System Requirements

| Component | Minimum | Recommended |
|---|---|---|
| RAM | 12 GB | 16–20 GB |
| CPU | 4 cores | 8 cores |
| Disk | 40 GB | 100 GB |
| OS | Linux (kernel 5+) | Ubuntu 22.04 / 24.04 |

> Elasticsearch heap is set to 2 GB by default (`ES_JAVA_OPTS=-Xms2g -Xmx2g`).
> Adjust in `docker-compose.yml` to match your host.

**Full tools reference and system requirements:** See [TOOLS.md](TOOLS.md) for the complete list of lab stack services, host-installed analysis tools, browser-only web tools, three-tier hardware requirements, software prerequisites, per-assignment tool coverage matrix, and network requirements.

---

## Training Assignments

Eight structured assignments covering the full CTI analyst skill set:

| # | Assignment | Organization | Methodology | Template |
|---|---|---|---|---|
| A01 | Reactive IR — Targeted intrusion, R&D data theft | LifeTech Pharma | Reactive DFIR + ATT&CK | `templates/reactive/` |
| A02 | Proactive — Nation-state telecom targeting | CelltronX Telecom | Proactive threat-led detection | `templates/proactive/` |
| A03 | Full-cycle CTI — Program design from scratch | TechPay FinTech | Full intelligence cycle | `templates/full-cycle/` |
| A04 | Adversary emulation — Desert Cipher TTPs | TechPay FinTech | Emulation + detection validation | (emulation structure) |
| A05 | Reactive IR — Contractor breach, biometric data | NDSA Government | Reactive DFIR + regulatory compliance | `templates/reactive/` |
| A06 | Proactive — Pre-launch national auth system | NDSA GovID 2.0 | Proactive + INCD launch risk | `templates/proactive/` |
| A07 | Full-cycle CTI — Regulatory mandate, post-breach | NDSA Government | Full intelligence cycle | `templates/full-cycle/` |
| A08 | Adversary emulation — INCD Section 8 compliance | NDSA Government | Emulation + compliance reporting | (emulation structure) |

Assignments are in [`training/`](training/). Project templates are in [`templates/`](templates/).  
Each case folder follows its methodology template structure and contains `project.yml`, analytical files, synthetic data artifacts, and `solution.md`.

---

## Directory Structure

```
CTI_as_a_Code/
├── docker-compose.yml       # All services
├── .env.example             # Credential template
├── TOOLS.md                 # Complete tools reference and system requirements
├── config/                  # Service configuration files
├── scripts/                 # setup.sh, health-check.sh, reset.sh
├── templates/               # CTI as Code blank project scaffolds
│   ├── reactive/            # Reactive investigation template (A01, A05)
│   ├── proactive/           # Proactive threat assessment template (A02, A06)
│   └── full-cycle/          # Full-cycle CTI program template (A03, A07)
├── training/                # 8 CTI analyst assignments
│   ├── 01-reactive-lifetech/    # project.yml + template structure + synthetic data
│   ├── 02-proactive-celltronx/  # project.yml + template structure + synthetic data
│   ├── 03-full-cycle-techpay/   # project.yml + template structure + synthetic data
│   ├── 04-emulation-techpay/    # project.yml + Sigma rules + emulation results
│   ├── 05-reactive-ndsa/        # project.yml + template structure + synthetic data
│   ├── 06-proactive-govid2/     # project.yml + template structure + synthetic data
│   ├── 07-full-cycle-ndsa/      # project.yml + template structure + synthetic data
│   └── 08-emulation-ndsa/       # project.yml + Sigma rules + emulation results
└── docs-site/               # Docusaurus documentation
```

---

## Scripts

```bash
./scripts/setup.sh          # Run once after first docker compose up -d
./scripts/health-check.sh   # Check HTTP status of every service
./scripts/reset.sh          # !! Wipe all data and volumes !!
```

---

## Profiles

| Profile | Services added |
|---|---|
| *(none)* | ES, Kibana, Redis, RabbitMQ, MinIO, OpenCTI, TheHive, Cortex |
| `connectors` | MITRE ATT&CK connector for OpenCTI |
| `logstash` | Logstash (Beats input on :5044) |

---

## Cortex → TheHive Integration

After first Cortex login:
1. Go to **Cortex** → Organization → Create API key
2. Add `CORTEX_API_KEY=<key>` to `.env`
3. Uncomment the Cortex connector block in `config/thehive/application.conf`
4. Restart TheHive: `docker compose restart thehive`

Full guide: [docs-site/docs/setup/cortex-setup.md](docs-site/docs/setup/cortex-setup.md)

---

## License

MIT
