# Discovery Patterns

This reference teaches the agent how to find API-related code in **any** project. Use these search patterns during Step 0 (Project Discovery) to build the Service Inventory.

Search broadly first, then narrow down. Not all patterns will match in every project — that's expected. The goal is to find what exists, not to require everything.

---

## 1. Finding OpenAPI Spec Files

### File name patterns
```
**/openapi*.json
**/openapi*.yaml
**/openapi*.yml
**/swagger*.json
**/swagger*.yaml
**/swagger*.yml
**/api-docs*.json
**/api-docs*.yaml
```

### Common locations
- `docs/`
- `docs/openapi/`
- `api/`
- `spec/`
- `specifications/`
- `swagger/`
- Project root

### Verification
After finding a candidate file, confirm it contains an `openapi` field at the root level whose value starts with `3.` (e.g. `3.0.0`, `3.0.3`, `3.1.0`). For Swagger 2.x files, the field is `swagger` with value `2.0`.

---

## 2. Detecting Spec Generation

Some projects auto-generate their OpenAPI spec from code annotations or route metadata. Detecting this is important because drift may mean "regenerate the spec" rather than "manually edit the spec".

### hapi-swagger (Hapi.js)
```
hapi-swagger
hapiSwagger
HapiSwagger
swaggerOptions
```

### swagger-jsdoc (Express/Koa)
```
swagger-jsdoc
swaggerJSDoc
swaggerDefinition
swaggerSpec
```

### @nestjs/swagger (NestJS)
```
@nestjs/swagger
SwaggerModule
DocumentBuilder
@ApiProperty
@ApiOperation
@ApiResponse
@ApiTags
```

### swagger-autogen
```
swagger-autogen
swaggerAutogen
```

### Generation scripts
Search for scripts in `package.json`, `Makefile`, or `scripts/` directory:
```
generateOpenApi
generate-openapi
swagger:generate
openapi:generate
build:docs
```

---

## 3. Finding HTTP Route Definitions

Search for import/require statements and route registration patterns for common HTTP frameworks.

### Hapi.js
```
server.route(
server.register(
plugin.register
server.route({
method:.*'GET'
method:.*'POST'
method:.*'PUT'
method:.*'PATCH'
method:.*'DELETE'
path:.*'/api/
options:.*validate
options:.*auth
```

### Express.js
```
express()
express.Router()
router.get(
router.post(
router.put(
router.patch(
router.delete(
app.get(
app.post(
app.put(
app.use(
```

### Fastify
```
fastify.get(
fastify.post(
fastify.put(
fastify.patch(
fastify.delete(
fastify.register(
fastify.route(
schema:.*body
schema:.*params
schema:.*querystring
schema:.*response
```

### Koa
```
koa-router
@koa/router
router.get(
router.post(
router.put(
router.patch(
router.delete(
router.routes()
```

### NestJS
```
@Controller(
@Get(
@Post(
@Put(
@Patch(
@Delete(
@Param(
@Query(
@Body(
@Headers(
```

### General route patterns (language-agnostic)
Search for function/method names containing:
```
route|router|controller|handler|endpoint|middleware
```

---

## 4. Finding Validation Schemas

### Joi (Node.js)
```
Joi.object(
Joi.string()
Joi.number()
Joi.boolean()
Joi.array()
Joi.alternatives()
.validate(
.validateAsync(
schema.validate
.required()
.valid(
.pattern(
```

### Zod (TypeScript/JavaScript)
```
z.object(
z.string()
z.number()
z.boolean()
z.array(
z.enum(
.parse(
.safeParse(
.parseAsync(
```

### Yup (JavaScript)
```
yup.object(
yup.string()
yup.number()
Yup.object(
Yup.string()
.validate(
.isValid(
```

### JSON Schema
```
"$schema"
"type": "object"
"properties"
"required"
ajv
jsonschema
json-schema
```

### class-validator (TypeScript)
```
@IsString()
@IsNumber()
@IsUUID()
@IsEmail()
@IsEnum(
@IsOptional()
@ValidateNested()
class-validator
```

### General validation patterns
Search for files or directories named:
```
**/schema*
**/schemas/**
**/validation/**
**/validators/**
**/dto/**
**/models/**
```

---

## 5. Finding Auth Configuration

### JWT / Bearer Token
```
@hapi/jwt
hapi-auth-jwt2
jsonwebtoken
jwt.verify
jwt.sign
passport-jwt
JwtStrategy
BearerStrategy
auth.strategy
auth.default
server.auth.strategy
server.auth.default
```

### Passport.js (Express)
```
passport
passport.authenticate
passport.use
LocalStrategy
JwtStrategy
OAuth2Strategy
```

### NestJS Guards
```
@UseGuards(
AuthGuard
JwtAuthGuard
RolesGuard
@Roles(
```

### Per-route auth overrides
```
auth: false
auth:.*false
{ auth: false }
options:.*auth
authenticate.*false
public.*true
@Public()
AllowAnonymous
```

### Security group / role patterns
```
allowedGroupIds
allowedRoles
requiredRoles
securityGroups
permissions
scopes
```

---

## 6. Finding Response Builders & Error Handlers

### Hapi.js responses
```
h.response(
.code(
Boom.
@hapi/boom
Boom.badRequest
Boom.unauthorized
Boom.forbidden
Boom.notFound
Boom.conflict
Boom.badImplementation
Boom.badGateway
Boom.gatewayTimeout
failAction
```

### Express responses
```
res.status(
res.json(
res.send(
res.sendStatus(
next(err)
next(new Error
```

### General error patterns
```
errorHandler
errorMiddleware
formatError
createError
HttpException
HttpError
BadRequestError
NotFoundError
UnauthorizedError
ForbiddenError
InternalServerError
```

### Response schema definitions
Search for files or directories named:
```
**/responses/**
**/errors/**
**/exceptions/**
```

---

## 7. Finding API Configuration

### Server URLs / Base paths
```
PORT
HOST
BASE_URL
BASE_PATH
API_PREFIX
server.info.uri
server.address
```

### CORS
```
cors
@hapi/cors
cors()
origin
Access-Control
```

### Content types
```
content-type
Content-Type
application/json
multipart/form-data
application/x-www-form-urlencoded
text/plain
produces
consumes
```

### API versioning
```
/api/v1
/api/v2
/v1/
/v2/
version
apiVersion
```

### Configuration files
Search for files named:
```
**/config/server*
**/config/api*
**/config/hapi*
**/config/express*
**/config/cors*
```

### Infrastructure references
Server definitions may also exist in:
```
**/compose*.yaml
**/compose*.yml
**/docker-compose*
**/terraform/**
**/cloudformation/**
**/serverless.yml
**/cdk/**
```

---

## 8. Finding Shared / Common Schemas

### Common schema patterns
Search for directories and files that define reusable request/response shapes:
```
**/schemas/common*
**/schemas/shared*
**/api/common/**
**/api/schemas/**
**/api/v*/schemas/**
```

### Error response schemas
```
badRequest
unauthorized
forbidden
notFound
conflict
unprocessableEntity
internalServerError
badGateway
gatewayTimeout
errorResponse
```

---

## Search Strategy

1. **Start broad**: Search for the most distinctive patterns first (e.g. `openapi`, framework imports, route registrations)
2. **Follow imports**: When you find a route file, trace its imports to find related schemas, handlers, and config
3. **Check test files**: Test mocks and fixtures often contain realistic request/response examples that reveal the actual shape of API payloads
4. **Check package.json/build files**: Dependencies list confirms which HTTP framework, validation library, and auth libraries are in use
5. **Don't assume directory structure**: Some projects use flat structures, others use deep nesting. Let the search results guide you
6. **Check for spec generation**: If the spec is auto-generated, the generation config and route annotations are more authoritative than the spec file itself
