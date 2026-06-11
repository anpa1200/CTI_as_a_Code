---
id: prerequisites
title: Prerequisites
sidebar_position: 3
---

# Prerequisites

Requirements for running the [CTI as a Code lab](/CTI_as_a_Code/architecture) on a single Linux host. Once these are met, follow the [Quick Start](/CTI_as_a_Code/quick-start) to bring up all services.

## Host requirements

| Requirement | Minimum | Recommended |
|---|---|---|
| OS | Linux (kernel 5+) | Ubuntu 22.04 LTS / 24.04 LTS |
| RAM | 12 GB | 16–20 GB |
| CPU | 4 cores | 8 cores |
| Disk | 40 GB free | 100 GB SSD |

## Required software

### Docker Engine 24+

```bash
# Ubuntu
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
```

### [Docker Compose](https://docs.docker.com/compose/) v2 (plugin)

Comes bundled with Docker Desktop and recent Docker Engine packages. Verify:

```bash
docker compose version
# Docker Compose version v2.24.x
```

### git

```bash
sudo apt install -y git
```

## Kernel tuning (required for Elasticsearch)

Elasticsearch requires a raised `vm.max_map_count`. Apply it persistently:

```bash
# Apply immediately
sudo sysctl -w vm.max_map_count=262144

# Persist across reboots
echo 'vm.max_map_count=262144' | sudo tee -a /etc/sysctl.conf
```

You will see `max virtual memory areas vm.max_map_count [65530] is too low` errors in the Elasticsearch container if this is not set.

## Cortex: Docker socket access

Cortex launches analyzer images as Docker sibling containers and requires access to the Docker socket:

```bash
# Ensure your user is in the docker group
sudo usermod -aG docker $USER
newgrp docker
```

The `docker-compose.yml` mounts `/var/run/docker.sock` into the Cortex container.

## Ports

Ensure no existing services occupy the following host ports before starting:

```
8080, 9200, 9100, 9002, 9000, 9001, 5601, 15672, 5672, 5044, 9600
```

Check with:

```bash
ss -tlnp | grep -E '8080|9200|9100|9002|9000|9001|5601|15672|5672|5044|9600'
```


---

## Next steps

- **[Quick Start](/CTI_as_a_Code/quick-start)** — bring the lab up in 10 minutes
- **[Architecture](/CTI_as_a_Code/architecture)** — understand how services are wired together
- **[Ecosystem](/CTI_as_a_Code/ecosystem)** — see how this lab fits in the broader [CTI Portfolio](https://1200km.com/cti.html)
