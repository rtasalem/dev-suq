# Drift Categories & Priority Framework

Use this framework to classify every difference found during drift detection. When in doubt, err on the side of higher priority — it's better to flag something as P1 that turns out to be P2 than to miss a breaking issue.

---

## P0 — Critical (resolve immediately)

Contract-breaking differences. API consumers relying on the spec will encounter unexpected behaviour at runtime.

| What to Check | Example Drift |
|---------------|---------------|
| **Missing route in spec** | Code registers `GET /api/v1/users/{id}` but the spec has no corresponding path+method entry |
| **Extra route in spec** | Spec documents `DELETE /api/v1/users/{id}` but the code has no such route |
| **Wrong HTTP method** | Spec says `POST /api/v1/search` but code registers `GET /api/v1/search` |
| **Missing required request field** | Code validates `sbi` as required in the request body but the spec does not include it, or marks it optional |
| **Extra required field in spec** | Spec marks `frn` as required in the request body but code treats it as optional or doesn't validate it |
| **Wrong path parameter name** | Spec says `{userId}` but code registers `{id}` for the same route |
| **Missing auth requirement in spec** | Code enforces JWT auth on a route but the spec shows no `security` requirement (consumers won't know to send a token) |
| **Auth shown but not enforced** | Spec shows `security: [bearerAuth: []]` but code sets `auth: false` on the route (consumers will send tokens unnecessarily, and unauthenticated access isn't documented) |
| **Wrong route path** | Spec documents `/api/v1/blob/{fileId}` but code registers `/api/v1/blobs/{fileId}` (or vice versa) |

---

## P1 — High (resolve before next release)

Schema-level inaccuracies. Integration will technically work but validation, typing, or assumptions may break for consumers generating clients from the spec.

| What to Check | Example Drift |
|---------------|---------------|
| **Type mismatch** | Spec says `type: string` but code validates/produces `type: number` (or vice versa) |
| **Format mismatch** | Spec says `format: uuid` but code doesn't validate UUID format (or opposite) |
| **Enum value mismatch** | Code allows status values `['pending', 'success', 'failure']` but spec lists `['pending', 'complete', 'failed']` |
| **Numeric range mismatch** | Spec says `minimum: 100` but code validates `min(50)` |
| **String constraint mismatch** | Spec says `pattern: "^[a-z]+$"` but code uses a different regex |
| **Required vs optional mismatch** | Spec marks a field as required but code treats it as optional (or vice versa) — where this doesn't rise to P0 because the field IS present in both |
| **Missing response status code** | Code returns 422 for validation errors but spec only documents 400 |
| **Extra response status code in spec** | Spec documents 409 Conflict but the code never returns that status |
| **Wrong security scheme type** | Spec says `type: apiKey` but implementation uses bearer JWT |
| **Missing status values in enum** | Code defines status constants `SENT`, `PENDING`, `FAILED` but spec enum only lists `SENT` and `PENDING` |
| **Response body shape mismatch** | Spec says response has `{ data: { url: string } }` but code returns `{ url: string }` (missing wrapper) |
| **Content type mismatch** | Spec says `application/json` for request body but code also accepts `multipart/form-data` |

---

## P2 — Medium (resolve when convenient)

Correctness gaps unlikely to cause runtime failures, but reduce documentation reliability.

| What to Check | Example Drift |
|---------------|---------------|
| **Optional field not in spec** | Code conditionally includes a field in the response that the spec doesn't document |
| **Default value mismatch** | Code defaults `pageSize` to `20` but spec says default is `10` (or spec has no default) |
| **Missing examples** | Spec provides no `example` for a field that has non-obvious format (e.g. CRN, SBI, correlation ID) |
| **Constraint looseness** | Spec says `maxLength: 100` but code allows 200 (not breaking but misleading) |
| **Extra optional field in spec** | Spec documents an optional field the code no longer returns or validates |
| **Stale response description** | The spec description for a response doesn't reflect current behaviour |
| **Missing query parameter** | Code accepts an optional query parameter the spec doesn't document |
| **Error body shape incomplete** | Spec documents 400 status but the error response body schema is missing or generic |
| **Validation error format undocumented** | Code returns structured Joi/Zod validation errors but spec just says "Bad Request" |

---

## P3 — Low (nice to have)

Documentation quality. No functional impact but improves developer experience.

| What to Check | Example Drift |
|---------------|---------------|
| **Missing descriptions** | A path, operation, parameter, or schema field has no `description` |
| **Cosmetic naming** | Spec uses `uploadId` but code constant is `UPLOAD_ID` (functional match, style mismatch in descriptions) |
| **Missing spec metadata** | `info.version` hasn't been bumped despite changes, or `info.description` is stale |
| **Missing server definitions** | The spec doesn't define server objects for all deployment environments |
| **Missing tags** | Operations have no tags for grouping/discoverability |
| **Schema documentation gaps** | A reusable component schema has no description of its purpose |
| **Missing contact/license info** | `info.contact` or `info.license` fields are absent or stale |
| **Deprecated routes not marked** | Code comments or documentation indicate a route is deprecated but spec doesn't have `deprecated: true` |
| **Missing operationId** | Operations lack `operationId`, making client SDK generation less ergonomic |
| **Tag descriptions missing** | Tags are used but have no descriptions in the `tags` array at the spec root |

---

## Decision Matrix

When a difference could be classified at multiple levels, use this to decide:

| Question | If Yes → |
|----------|----------|
| Would a consumer's HTTP client fail, get the wrong data, or hit an undocumented endpoint? | **P0** |
| Would a consumer's generated SDK or validation logic reject valid requests or accept invalid ones? | **P1** |
| Would a consumer be surprised but not broken? | **P2** |
| Is it purely about documentation polish? | **P3** |
