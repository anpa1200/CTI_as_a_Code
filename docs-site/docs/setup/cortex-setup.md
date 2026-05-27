---
id: cortex-setup
title: Cortex Setup
sidebar_position: 4
---

# Cortex Setup and TheHive Integration

## Create Cortex admin

1. Open http://localhost:9002
2. Create an admin account on first visit
3. Log in

## Create an organisation

1. **Admin → Organizations → Add organization**
2. Name: `CTI-Lab` (match your TheHive org name)
3. Create an **analyst user** within the org

## Install analyzers

1. Switch to your organisation context
2. Go to **Organization → Analyzers → Refresh analyzers**
3. Cortex will fetch the latest Cortex-Analyzers catalog from GitHub

Recommended analyzers to enable for a CTI lab:

| Analyzer | What it does |
|---|---|
| `AbuseIPDB` | Check IP reputation |
| `Shodan_Host` | Shodan data for an IP |
| `VirusTotal_GetReport` | VT hash/URL/IP lookup |
| `MISP_2_1` | Search MISP for IOC matches |
| `DomainTools_Iris` | Domain WHOIS + DNS history |
| `Urlscan_io_Search` | urlscan.io scan results |
| `IPInfo_1_0` | IP geolocation + ASN |
| `MaxMind_GeoIP_2_0` | GeoIP (no API key required) |

For analyzers requiring API keys, click the analyzer → **Configuration** and enter the key.

## Generate Cortex API key

1. **Organization → Users → <your user> → Create API key**
2. Copy the key immediately — it won't be shown again

## Wire Cortex into TheHive

### Step 1: Add the key to `.env`

```bash
echo "CORTEX_API_KEY=<your-cortex-api-key>" >> .env
```

### Step 2: Enable the Cortex connector in TheHive config

Edit `config/thehive/application.conf`. Uncomment the Cortex block:

```hocon
play.modules.enabled += org.thp.thehive.connector.cortex.CortexConnector
cortex {
  servers: [
    {
      name: "cortex"
      url: "http://cortex:9001"
      auth {
        type: bearer
        key: ${?CORTEX_API_KEY}
      }
    }
  ]
}
```

### Step 3: Restart TheHive with the new env var

```bash
docker compose up -d thehive
```

### Step 4: Verify the connection in TheHive

**Organisation → Cortex servers** — the `cortex` server should show as **Connected**.

## Running an analyzer from TheHive

1. Open a case → Observables tab
2. Select an observable (IP, domain, hash)
3. Click **Actions → Analyze**
4. Select an analyzer and click **Run**
5. Results appear in the observable's **Analysis** tab within seconds
