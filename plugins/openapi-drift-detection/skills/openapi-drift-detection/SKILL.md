---
name: openapi-drift-detection
description: "Detect drift between an OpenAPI 3.x spec and the service implementation. Use when: checking OpenAPI drift, auditing REST API documentation, validating request response schemas, comparing spec vs code, reviewing contract accuracy, onboarding documentation review, verifying routes operations parameters and status codes match implementation."
---

# OpenAPI Contract Drift Detection

Detect discrepancies between an OpenAPI 3.x specification and the actual HTTP API implementation. This skill is framework-agnostic and works by dynamically discovering the spec and API code in any project.

## When to Use

- Before a release, to verify API documentation accuracy
- When onboarding new developers or API consumers
- After iterating on a service to check if the spec needs updating
- During code review of route, schema, or auth changes
- When a consumer reports unexpected request/response shapes
- After adding or removing API endpoints

## Procedure

Follow these steps in order. Each step must complete before moving to the next.

### Step 0 — Project Discovery

This step builds a map of the project so the rest of the analysis is grounded in real files.

1. **Find the OpenAPI spec(s)**:
   - Search the workspace for files matching: `**/openapi*.json`, `**/openapi*.yaml`, `**/openapi*.yml`, `**/swagger*.json`, `**/swagger*.yaml`, `**/swagger*.yml`
   - Also check common locations: `docs/`, `api/`, `spec/`, `specifications/`, project root
   - If multiple specs are found, ask the user which to analyse — or analyse all if instructed
   - Confirm the spec uses OpenAPI version 3.x (check the `openapi` field at the root starts with `3.`)

2. **Read the project's copilot-instructions.md** (if it exists at `.github/copilot-instructions.md` or root):
   - Extract: framework, language, directory structure conventions, API technology, key service names
   - This accelerates discovery by telling you where to look

3. **Detect spec generation method**:
   - Search for hapi-swagger, swagger-jsdoc, @nestjs/swagger, swagger-autogen, or similar spec-generation dependencies in `package.json`, `build.gradle`, `pom.xml`, `requirements.txt`, or equivalent
   - If found, note the generation method — drift may indicate the spec needs regeneration rather than manual editing
   - Search for spec generation scripts (e.g. `generate-openapi`, `generateOpenApiSpec`, `swagger:generate`)

4. **Discover API-related source code** using the patterns in [discovery-patterns.md](./references/discovery-patterns.md):
   - **Route definitions**: Framework router files, route registrations, controller decorators
   - **Validation schemas**: Joi, Zod, Yup, JSON Schema, class-validator, or similar
   - **Auth configuration**: Auth plugins, middleware, strategies, security schemes
   - **Response builders**: Functions that construct HTTP responses, error formatters
   - **API configuration**: Server URLs, CORS config, rate limiting, content type settings

5. **Build a Service Inventory** — a mental model of:
   - Which routes (path + HTTP method) the service exposes
   - What request validation each route applies (params, query, body, headers)
   - What response shapes each route returns (per status code)
   - What authentication/authorization strategy is applied (global default and per-route overrides)
   - What error response shapes the service produces
   - What content types are accepted and produced

### Step 1 — Parse the OpenAPI Spec

Read the discovered OpenAPI spec file and extract:

1. **Paths**: For each path + HTTP method combination, note:
   - Path string (e.g. `/api/v1/users/{id}`)
   - HTTP method (GET, POST, PUT, PATCH, DELETE)
   - `operationId` if present
   - Tags
   - `deprecated` flag
   - `security` overrides (if different from global)

2. **Parameters**: For each operation, note:
   - Path parameters: name, schema (type, format, pattern, enum), required
   - Query parameters: name, schema, required, default value
   - Header parameters: name, schema, required
   - Cookie parameters: name, schema

3. **Request Bodies**: For each operation with a request body, note:
   - Required flag
   - Content type(s) (e.g. `application/json`, `multipart/form-data`)
   - Schema: all fields, types, formats, required list, enums, min/max constraints, patterns, defaults, nested objects, arrays

4. **Responses**: For each operation, note every response status code:
   - Status code (200, 201, 400, 401, 404, 500, etc.)
   - Description
   - Content type(s)
   - Response body schema: all fields, types, formats, required list, enums, nesting
   - Response headers

5. **Components**: For each reusable component, note:
   - `schemas`: name, type, properties, required, constraints
   - `securitySchemes`: name, type (http/apiKey/oauth2/openIdConnect), scheme, bearerFormat, flows
   - `parameters`: reusable parameter definitions
   - `responses`: reusable response definitions

6. **Security** (global):
   - Default security requirement(s) applied to all operations
   - Which security scheme(s) are referenced

7. **Servers**:
   - Each server URL and description
   - Server variables if any

8. **Info metadata**:
   - `title`, `version`, `description`, `contact`, `license`

### Step 2 — Analyse the Service Implementation

Using the Service Inventory from Step 0, read each discovered source file and extract the **actual** implementation details:

1. **Routes (actual)**:
   - Read framework router/controller files to extract every registered route
   - For each route, note: HTTP method, path, handler function, any route-level options
   - Map framework-specific path syntax to OpenAPI syntax:
     - Hapi.js: `{param}` → `{param}` (same)
     - Express: `:param` → `{param}`
     - Fastify: `:param` → `{param}`
     - NestJS: `:param` → `{param}` (decorators)

2. **Request Validation (actual)**:
   - Read validation schema definitions (Joi objects, Zod schemas, JSON Schema files, class-validator decorators, etc.)
   - Extract: field names, types, required vs optional, format validations (UUID, email, date-time), enums (.valid()/.enum()), numeric ranges (.min()/.max()), string constraints (.pattern()/.regex()), defaults
   - Map framework-specific constraints to their JSON Schema / OpenAPI equivalents:
     - `Joi.string().uuid()` → `{ type: "string", format: "uuid" }`
     - `Joi.number().integer()` → `{ type: "integer" }`
     - `Joi.number().min(X).max(Y)` → `{ type: "number", minimum: X, maximum: Y }`
     - `Joi.string().valid('a', 'b')` → `{ type: "string", enum: ["a", "b"] }`
     - `Joi.string().pattern(/regex/)` → `{ type: "string", pattern: "regex" }`
     - `Joi.object().keys({...})` → `{ type: "object", properties: {...} }`
     - `Joi.array().items(...)` → `{ type: "array", items: {...} }`
     - `Joi.alternatives().try(...)` → `{ oneOf: [...] }`
     - `.required()` → field in `required` array
     - `.optional()` → field NOT in `required` array
     - `.default(val)` → `{ default: val }`
     - `.description(text)` → `{ description: text }`
     - `.min(n)` on string → `{ minLength: n }`
     - `.max(n)` on string → `{ maxLength: n }`
     - `.min(n)` on array → `{ minItems: n }`
     - `.max(n)` on array → `{ maxItems: n }`
     - `z.string().uuid()` → `{ type: "string", format: "uuid" }`
     - `z.enum(['a', 'b'])` → `{ type: "string", enum: ["a", "b"] }`
     - `z.number().int().min(X).max(Y)` → `{ type: "integer", minimum: X, maximum: Y }`
   - Separately identify: path param schemas, query param schemas, request body schemas, header schemas

3. **Response Shapes (actual)**:
   - Read response schema definitions and handler return statements
   - For each route, extract every status code returned and the response body shape
   - Pay attention to:
     - Success responses (200, 201, 204)
     - Error responses (400, 401, 403, 404, 422, 500, 502, 504)
     - Response wrappers (e.g. `{ data: {...} }`, `{ message: "..." }`)
     - Hapi.js: `h.response(payload).code(statusCode)` patterns
     - Express: `res.status(code).json(payload)` patterns

4. **Authentication & Authorization (actual)**:
   - Identify the global auth strategy (e.g. `server.auth.default('strategyName')`)
   - Identify per-route auth overrides (e.g. `options: { auth: false }` in Hapi, `passport.authenticate()` in Express)
   - Identify the auth mechanism: JWT, API key, OAuth2, session-based
   - Note which routes are unauthenticated and why

5. **Error Handling (actual)**:
   - Read error handler middleware, Boom error usage, or custom error formatters
   - Extract the shape of error responses (field names, structure)
   - Note which error status codes each route can produce

6. **Content Types (actual)**:
   - Check what content types routes accept (JSON, form-data, etc.)
   - Check what content types routes produce
   - Look at framework defaults and per-route overrides

### Step 3 — Compare and Detect Drift

Compare the spec (Step 1) against the implementation (Step 2) across these 7 dimensions. For each difference found, classify it using the priority framework in [drift-categories.md](./references/drift-categories.md).

#### Dimension 1: Paths & Operations
- Does every route registered in the code have a matching path + method entry in the spec?
- Does every path + method in the spec have a corresponding route in the code?
- Do path parameter names match between spec and code?
- Are HTTP methods correct?
- Are deprecated flags accurate?

#### Dimension 2: Request Schemas
- For each operation, compare every request parameter and body field against the validation schema:
  - **Path parameters**: name, type, format, required, pattern, enum values
  - **Query parameters**: name, type, format, required, default values
  - **Request body fields**: field names, types, required vs optional, format constraints, enum values, numeric ranges, string constraints, nested structure
  - **Headers**: declared vs actual

#### Dimension 3: Response Schemas
- For each operation, compare every response status code and body shape:
  - **Status codes**: Does the spec document every status code the handler can return? Does the spec list status codes the handler never returns?
  - **Response body shape**: Do field names, types, and nesting match per status code?
  - **Response headers**: Are response headers documented correctly?

#### Dimension 4: Authentication & Security
- Does the spec's global `security` requirement match the implementation's default auth strategy?
- For routes with `auth: false` (or equivalent), does the spec show `security: []` to indicate no auth?
- Does the security scheme type (bearer, apiKey, oauth2) match the implementation?
- Are scope/role requirements reflected accurately?

#### Dimension 5: Error Responses
- Are all error status codes that the implementation can produce documented in the spec (400, 401, 403, 404, 422, 500, 502, 504)?
- Do error body shapes in the spec match the actual error response format?
- Is the validation error format (e.g. Joi validation errors, Boom errors) documented?

#### Dimension 6: Content Types
- Do request content types in the spec (`requestBody.content` keys) match what the implementation accepts?
- Do response content types in the spec (`responses.*.content` keys) match what the implementation produces?
- Are content negotiation behaviours (Accept header handling, multiple content types) reflected?

#### Dimension 7: API Metadata
- Do server URLs in the spec match actual deployment environments?
- Does `info.version` match the application version?
- Do tags in the spec match actual route groupings/categories?
- Are deprecated routes correctly marked with `deprecated: true`?
- Are `info.description`, `info.contact`, and `info.license` current and accurate?

### Step 4 — Generate the Drift Report

Use the template in [report-template.md](./references/report-template.md) to produce the report.

- Fill in all metadata (spec file path, version, service name, date)
- Set the overall status indicator:
  - 🟢 **No drift** — zero findings
  - 🟡 **Minor drift** — only P2/P3 findings
  - 🔴 **Significant drift** — any P0 or P1 findings
- List findings in priority order (P0 first), with specific source file references
- Explain each finding
- Generate proposed fixes for every finding
- If the spec is auto-generated, add a note recommending regeneration and list which findings would be resolved by regeneration vs which require source code changes
- Build the verification checklist based on what was actually analysed

### Step 5 — Offer Fixes

After presenting the report:

1. Ask the user if they want to apply the proposed fixes to the OpenAPI spec
2. If yes, apply fixes **one at a time** in priority order (P0 first)
3. After each fix, briefly confirm what was changed
4. After all fixes are applied, offer to re-run the comparison to verify zero remaining drift
5. If the spec is auto-generated, recommend running the generation command instead of manual edits where appropriate

**Remember**: Only edit the OpenAPI spec file(s). Never edit application source code.
