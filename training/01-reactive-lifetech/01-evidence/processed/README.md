# Processed Evidence

This directory holds normalized/processed versions of raw evidence artifacts.

**What goes here:**
- Timesketch timeline exports (CSV/JSON)
- Plaso/log2timeline processed super-timeline
- Velociraptor VQL query result exports
- Hayabusa processed event summaries

**Source material:** Raw artifacts are in `../raw/`

**Processing pipeline:** Raw JSONL logs → Plaso ingest → Timesketch upload → analyst annotation
