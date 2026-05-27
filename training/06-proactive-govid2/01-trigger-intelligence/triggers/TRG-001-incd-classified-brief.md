# INCD Classified Threat Brief — Summary for CTI Use
### TLP: RED → This document is an UNCLASSIFIED SUMMARY prepared by Lt. Col. Friedman
### Original classification: Secret — not reproducible in this document
### Date: 2025-06-01 | Transmitted to: NDSA CISO Col. Nativ and CTI Lead Shai Rotenberg

---

> **HANDLING NOTE:** The underlying classified brief cannot be shared below Top Secret clearance.
> This summary was prepared by INCD Liaison Officer Lt. Col. (Res.) Oren Friedman to convey
> the actionable substance to NDSA's CTI program without exposing classified sources/methods.
> This summary is TLP:AMBER and may be shared with NDSA security staff at Confidential level.

---

## Summary of Classified Finding

INCD has obtained intelligence (source and method classified) indicating that an Iranian
state-directed collection program has **tasked collection against Israeli national
authentication infrastructure** as a priority intelligence requirement.

The tasking specifically identifies:
- **National digital identity systems** (authentication gateways for government services)
- **Biometric enrollment and verification databases**
- **Government employee credential stores used for inter-ministry authentication**

The intelligence is assessed with **high confidence** based on classified source reliability.
The collection program is active; the adversary is in a pre-operational reconnaissance phase.

---

## What INCD Can and Cannot Share

**Can share (unclassified):**
- The tasking objective described above
- The adversary's identified capability to conduct supply chain compromise operations against
  Israeli government IT contractors (assessed based on pattern of historical activity)
- The assessment that the adversary has accessed Israeli government contractor networks
  in the past 18 months (at least two contractors; specific names classified)
- INCD recommendation: Treat ALL contractor access to GovID 2.0 and VRID infrastructure
  as potentially compromised until proven otherwise

**Cannot share (classified):**
- Intelligence source and collection method
- Specific contractor names known to be compromised
- Specific targeting timeline or operational calendar
- Any details that could reveal INCD collection methods

---

## Recommended Actions (from INCD Liaison)

1. **Audit all contractor access** to GovID 2.0 staging and production environments immediately
2. **Revoke and reissue all contractor API keys and SSH keys** for GovID 2.0 and VRID
3. **Require MFA re-enrollment** for all contractor accounts in Contractor DMZ
4. **Deploy enhanced monitoring** on contractor access paths before proceeding with launch testing
5. **Brief BiometricTech IL Ltd. directly** — their engineers have privileged access; determine
   if any credential compromise has occurred

---

## CTI Lead Assessment Instructions

Friedman has communicated to CTI Lead Rotenberg:

> "Treat this as a confirmed threat, not a precautionary signal. We are telling you that
> someone with Iranian state tasking has identified your platform as a collection target.
> The question is not IF they will try to access GovID 2.0 — it is WHETHER they already have."

This brief should be treated as **Admiralty A/1** (completely reliable source; confirmed)
for the purposes of your intelligence synthesis, despite the source remaining classified.
