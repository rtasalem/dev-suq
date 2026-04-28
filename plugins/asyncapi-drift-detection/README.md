# asyncapi-drift-detection

An agent that compares AsyncAPI spec with service implementation to identify areas of drift, prioritises findings in order of highest severity, and proposes fixes to ensure proper alignment between the service and its documentation.

## What's included

| Component | Path | Description |
|-----------|------|-------------|
| Agent | `agents/asyncapi-drift-detector.agent.md` | Detects drift between AsyncAPI 3.x spec and service implementation across 6 dimensions (channels, operations, message schemas, event types, status values, data payloads), prioritises findings by severity (P0-P3), and proposes YAML fixes |
| Skill | `skills/asyncapi-drift-detection/` | Comprehensive 5-step procedure for discovering AsyncAPI specs, parsing specifications, analysing service implementation, comparing across all dimensions, and generating detailed drift reports with proposed fixes |

## How it works

### Agent: AsyncAPI drift detector

The agent:

1. Discovers AsyncAPI specification files in your project
2. Parses channels, operations, message schemas, and component definitions
3. Analyzes the service implementation to extract actual messaging patterns, event types, and data structures
4. Compares the spec against the implementation across 6 dimensions:
   - **Channels**: Declared vs. actual message channels
   - **Operations**: Declared vs. actual operations (publish/subscribe)
   - **Message Schemas**: Declared vs. actual message structures
   - **Event Types**: Declared vs. actual event type constants
   - **Status Values**: Declared vs. actual status enumerations
   - **Data Payloads**: Declared vs. actual field mappings and types
5. Prioritises findings by severity (P0-P3):
   - **P0 — Critical**: Contract-breaking differences (missing channels, wrong event types, missing required fields)
   - **P1 — High**: Schema-level inaccuracies (type mismatches, enum mismatches, protocol binding issues)
   - **P2 — Medium**: Correctness gaps (optional fields not in spec, default value mismatches)
   - **P3 — Low**: Documentation quality issues (missing descriptions, cosmetic naming)
6. Generates a structured drift report with findings grouped by priority
7. Proposes YAML fixes to bring the spec into alignment with the implementation

### Skill: AsyncAPI drift detection

The skill provides a comprehensive 5-step procedure:

1. **Project Discovery**: Locates AsyncAPI specs, discovers messaging code, identifies validation schemas
2. **Parse AsyncAPI Spec**: Extracts channels, operations, messages, and component schemas
3. **Analyse Service Implementation**: Discovers actual channels, operations, schemas, event types, and status values
4. **Compare & Detect Drift**: Checks all 6 dimensions using the priority framework
5. **Generate Drift Report**: Creates a detailed report with findings grouped by priority level and proposes fixes

Includes reference documentation:
- `discovery-patterns.md`: Search strategies for finding messaging infrastructure code
- `drift-categories.md`: Complete priority framework and decision matrix
- `report-template.md`: Structured drift report format

## Usage

Ask the agent to detect drift in your AsyncAPI specifications:

> "Check for drift between my AsyncAPI spec and service implementation"

> "Audit my AsyncAPI 3.x documentation against the actual service"

> "Review my event channels, messages, and schemas in AsyncAPI against the code"

The agent will:
1. Generate a comprehensive drift report
2. Prioritise findings by severity
3. Propose specific YAML changes to fix the drift
4. Apply fixes with your approval

## License

[MIT](../../LICENSE)

