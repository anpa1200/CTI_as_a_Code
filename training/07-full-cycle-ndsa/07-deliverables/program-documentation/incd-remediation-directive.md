# INCD Remediation Directive RD-2025-NDSA-004

**Issuing Authority:** Israel National Cyber Directorate (INCD)  
**Issued:** 2025-10-01 (3 months post-GovID 2.0 launch, 7 months post-breach)  
**Recipient:** National Digital Services Authority (NDSA)  
**Classification:** CONFIDENTIAL — for NDSA leadership and CISO only  
**Compliance Deadline:** 2026-07-01 (9 months from issuance)

---

## Background

This remediation directive is issued pursuant to INCD's oversight authority under the
Critical Infrastructure Cybersecurity Directive (INCD-CID) following the confirmed
security incident at NDSA in March 2025 (Incident Reference: INC-2025-NDSA-0314).

The March 2025 incident investigation identified the following root causes that this
directive requires NDSA to remediate:

1. **Absence of a formalized threat intelligence function** — NDSA had no capability to
   receive, analyze, or act on intelligence about threats to its systems prior to the incident.
   The CERT-IL bulletin CB-2025-041 was published but not actioned by NDSA. Had NDSA had
   a functioning CTI program, the contractor account anomaly from March 10 might have been
   analyzed and the incident prevented.

2. **No intelligence sharing obligations** — NDSA had no formal intelligence sharing
   agreement with CERT-IL or any peer government agency, limiting collective defense capability.

3. **Detection program not intelligence-driven** — The GOV-DET-001 rule had a known high
   FP rate that led to active suppression of alerts; no CTI input had been applied to improve
   the rule's signal-to-noise ratio.

---

## Required Remediation Actions

### RD-1: Establish Formal CTI Program (Deadline: 2026-01-31)

NDSA shall establish a formalized CTI program under a dedicated CTI Lead with:
- Minimum staffing: 1 CTI Lead + 1 Senior Analyst
- Formal PIR framework developed with at least 5 named stakeholders
- PIR review cycle defined (minimum: quarterly)
- Collection plan documenting internal and external collection sources
- Intelligence production cadence: minimum quarterly strategic product + monthly tactical product

### RD-2: CERT-IL Sharing Agreement (Deadline: 2026-03-01)

NDSA shall enter into a formal Memorandum of Understanding (MOU) with CERT-IL for:
- Bidirectional threat intelligence sharing (NDSA shares indicators AND receives sector intelligence)
- TLP:AMBER distribution rights for NDSA security staff
- NDSA incident data to be contributed to CERT-IL sector database within 30 days of incident closure

### RD-3: Peer Agency Sharing (Deadline: 2026-06-01)

NDSA shall establish at minimum 2 peer agency sharing agreements with Israeli government
agencies operating digital infrastructure. Priority candidates:
- Ministry of Interior (NDSA authenticates citizens on MoI's behalf)
- Israel Tax Authority (ITA) (same contractor — HavayaIT — creates shared supply chain risk)

### RD-4: Detection-CTI Integration (Deadline: 2026-04-01)

NDSA shall integrate CTI output into the detection engineering sprint process:
- Each CTI product must include a "Detection Requirements" section
- Detection Engineering must acknowledge and respond to CTI detection requirements within 2 sprints
- Quarterly detection coverage review against current threat actor TTPs

### RD-5: Annual Compliance Report to INCD (Recurring)

NDSA shall submit an annual CTI program effectiveness report to INCD demonstrating:
- PIR fulfillment rate
- Intelligence product production against plan
- Detection improvements driven by CTI
- Sharing agreement activity (indicators shared/received)

---

## Non-Compliance Consequences

Failure to meet the deadlines in this directive may result in:
- INCD escalation to Ministry of Digital Transformation for ministerial action
- Mandatory third-party assessment of NDSA's security posture at NDSA's expense
- Public disclosure of non-compliance in INCD's annual national cyber report
- Restriction on NDSA's authority to operate GovID 2.0 in its current form

---

*This directive is issued under INCD-CID Section 12 (Remediation Authority).*  
*INCD liaison for questions: Lt. Col. (Res.) Oren Friedman, Friedman.O@incd.gov.il (fictional)*
