# Drift Report Template

Use this template verbatim when generating the drift report. Replace placeholders (`{...}`) with actual values. Omit priority sections that have zero findings.

---

````markdown
# OpenAPI Contract Drift Report

**Spec**: `{spec_file_path}` (OpenAPI {openapi_version}, info.version: {info_version})
**Service**: {service_name}
**Date**: {date}
**Overall Status**: {status_indicator}

> {status_indicator} is one of:
> - 🟢 **No drift** — spec and implementation are aligned
> - 🟡 **Minor drift** — only P2/P3 findings (no breaking contract issues)
> - 🔴 **Significant drift** — P0 or P1 findings present (contract is inaccurate)

{auto_generated_note}

---

## Summary

| Metric | Count |
|--------|-------|
| Total differences | {total} |
| P0 Critical | {p0_count} |
| P1 High | {p1_count} |
| P2 Medium | {p2_count} |
| P3 Low | {p3_count} |

| | Spec | Implementation |
|--|------|----------------|
| Paths | {spec_paths} | {impl_paths} |
| Operations (path + method) | {spec_operations} | {impl_operations} |
| Component schemas | {spec_schemas} | {impl_schemas} |
| Security schemes | {spec_security_schemes} | {impl_security_schemes} |
| Server definitions | {spec_servers} | {impl_servers} |

---

## Findings

### P0 — Critical (resolve immediately)

These indicate the spec is materially wrong — consumers relying on this documentation will encounter unexpected behaviour.

| # | Category | Spec Says | Service Does | Source File | Impact |
|---|----------|-----------|--------------|-------------|--------|
| {n} | {category} | {spec_value} | {impl_value} | `{file_path}` | {impact_description} |

### P1 — High (resolve before next release)

These indicate schema-level inaccuracies that could cause validation or integration issues for consumers generating clients from the spec.

| # | Category | Spec Says | Service Does | Source File | Impact |
|---|----------|-----------|--------------|-------------|--------|
| {n} | {category} | {spec_value} | {impl_value} | `{file_path}` | {impact_description} |

### P2 — Medium (resolve when convenient)

These are correctness gaps that are unlikely to cause runtime failures but reduce documentation quality.

| # | Category | Spec Says | Service Does | Source File | Impact |
|---|----------|-----------|--------------|-------------|--------|
| {n} | {category} | {spec_value} | {impl_value} | `{file_path}` | {impact_description} |

### P3 — Low (nice to have)

Documentation quality improvements.

| # | Category | Spec Says | Service Does | Source File | Impact |
|---|----------|-----------|--------------|-------------|--------|
| {n} | {category} | {spec_value} | {impl_value} | `{file_path}` | {impact_description} |

---

## Proposed Fixes

For each finding above, a specific change to apply to the OpenAPI spec:

### Fix #{n}: {short_title}

- **File**: `{spec_file_path}`
- **Path**: `{json_or_yaml_path}` (e.g. `paths./api/v1/status/{correlationId}.get.responses.422`)
- **Action**: {Add | Modify | Remove}
- **Change**: {precise description of what to add, modify, or remove}
- **Priority**: {P0 | P1 | P2 | P3}

---

## Verification Checklist

After applying fixes, verify:

- [ ] All routes registered in code have matching spec path + method entries
- [ ] All spec path + method entries have corresponding code routes
- [ ] All path parameter names match between spec and code
- [ ] All request validation schema fields match spec parameters and request body schemas (names, types, formats, required, enums, constraints)
- [ ] All response status codes in code are documented in the spec
- [ ] All response body shapes match spec response schemas per status code
- [ ] Global auth strategy is reflected in spec security requirement
- [ ] Per-route auth overrides (auth: false) are reflected as `security: []` in spec
- [ ] Security scheme type and configuration match implementation
- [ ] All error status codes and error body shapes are documented
- [ ] Request and response content types match between spec and code
- [ ] Server URLs match deployment environments
- [ ] API version, tags, and metadata are current
- [ ] No spec path, operation, or schema exists without a corresponding implementation
- [ ] No implementation route, schema, or auth config exists without spec documentation
````

---

## Formatting Rules

- **Omit empty sections**: If a priority level has zero findings, omit that entire section (don't show an empty table)
- **Source File links**: Use workspace-relative paths (e.g. `src/api/v1/callback/schema.js`)
- **Category values**: Use one of: `Path`, `Request Schema`, `Response Schema`, `Authentication`, `Error Response`, `Content Type`, `Metadata`
- **Impact descriptions**: One sentence explaining the consumer-facing consequence (e.g. "Consumers generating SDKs will have a missing endpoint in their client")
- **Path notation**: Use dot notation for JSON paths from the spec root (e.g. `paths./api/v1/blob/{fileId}.get.responses.200.content.application/json.schema`)
- **Fix numbering**: Must match the finding number for traceability
- **Auto-generated note**: If the spec is auto-generated, include: `> ⚠️ This spec appears to be auto-generated via {tool}. Consider running \`{command}\` to regenerate instead of manually editing.` — otherwise omit the `{auto_generated_note}` line entirely
