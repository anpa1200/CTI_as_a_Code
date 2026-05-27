# Trust Boundary Analysis

**Project:** [project.yml → project.id]  
**Classification:** [project.yml → classification]

---

## Network Zones

| Zone | Description | Trust Level | Connectivity |
|---|---|---|---|
| Internet | Public internet | Untrusted | Perimeter firewall |
| DMZ | Externally accessible services | Low | Restricted to specific ports |
| Corporate LAN | Internal employee network | Medium | Authenticated users |
| OT / Industrial | Operational technology / ICS | High isolation | Air-gapped or strict ACL |
| Privileged | Admin, domain controllers, key servers | High | MFA + PAM required |
| Cloud | SaaS / IaaS / PaaS | Varies | Federation / API |

---

## Trust Boundary Map

> Describe or diagram key trust crossings that are relevant to the threat scenarios.

```
[Internet] → [Perimeter FW] → [DMZ (VPN, web)] → [FW/ACL] → [Corporate LAN]
                                                              ↓
                                                      [Privileged Segment]
```

*Update with organization-specific network topology.*

---

## High-Risk Trust Crossings

| Crossing | From | To | Authentication | Monitoring | Risk |
|---|---|---|---|---|---|
| VPN entry | Internet | Corporate LAN | MFA? | Yes/No | High/Med |
| Service account access | Corporate LAN | Privileged | Password only? | Yes/No | High |
| API integration | External vendor | Internal API | Token? | Yes/No | |
| Remote desktop | DMZ | Internal | | | |

---

## Implicit Trusts to Investigate

> Implicit trusts are credentials, tokens, or paths that are trusted by convention but not enforced.  
> These are prime targets for lateral movement.

| System A | Trusts System B | Why | Reviewed? |
|---|---|---|---|
| | | Legacy integration | No |

---

## Attack Path Analysis

For each threat scenario (SCN-XXX), which trust boundaries must the attacker cross?

| Scenario | Trust Crossings Required | Weakest Link |
|---|---|---|
| SCN-001 | Internet → DMZ → Corporate LAN → Privileged | |
| SCN-002 | | |
