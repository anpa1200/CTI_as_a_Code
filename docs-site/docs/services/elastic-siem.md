---
id: elastic-siem
title: Elastic SIEM
sidebar_position: 4
---

# Elastic SIEM

The SIEM layer consists of Elasticsearch (shared with the other services), Kibana, and optionally Logstash for log ingestion.

## Kibana

URL: http://localhost:5601  
User: `elastic` / `ELASTIC_PASSWORD`

Kibana's **Security** solution (SIEM) provides:
- Detection rules engine (Sigma-compatible via EQL / KQL)
- Alert triage and case management
- Timeline investigation
- Entity analytics (host, user risk scores)
- Threat intelligence indicator matching

### Setup: Security app

1. Navigate to **Security** in the Kibana side menu
2. On first access, Kibana prompts you to set up the Security solution — click **Get started**
3. Configure the default index patterns to include `cti-lab-logs-*`

### Detection rules

Import community detection rules:

```bash
# Elastic pre-built rules (built into Kibana)
# Security → Rules → Add Elastic rules
```

To import custom Sigma rules, use the `sigma-cli` tool with the Kibana backend:

```bash
pip install sigma-cli
sigma convert -t eql -p kibana your_rule.yml
```

## Logstash (optional)

Start Logstash with:

```bash
docker compose --profile logstash up -d
```

### Pipeline

Config: `config/logstash/pipeline/main.conf`

| Input | Protocol | Port |
|---|---|---|
| Filebeat / Winlogbeat | TCP (Beats) | 5044 |
| Syslog | UDP | 5140 |

Output index: `cti-lab-logs-YYYY.MM.dd`

### Connecting Filebeat

On a target endpoint, configure Filebeat to forward to the lab:

```yaml
# /etc/filebeat/filebeat.yml
output.logstash:
  hosts: ["<lab-host-ip>:5044"]
```

Or send directly to Elasticsearch (bypassing Logstash):

```yaml
output.elasticsearch:
  hosts: ["http://<lab-host-ip>:9200"]
  username: "elastic"
  password: "<ELASTIC_PASSWORD>"
  index: "cti-lab-logs-%{+yyyy.MM.dd}"
```

## Index Management

To avoid unbounded disk growth, create a basic ILM (Index Lifecycle Management) policy in Kibana:

**Stack Management → Index Lifecycle Policies → Create policy**

- Hot phase: 7 days or 10 GB
- Delete phase: 30 days

Attach to the `cti-lab-logs-*` pattern.
