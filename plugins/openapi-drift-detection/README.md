# openapi-drift-detection

An agent that compares OpenAPI spec with service implementation to identify areas of drift, prioritises findings in order of highest severity, and proposes fixes to ensure proper alignment between the service and its documentation.

## What's included

| Component | Path | Description |
|-----------|------|-------------|
| Agent | `agents/openapi-drift-detector.agent.md` | Detects drift between OpenAPI 3.x spec and service implementation across 7 dimensions (paths & operations, request schemas, response schemas, authentication & security, error responses, content types, API metadata), prioritises findings by severity (P0-P3), and proposes JSON/YAML fixes |
| Skill | `skills/openapi-drift-detection/` | Comprehensive 4-step procedure for discovering OpenAPI specs, parsing specifications, analysing service implementation, comparing across all dimensions, and generating detailed drift reports with proposed fixes |

## How it works

### Agent: OpenAPI drift detector

The agent:

1. Discovers OpenAPI specification files in your project
2. Parses paths, operations, parameters, request bodies, response schemas, security schemes, and servers
3. Analyzes the service implementation to extract actual routes, validation schemas, response shapes, auth configuration, and error handlers
4. Compares the spec against the implementation across 7 dimensions:
   - **Paths & Operations**: Declared vs. actual routes and HTTP methods
   - **Request Schemas**: Declared vs. actual parameters and request body validation
   - **Response Schemas**: Declared vs. actual response status codes and body shapes
   - **Authentication & Security**: Declared vs. actual auth strategies and per-route overrides
   - **Error Responses**: Declared vs. actual error status codes and shapes
   - **Content Types**: Declared vs. actual accepted and produced content types
   - **API Metadata**: Declared vs. actual server URLs, versioning, and info fields
5. Prioritises findings by severity (P0-P3):
   - **P0 — Critical**: Contract-breaking differences (missing routes, wrong methods, missing required fields)
   - **P1 — High**: Schema-level inaccuracies (type mismatches, enum mismatches, auth scheme issues)
   - **P2 — Medium**: Correctness gaps (optional fields not in spec, default value mismatches)
   - **P3 — Low**: Documentation quality issues (missing descriptions, cosmetic naming)
6. Generates a structured drift report with findings grouped by priority
7. Proposes JSON/YAML fixes to bring the spec into alignment with the implementation

### Skill: OpenAPI drift detection

The skill provides a comprehensive 4-step procedure:

1. **Project Discovery**: Locates OpenAPI specs, detects spec generation method, discovers API-related source code, builds a service inventory
2. **Parse OpenAPI Spec**: Extracts paths, operations, parameters, request bodies, responses, components, security schemes, and servers
3. **Analyse Service Implementation**: Discovers actual routes, request validation, response shapes, auth configuration, error handling, and content types
4. **Compare & Detect Drift**: Checks all 7 dimensions using the priority framework and generates a detailed drift report

Includes reference documentation:
- `discovery-patterns.md`: Search strategies for finding API infrastructure code
- `drift-categories.md`: Complete priority framework and decision matrix
- `report-template.md`: Structured drift report format

## Usage

Ask the agent to detect drift in your OpenAPI specifications:

> "Check for drift between my OpenAPI spec and service implementation"

> "Audit my OpenAPI 3.x documentation against the actual service"

> "Review my routes, schemas, and responses in OpenAPI against the code"

The agent will:
1. Generate a comprehensive drift report
2. Prioritise findings by severity
3. Propose specific JSON/YAML changes to fix the drift
4. Apply fixes with your approval

## License

[MIT](../../LICENSE)
