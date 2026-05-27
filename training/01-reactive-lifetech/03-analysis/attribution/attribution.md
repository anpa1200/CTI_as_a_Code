# Threat Actor Assessment — PROJ-2024-001

**Classification:** TLP:AMBER  
**Confidence:** Medium (Admiralty B/3)

---

## Assessed Threat Actor

**Designation**: CLUSTER-2024-LTX (internal tracking)  
**Nexus**: Assessed Iranian-nexus (medium confidence)  
**Motivation**: Dual — IP theft (pharmaceutical R&D) + commercial disruption (US licensing deal)  
**Confidence in attribution**: Medium — Admiralty B/3

---

## Attribution Assessment

The observed tradecraft demonstrates medium-confidence overlap with publicly documented Iranian-nexus commercial espionage operations against Israeli pharma and technology companies. However, the infrastructure has no prior attribution in public reporting, and the tools used (mimikatz, robocopy) are not distinctive.

**Assessment**: State-affiliated or state-tasked actor with dual espionage and commercial disruption motivation, consistent with Iranian-nexus targeting patterns. Insufficient evidence for definitive attribution to a named group.

---

## Supporting Evidence

| Indicator | Weight | Source |
|---|---|---|
| AiTM phishing targeting Israeli pharma with US licensing partnerships | Medium | Consistent with ClearSky-documented Iranian-nexus campaigns 2023-2024 |
| Lookalike domain registered 5 days before use via privacy-protected registrar | Medium | Registration pattern documented in Iranian-nexus infrastructure analysis |
| Targeted R&D exfiltration (US partnership docs, 47 files) — strategic IP theft objective | Medium | Victim selection consistent with Iranian-nexus commercial espionage interest |
| Dual targeting logic (IP theft + disrupting $52M US deal) | Medium | Consistent with assessed Iranian-nexus interest in Israeli-US commercial partnerships |
| No confirmed tooling overlap with specific named groups | Negative | mimikatz/robocopy are common, non-distinctive |
| C2 infrastructure (198.51.100.44) has no prior attribution in public reporting | Negative | Cannot link to known actor's infrastructure |

---

## Against Attribution

- No Iranian-language artifacts or operational security failures
- No code-level overlap with attributed malware families
- mimikatz and robocopy usage is widespread — not actor-specific
- Single victim; no sector-wide pattern confirmed

---

## Alternative Explanations

| Alternative | Why Considered | Why Assessed as Less Likely |
|---|---|---|
| Financially motivated actor | IP theft can have financial motive | No ransomware deployment, no extortion; pure exfiltration suggests espionage |
| Insider threat | p.levi credentials used | VPN source from Istanbul residential VPN exit — not consistent with insider; AiTM evidence |
| Other nation-state | Chinese or Russian APTs also target pharma | Israeli-US pharma partnerships are specifically assessed as Iranian-nexus priority target |

---

## Confidence Statement

> Assessment is medium confidence (B/3). This confidence would increase materially if: malware code-sharing or infrastructure overlap with known campaigns is identified; additional victims in the same sector are identified using the same C2 infrastructure; or SIGINT or other classified intelligence confirms Iranian tasking.

Confidence would decrease if: infrastructure is subsequently attributed to financially motivated actor; code analysis reveals tooling inconsistent with Iranian-nexus tradecraft.

---

## Recommended Next Steps for Attribution

1. Submit 198.51.100.44 and `uslifepartner-group[.]com` to CERT-IL for cross-victim correlation
2. Share anonymized TTP profile with sector peers via ISAC for victimology correlation
3. Check MISP for infrastructure overlap with prior incidents
