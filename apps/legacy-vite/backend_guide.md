Γ¼í

__THE BACKEND__

__ENGINEERING GUIDE__

*For AI Systems Building Production\-Grade Server\-Side Software*

__A complete mandatory reference covering security, API design,__

database engineering, scalability, observability,

error handling, testing and production operations\.

# __PART 0 ΓÇö WHY AI FAILS AT BACKEND ENGINEERING__

Before rules, understand root causes\. AI generates backend code by predicting tokens based on training patterns\. Backend engineering requires deep reasoning about concurrency, failure modes, security threat models, data consistency guarantees, and operational concerns ΓÇö none of which produce visible output that could appear in training screenshots or demos\.

### __The 8 Structural Root Causes__

__1\. Security is invisible in demos  __Security code ΓÇö input validation, parameterized queries, auth checks ΓÇö produces no visible output when it works correctly\. AI training examples optimize for demonstrated functionality, not for invisible safety controls that prevent things from happening\.

__2\. Happy path dominates training data  __Code examples on the internet overwhelmingly demonstrate the success path\. Error handling, transaction rollbacks, retry logic, and circuit breakers are rarely shown in tutorials\. AI learns to skip them\.

__3\. Concurrency is untestable by inspection  __Race conditions, deadlocks, and connection exhaustion only manifest under concurrent load\. AI has no mechanism to reason about what happens when 1000 requests arrive simultaneously\. It writes code that works for 1 user\.

__4\. Performance problems are invisible until production  __A query that takes 50ms on a 100\-row table takes 50 seconds on 10 million rows\. AI does not model data growth\. It does not add indexes, pagination, or caching because the 'test' always succeeds\.

__5\. Operational concerns are out of scope in training  __Logging, health checks, graceful shutdown, feature flags, and config management are not part of 'writing a feature'\. They are added by experienced engineers who have been paged at 3am\. AI has not been paged at 3am\.

__6\. Distributed systems failure modes are abstract  __Partial failures, network timeouts, idempotency, and eventual consistency are genuinely hard concepts\. AI produces code that assumes everything succeeds ΓÇö no timeouts, no retries, no compensation logic\.

__7\. Data integrity requires explicit design  __Transactions, foreign keys, unique constraints, and soft deletes must be explicitly architected\. AI writes the minimum that makes the feature work ΓÇö without the data integrity guardrails that prevent silent corruption\.

__8\. Testing is often omitted entirely  __Tests produce no user\-visible output\. They are the most underrepresented artifact in public code examples\. AI will skip them unless explicitly required, and when it does write them, it tests only the happy path\.

# __PART 1 ΓÇö THE 12 GOLDEN RULES__

These rules govern every line of backend code generated\. They directly counteract the 8 structural failure modes above\. There are no exceptions\.

__1\.  __NEVER interpolate user input into SQL strings\. Use parameterized queries or a safe ORM exclusively\.

__2\.  __NEVER store secrets in source code or committed config files\. All secrets come from environment variables or a secrets manager\.

__3\.  __NEVER skip input validation\. Every endpoint that accepts external data must validate schema, type, range, and format before any business logic runs\.

__4\.  __NEVER execute multi\-step database writes outside a transaction\. If any step fails, all steps must roll back atomically\.

__5\.  __NEVER make an outbound network call without a timeout\. Every HTTP call, database query, and external service call must have an explicit timeout\.

__6\.  __ALWAYS implement pagination on every endpoint that returns a list\. Unbounded queries are a production outage waiting to happen\.

__7\.  __ALWAYS write structured logs with correlation IDs, severity levels, and enough context to diagnose production issues without a debugger\.

__8\.  __ALWAYS implement health check endpoints\. Every service must expose /health \(liveness\) and /ready \(readiness\) with meaningful status\.

__9\.  __ALWAYS handle errors explicitly at every layer\. Never swallow exceptions\. Never return 200 for an error\. Never expose stack traces to clients\.

__10\.  __ALWAYS design for idempotency on mutation endpoints\. Retried requests must not create duplicate state\.

__11\.  __ALWAYS configure connection pools for every persistent connection \(database, Redis, external APIs\)\. Default settings are for development only\.

__12\.  __ALWAYS write tests alongside the code ΓÇö not after\. Minimum: one test per endpoint covering the success path, one covering the primary failure path\.

__RULE__

__1__

__SECURITY ENGINEERING__

Security is not a feature to add later\. It is the structural baseline\. Every line of code that touches external input is a potential attack surface\.

### __Input Validation ΓÇö Non\-Negotiable__

Every endpoint that accepts data from any external source must validate it before any processing\. This is the first line of defense against injection, overflow, and logic attacks\.

__Γ¢ö The Validation Stack ΓÇö Always Required__

// REQUIRED VALIDATION STACK ΓÇö run in this order on every incoming request:

// 1\. Schema validation \(Zod/Joi/Yup\) ΓÇö type, shape, required fields

// 2\. Semantic validation ΓÇö business rules \(age > 0, email format, enum values\)

// 3\. Authorization ΓÇö does this user have permission to perform this action on this resource?

// 4\. Idempotency check ΓÇö has this exact request already been processed?

// NEVER pass req\.body directly to a database query, ORM create\(\), or any function\.

// ALWAYS destructure and validate only the fields you expect\.

// NEVER trust: query params, path params, headers, body, cookies ΓÇö ALL are attacker\-controlled\.

### __SQL Injection ΓÇö The Most Critical Prohibition__

__Γ¥î Never do this__

ΓÇó // WRONG ΓÇö SQL injection vector:

ΓÇó db\.query\(\`SELECT \* FROM users WHERE email = '$\{email\}'\`\)

ΓÇó 

ΓÇó // WRONG ΓÇö ORM with raw interpolation:

ΓÇó User\.findAll\(\{ where: \`email = '$\{email\}'\` \}\)

ΓÇó 

ΓÇó Never: string template literals in queries

ΓÇó Never: string concatenation in queries

ΓÇó Never: user input in ORDER BY clauses without allowlist

__Γ£à Always do this__

ΓÇó // CORRECT ΓÇö Parameterized query:

ΓÇó db\.query\('SELECT \* FROM users WHERE email = $1', \[email\]\)

ΓÇó 

ΓÇó // CORRECT ΓÇö ORM safe syntax:

ΓÇó User\.findAll\(\{ where: \{ email: email \} \}\)

ΓÇó 

ΓÇó Always: ORM with proper escaping

ΓÇó Always: Allowlist for dynamic column names

ΓÇó Always: Stored procedures for complex queries

### __Authentication & Authorization Framework__

- Authentication \(who are you?\) must be checked before authorization \(what can you do?\)\.
- Use short\-lived JWT access tokens \(15ΓÇô60 minutes\)\. Use refresh tokens for session continuity\.
- Never store passwords in plaintext\. Use bcrypt/argon2 with cost factor ΓëÑ 12\.
- Every protected endpoint must verify the token AND check that the user owns the requested resource\.
- Implement role\-based access control \(RBAC\) ΓÇö never check permissions inline with if/else chains\.
- Rate limit authentication endpoints aggressively: max 5 attempts per minute per IP\.
- Invalidate all sessions on password change\. Implement token revocation list for logout\.

### __Security Headers & CORS__

__Γ¢ö Security Headers ΓÇö Required on Every Response__

NEVER: Access\-Control\-Allow\-Origin: \* on authenticated APIs\.

ALWAYS: Explicit CORS allowlist of known origins only\.

REQUIRED headers on every response:

  X\-Content\-Type\-Options: nosniff

  X\-Frame\-Options: DENY

  Strict\-Transport\-Security: max\-age=31536000; includeSubDomains

  Content\-Security\-Policy: \(defined per application\)

NEVER expose stack traces, internal paths, or dependency versions in error responses\.

Error responses return generic messages to clients\. Full details go to server logs only\.

### __Secrets Management__

- Secrets NEVER appear in source code, config files committed to version control, or log output\.
- Use environment variables for local development\. Use a secrets manager \(AWS Secrets Manager, HashiCorp Vault, Doppler\) for production\.
- Rotate secrets regularly\. Automate rotation where possible\.
- Audit log every access to production secrets\.
- Different secrets for every environment: development, staging, production are completely separate\.

__RULE__

__2__

__API DESIGN STANDARDS__

An API is a contract with consumers\. Bad contracts are impossible to fix without breaking changes\. Design deliberately from the start\.

### __HTTP Semantics ΓÇö Use Them Correctly__

__Method__

__Semantic meaning__

__Idempotent?__

__Has body?__

__Success status__

GET

Retrieve resource\(s\)\. No side effects\.

Yes

No

200 OK

POST

Create resource or trigger action\.

No

Yes

201 Created

PUT

Replace entire resource\.

Yes

Yes

200 OK

PATCH

Partial update of resource\.

No

Yes

200 OK

DELETE

Remove resource\.

Yes

No

204 No Content

### __HTTP Status Codes ΓÇö Use the Right One__

__Code__

__Meaning__

__When to use__

__AI commonly misuses as__

__200__

OK

Success with response body

Everything, including errors

__201__

Created

Resource successfully created

200 for POST responses

__204__

No Content

Success with no body \(DELETE\)

200 with empty body

__400__

Bad Request

Invalid input from client

500 for validation failures

__401__

Unauthorized

Not authenticated

403, or 200 with error message

__403__

Forbidden

Authenticated but not authorized

401 or 404

__404__

Not Found

Resource does not exist

200 with null body

__409__

Conflict

Duplicate / constraint violation

500 or 400

__422__

Unprocessable Entity

Schema valid but semantically wrong

400

__429__

Too Many Requests

Rate limit exceeded

403 or 500

__500__

Internal Server Error

Unexpected server failure

All errors

__503__

Service Unavailable

Downstream dependency failure

500

### __Consistent Error Response Contract__

Every error from every endpoint in every service must return exactly the same shape:

__≡ƒôï Mandatory Error Response Shape__

// REQUIRED error response envelope ΓÇö use this shape everywhere, no exceptions:

\{

  "error": \{

    "code":    "VALIDATION\_ERROR",        // machine\-readable, stable identifier

    "message": "Email is not a valid email address\.", // human\-readable, safe for users

    "details": \[                           // optional: per\-field errors for validation

      \{ "field": "email", "message": "Must be a valid email" \}

    \],

    "requestId": "req\_01HX3K\.\.\.",         // correlation ID ΓÇö ties to server logs

    "timestamp": "2024\-01\-15T10:30:00Z"

  \}

\}

// NEVER: \{ success: false, msg: 'oops' \}

// NEVER: \{ error: 'Something went wrong' \}  \(no context, no correlation ID\)

// NEVER: return the actual exception message to clients \(leaks internal detail\)

### __API Versioning ΓÇö From Day One__

- Version every public API from the first endpoint: /api/v1/users not /api/users\.
- Never remove or change the shape of an existing versioned endpoint ΓÇö create a new version\.
- Version in the URL path \(/v1/, /v2/\) ΓÇö not in headers or query params \(harder to test, cache, debug\)\.
- Maintain at least one previous major version for 6 months after a new version ships\.

### __Pagination ΓÇö Always Required on Lists__

__ΓÜá∩╕Å Offset pagination \(limited use\)__

ΓÇó Offset pagination: LIMIT 20 OFFSET 100

ΓÇó Breaks on concurrent inserts \(rows shift\)

ΓÇó Gets slow for large offsets \(full scan to offset\)

ΓÇó Cannot detect 'new items since last page'

ΓÇó Use only for admin UIs where exact page numbers matter

__Γ£à Cursor pagination \(preferred\)__

ΓÇó Cursor pagination: WHERE id > last\_seen\_id LIMIT 20

ΓÇó Stable across concurrent writes

ΓÇó O\(1\) complexity regardless of position

ΓÇó Works perfectly with real\-time data

ΓÇó Use for all production user\-facing APIs

### __Idempotency ΓÇö Required for All Mutations__

Idempotency means: calling the same endpoint with the same intent multiple times produces the same result as calling it once\. This is critical for network retry safety\.

- Require an Idempotency\-Key header on all POST endpoints that create resources\.
- Store idempotency keys with their responses for 24 hours\.
- Return the cached response for duplicate requests ΓÇö do NOT execute the operation again\.
- Idempotency key must be client\-generated \(UUID v4\) ΓÇö not server\-generated\.
- Document idempotency behavior in the API contract \(OpenAPI spec\)\.

__RULE__

__3__

__DATABASE ENGINEERING__

The database is the only true source of truth in most systems\. Inconsistency in the database is the hardest class of bug to fix in production\.

### __Transactions ΓÇö When to Use Them__

__Γ¢ö Transaction Rule ΓÇö Non\-Negotiable__

RULE: Any operation that modifies more than one row, or more than one table, MUST be wrapped in a transaction\.

// REQUIRED transaction pattern:

await db\.transaction\(async \(trx\) => \{

  const order = await Order\.create\(\{ userId, total \}, \{ transaction: trx \}\);

  await Inventory\.decrement\(\{ id: itemId \}, \{ transaction: trx \}\);

  await Payment\.create\(\{ orderId: order\.id, amount: total \}, \{ transaction: trx \}\);

  // If ANY of these throws, ALL changes are rolled back automatically\.

\}\);

// NEVER: three separate awaits with no transaction wrapping them\.

// If the second or third call fails, you have partial state in your database forever\.

### __Database Schema Design Standards__

- Every table must have a primary key\. Use UUIDs \(uuid\_generate\_v4\(\)\) for distributed systems, auto\-increment for internal\-only tables\.
- Use created\_at and updated\_at timestamps on every table ΓÇö set via database defaults, not application code\.
- Implement soft deletes with a deleted\_at column rather than hard DELETE for any business\-critical data\.
- Add foreign key constraints for every relationship\. Never rely on application code to maintain referential integrity\.
- Use NOT NULL constraints on every required column\. Null in relational databases means 'unknown' ΓÇö be explicit\.
- Add unique constraints at the database level for business\-unique fields \(email, username, order number\)\.

### __Indexing Strategy__

__Index type__

__When to use__

__Cost__

__AI commonly misses__

B\-tree \(default\)

Equality and range queries on high\-cardinality columns

Low write overhead

Indexes on FK columns \(JOIN performance\)

Composite index

Queries that filter on multiple columns together

Medium write overhead

Column order matters: most selective first

Partial index

Queries on a subset of rows \(WHERE deleted\_at IS NULL\)

Very low overhead

Huge win for soft\-delete filtered queries

GIN/GiST

Full\-text search, JSON fields, array containment

High write overhead

Any LIKE '%term%' query needs full\-text index

- Add an index on every foreign key column ΓÇö joins without indexes do full table scans\.
- Add an index on every column used in WHERE, ORDER BY, or GROUP BY in frequent queries\.
- Use EXPLAIN ANALYZE on every query that runs more than once\. Never guess ΓÇö measure\.
- Monitor slow query logs in production\. Any query > 100ms is a target for optimization\.

### __The N\+1 Problem ΓÇö Always Prevent It__

__Γ¢ö N\+1 Pattern ΓÇö Never Generate This__

// WRONG ΓÇö N\+1 query: 1 query for orders \+ N queries for each user \(one per order\):

const orders = await Order\.findAll\(\);

for \(const order of orders\) \{

  order\.user = await User\.findByPk\(order\.userId\); // N additional queries\!

\}

// CORRECT ΓÇö Single query with JOIN/eager loading:

const orders = await Order\.findAll\(\{ include: \[\{ model: User \}\] \}\);

// For REST APIs: use DataLoader pattern to batch N requests into 1\.

// For GraphQL: DataLoader is mandatory ΓÇö never resolve fields without it\.

// Rule: if you fetch a list and then loop to fetch related data, you have N\+1\.

### __Migration Standards__

- Every schema change must be a migration file, never a manual ALTER TABLE in production\.
- Migrations must be idempotent ΓÇö safe to run multiple times without error\.
- Every migration must have a corresponding rollback \(down migration\)\.
- Test rollback migrations as rigorously as forward migrations\.
- Never modify a migration that has already been applied to production ΓÇö create a new one\.
- Large data migrations must be batched ΓÇö never UPDATE all rows in a single transaction \(table locks\)\.
- Add new nullable columns before backfilling, before adding NOT NULL constraints ΓÇö never in one step\.

__RULE__

__4__

__ERROR HANDLING ARCHITECTURE__

Errors are not exceptional\. They are a predictable part of every production system\. Design for them as carefully as for the happy path\.

### __The Error Handling Hierarchy__

Every error in a backend system falls into one of these categories\. Handle each category differently:

__Error class__

__Examples__

__Client response__

__Internal action__

Validation error

Invalid email, missing field

400 with field details

Log at INFO level\. No alert\.

Authentication error

Invalid token, expired session

401

Log at INFO with IP\. Rate limit trigger\.

Authorization error

Accessing another user's resource

403

Log at WARN with user ID\. Audit trail\.

Not found

Resource ID does not exist

404

Log at DEBUG\. No alert\.

Conflict

Duplicate email, optimistic lock failure

409

Log at INFO\. No alert\.

Rate limit exceeded

Too many requests

429 with Retry\-After

Log at WARN\. Monitor for abuse\.

Dependency failure

DB timeout, external API down

503 with retry hint

Log at ERROR\. Page on\-call\.

Unexpected error

Bug, unhandled exception

500 generic message

Log at CRITICAL with full stack\. Page immediately\.

### __Global Error Handler ΓÇö Mandatory Pattern__

__≡ƒôï Global Error Handler Pattern__

// REQUIRED: Every application must have a single global error handler as the last middleware\.

// This handler catches any unhandled error and formats it consistently\.

app\.use\(\(err, req, res, next\) => \{

  const requestId = req\.headers\['x\-request\-id'\] || generateId\(\);

  const status = err\.status || err\.statusCode || 500;

  const isOperational = err\.isOperational === true;

  // Log everything ΓÇö different level based on severity

  logger\.log\(status >= 500 ? 'error' : 'warn', \{

    requestId, status, message: err\.message,

    stack: status >= 500 ? err\.stack : undefined,

    userId: req\.user?\.id, path: req\.path, method: req\.method

  \}\);

  // NEVER send stack traces or internal details to clients

  res\.status\(status\)\.json\(\{

    error: \{

      code:      isOperational ? err\.code : 'INTERNAL\_ERROR',

      message:   isOperational ? err\.message : 'An unexpected error occurred\.',

      requestId,

    \}

  \}\);

\}\);

### __Never Swallow Errors__

__Γ¥î Error swallowing patterns__

ΓÇó try \{ await doSomething\(\); \} catch \(e\) \{\}

ΓÇó try \{ \.\.\. \} catch \(e\) \{ console\.log\(e\); \}

ΓÇó if \(result\) \{ \.\.\. \} // ignoring null case

ΓÇó \.catch\(\(\) => \{\}\) on promises

ΓÇó Silently returning null on failure

__Γ£à Correct error propagation__

ΓÇó Rethrow if you cannot handle: throw e;

ΓÇó Log with structured logger \+ context

ΓÇó Handle every branch explicitly

ΓÇó \.catch\(err => \{ logger\.error\(err\); throw err; \}\)

ΓÇó Return explicit error type or throw

__RULE__

__5__

__SCALABILITY & PERFORMANCE__

Code that works for 10 users and code that works for 100,000 users are not the same code\. Design with scale in mind from the first endpoint\.

### __Async I/O ΓÇö Always, Never Block the Event Loop__

- Never use synchronous file system operations \(fs\.readFileSync, fs\.writeFileSync\) in request handlers\.
- Never use synchronous cryptographic operations \(crypto\.pbkdf2Sync\) in request handlers\.
- CPU\-bound operations \(image processing, PDF generation, large computations\) must run in worker threads, not the main event loop\.
- All database queries and external API calls must be awaited with async/await ΓÇö never use callbacks\.
- Use streaming for large responses ΓÇö never load a 1GB file into memory to send it\.

### __Caching Strategy__

__Cache layer__

__What to cache__

__TTL guidance__

__Invalidation strategy__

CDN / Edge

Static assets, public API responses

Hours to days

Cache\-Control headers \+ versioned URLs

Application

Expensive computations, feature flags, config

Minutes to hours

TTL\-based expiry \+ event\-based invalidation

Redis

Session data, rate limit counters, hot DB data

Seconds to hours

Explicit delete on write \+ TTL fallback

DB query cache

Repeated identical queries with stable results

Seconds to mins

NEVER cache mutable business data here

__≡ƒôï Caching Rules__

CACHE INVALIDATION RULE: Cache only data you can afford to be stale for the TTL duration\.

Never cache: user\-specific data that changes on every request, financial balances, inventory counts\.

Always cache: public content, computed aggregates, external API responses, configuration\.

Cache\-aside pattern: check cache ΓåÆ on miss, fetch from DB ΓåÆ write to cache ΓåÆ return\.

Write\-through: on every DB write, also update or invalidate the corresponding cache key\.

### __Connection Pooling ΓÇö Required for All Persistent Connections__

- Database: set pool min=2, max=10 per instance \(scale with load\)\. Default settings exhaust connections under load\.
- Redis: use a connection pool, not a new connection per request\.
- HTTP clients: use keep\-alive and connection pooling \(axios create, node\-fetch with agent\)\.
- Monitor pool utilization\. If max connections is frequently hit, you need to scale the pool or the DB\.

### __Background Jobs ΓÇö Required for Heavy Operations__

- Any operation that takes > 200ms must NOT block the HTTP response ΓÇö move it to a background queue\.
- Examples of mandatory background work: email sending, PDF generation, image processing, data exports, webhook delivery\.
- Use a proper job queue \(BullMQ, Sidekiq, Celery\)\. Never use setTimeout or setInterval for business jobs\.
- Every job must be idempotent ΓÇö it must be safe to retry if it fails or times out\.
- Implement dead\-letter queues for jobs that fail after maximum retries\.
- Monitor job queue depth and failure rate\. Alert when queue depth exceeds threshold\.

### __Circuit Breakers ΓÇö Required for Every External Dependency__

__≡ƒôï Circuit Breaker Pattern ΓÇö Required__

Every call to an external service must be wrapped in a circuit breaker\.

Without a circuit breaker: one slow or down dependency cascades to take down your entire service\.

Circuit breaker states:

  CLOSED: Requests pass through normally\. Failure count tracked\.

  OPEN:   Too many failures\. Requests immediately return error \(no actual call made\)\. Fast failure\.

  HALF\-OPEN: After timeout, one test request is allowed\. If it succeeds, transition to CLOSED\.

Thresholds: open after 5 failures in 10 seconds\. Stay open for 30 seconds\. Test with 1 request\.

Use: opossum \(Node\.js\), resilience4j \(Java\), polly \(\.NET\), tenacity \(Python\)\.

__RULE__

__6__

__OBSERVABILITY ΓÇö THE THREE PILLARS__

A system you cannot observe is a system you cannot operate\. Logging, metrics, and tracing are not optional add\-ons\. They are production requirements\.

### __Structured Logging ΓÇö Replace All console\.log__

__Γ¥î Unstructured \(AI default\)__

ΓÇó console\.log\('User logged in:', userId\)

ΓÇó console\.error\('Error:', error\.message\)

ΓÇó console\.log\('Request took', Date\.now\(\)\-start, 'ms'\)

ΓÇó Unstructured string messages

ΓÇó No request correlation

ΓÇó No severity levels

ΓÇó No queryable fields

__Γ£à Structured logging \(required\)__

ΓÇó logger\.info\(\{ event:'user\.login', userId, ip \}\)

ΓÇó logger\.error\(\{ event:'auth\.fail', error, stack \}\)

ΓÇó logger\.info\(\{ event:'req\.complete', ms: duration, path \}\)

ΓÇó JSON structured objects always

ΓÇó requestId on every log entry

ΓÇó Levels: debug/info/warn/error/fatal

ΓÇó Every log is searchable in production

### __Mandatory Log Fields__

__Field__

__Type__

__Required?__

__Purpose__

timestamp

ISO 8601 string

Always

Time\-series correlation and ordering

level

enum

Always

Severity filtering \(debug/info/warn/error\)

message

string

Always

Human\-readable event description

requestId

UUID

On HTTP events

Tie all logs from one request together

userId

string/UUID

When available

Audit trail and user\-specific debugging

service

string

Always

Identify which service generated the log

environment

string

Always

dev/staging/prod ΓÇö filter noise in dev

duration

number \(ms\)

On timed ops

Performance monitoring and SLA tracking

error\.stack

string

On errors only

Full stack trace for debugging

### __Metrics ΓÇö The Three Categories__

- RED metrics \(per service\): Rate \(requests per second\), Errors \(error rate %\), Duration \(latency p50/p95/p99\)\.
- USE metrics \(per resource\): Utilization, Saturation, Errors for CPU, memory, DB connections, queue depth\.
- Business metrics: core KPIs tracked as metrics ΓÇö orders created, payments processed, active users\.

__≡ƒôè Minimum Metrics ΓÇö Required__

MINIMUM METRICS ΓÇö instrument every service with these from day one:

  http\_requests\_total \(counter, labels: method, route, status\_code\)

  http\_request\_duration\_seconds \(histogram, labels: method, route\)

  db\_query\_duration\_seconds \(histogram, labels: operation, table\)

  queue\_depth \(gauge, labels: queue\_name\)

  active\_connections \(gauge, labels: pool\_name\)

  error\_total \(counter, labels: error\_code, service\)

Expose these on a /metrics endpoint in Prometheus format\.

Alert on: error rate > 1%, p99 latency > 1s, queue depth > 1000\.

### __Distributed Tracing__

- Every incoming request must have a unique trace ID \(X\-Request\-ID header\)\. Generate one if absent\.
- Pass the trace ID through every downstream call: to other services, to the database, to queues\.
- Log the trace ID on every log entry within a request's lifecycle\.
- Use OpenTelemetry SDK ΓÇö it is vendor\-neutral and works with Jaeger, Zipkin, Datadog, Honeycomb\.
- Instrument: HTTP calls between services, DB queries, cache calls, queue publish/consume\.

### __Health Check Endpoints ΓÇö Mandatory__

__≡ƒôï Health Check Endpoints ΓÇö Always Required__

// REQUIRED: Every service must expose two health endpoints:

// 1\. Liveness: GET /health ΓÇö Is the process alive and able to handle requests?

// Returns 200 if the process is running\. 500 if it should be restarted\.

// Kubernetes uses this for liveness probes\.

// 2\. Readiness: GET /ready ΓÇö Is the service ready to serve traffic?

// Checks: DB connection, Redis connection, critical config loaded\.

// Returns 200 if all checks pass\. 503 if any dependency is unavailable\.

// Kubernetes uses this for readiness probes \(remove from load balancer if 503\)\.

// 3\. Optional deep health: GET /health/deep ΓÇö Full dependency status

// Returns JSON object with status of each dependency: \{ db: 'ok', redis: 'ok', queue: 'degraded' \}

__RULE__

__7__

__BACKEND TESTING STRATEGY__

An untested backend is not production\-ready\. Tests are not optional\. They are the only way to make safe changes at speed\.

### __The Backend Testing Pyramid__

__Layer__

__What to test__

__Tooling__

__Coverage target__

Unit tests

Pure functions, business logic, transformers, validators

Jest/Vitest/pytest

All business logic functions\. 100% branch coverage\.

Integration tests

API endpoints end\-to\-end with real DB \(test database\)

Supertest \+ test DB

All endpoints: success path \+ primary failure paths\.

Contract tests

API response shape matches documented contract

Pact / OpenAPI validators

Every endpoint response validated against OpenAPI spec\.

Security tests

Auth, authz, injection, rate limiting

OWASP ZAP, custom tests

All auth boundaries\. At least one injection test per endpoint\.

Performance tests

Latency and throughput under load

k6, Artillery, Locust

Critical paths at 10x expected peak load\.

Chaos tests

Behavior when dependencies fail, time out, return errors

Custom fault injection

All external dependencies: DB down, Redis down, timeout\.

### __Integration Test Requirements__

Every API endpoint must have integration tests covering the following scenarios:

- Happy path: valid input, authenticated, authorized ΓåÆ expected 2xx response with correct body shape\.
- Invalid input: missing required fields ΓåÆ 400 with field\-level error details\.
- Unauthenticated request: no token ΓåÆ 401\.
- Unauthorized request: valid token but wrong user/role ΓåÆ 403\.
- Resource not found: valid ID that does not exist ΓåÆ 404\.
- Duplicate resource: creating entity that violates unique constraint ΓåÆ 409\.
- Database/dependency failure: simulate DB timeout ΓåÆ 503 with retry hint\.

__Γ¢ö Database Testing Rule__

TESTING DATABASE RULE:

Integration tests must run against a real database ΓÇö not mocks\.

Use a separate test database\. Reset it between test suites \(transactions or truncate\)\.

Never mock the database in integration tests ΓÇö you will miss query bugs, index issues, and constraint violations\.

Use fixtures/factories for test data ΓÇö never hardcode IDs or assume existing state\.

__RULE__

__8__

__PRODUCTION OPERATIONS__

Code that cannot be safely deployed, monitored, scaled, and rolled back is not production code\.

### __Graceful Shutdown ΓÇö Required__

__≡ƒôï Graceful Shutdown ΓÇö Always Required__

// REQUIRED: Every server must handle SIGTERM and SIGINT for graceful shutdown\.

process\.on\('SIGTERM', async \(\) => \{

  logger\.info\(\{ event: 'server\.shutdown\.start' \}\);

  server\.close\(\);              // Stop accepting new connections

  await drainActiveRequests\(\); // Wait for in\-flight requests to complete \(timeout: 30s\)

  await db\.pool\.end\(\);         // Close database connections cleanly

  await redis\.quit\(\);          // Close Redis connection cleanly

  await queue\.close\(\);         // Stop processing new jobs

  logger\.info\(\{ event: 'server\.shutdown\.complete' \}\);

  process\.exit\(0\);

\}\);

Without graceful shutdown: Kubernetes SIGTERM kills the process mid\-request\.

Result: in\-flight transactions orphaned, database connections leaked, requests dropped\.

### __Configuration Management__

- All configuration must come from environment variables ΓÇö never from committed config files\.
- Validate all required environment variables at startup\. Fail fast with a clear error if any are missing\.
- Separate configuration for: database pool sizes, timeout values, feature flags, third\-party API keys\.
- Use a config schema validation library \(Joi, Zod, convict\) to validate config at startup\.
- Document every environment variable: its purpose, type, default value, and whether it is required\.

### __Rate Limiting ΓÇö Required on Every Public Endpoint__

- Apply rate limiting at the infrastructure level \(API gateway, Nginx\) AND the application level\.
- Minimum rate limits: authentication endpoints: 5 req/min\. Write endpoints: 60 req/min\. Read endpoints: 300 req/min\.
- Rate limit by: IP \(unauthenticated\), user ID \(authenticated\), or API key\.
- Return 429 with Retry\-After header when limit is exceeded\.
- Implement graduated response: slow down first, then block\. Hard blocking too early causes false positives\.

### __Retry Logic With Exponential Backoff__

__≡ƒôï Retry Pattern With Exponential Backoff__

// REQUIRED pattern for all outbound calls to external services:

async function callWithRetry\(fn, maxRetries = 3\) \{

  for \(let attempt = 1; attempt <= maxRetries; attempt\+\+\) \{

    try \{

      return await fn\(\);

    \} catch \(err\) \{

      const isRetryable = err\.status === 503 || err\.status === 429 || err\.code === 'ECONNRESET';

      if \(\!isRetryable || attempt === maxRetries\) throw err;

      const delay = Math\.min\(100 \* Math\.pow\(2, attempt\) \+ Math\.random\(\) \* 100, 10000\);

      logger\.warn\(\{ event: 'retry', attempt, delay, error: err\.message \}\);

      await sleep\(delay\);

    \}

  \}

\}

// NEVER retry: 400, 401, 403, 404, 409 ΓÇö these will never succeed on retry\.

// ALWAYS retry: 429 \(rate limit\), 503 \(temp unavailable\), network timeouts\.

// ALWAYS add jitter to prevent thundering herd after mass failure\.

# __PART 2 ΓÇö BACKEND ANTI\-PATTERN REGISTRY__

These are the most common AI\-generated backend failures\. Each is a documented production incident category\. Every row is a hard prohibition\.

__Severity__

__Anti\-pattern__

__Why it fails__

__Correct pattern__

__Γ¥î NEVER__

__Interpolate user input into SQL__

*SQL injection\. Full database compromise\.*

Parameterized queries\. Always\.

__Γ¥î NEVER__

__Hardcode secrets in source code__

*Credentials committed to git are compromised forever\.*

Environment variables or secrets manager\.

__Γ¥î NEVER__

__Return 200 for error responses__

*Clients cannot detect failures\. Breaks all error handling\.*

Correct 4xx/5xx status codes always\.

__Γ¥î NEVER__

__Write without a transaction \(multi\-step\)__

*Partial writes create permanent data corruption\.*

db\.transaction\(\) wrapping all related writes\.

__Γ¥î NEVER__

__Outbound calls without timeout__

*One slow dependency hangs all request threads\.*

Explicit timeout on every I/O call\.

__Γ¥î NEVER__

__Send stack traces to API clients__

*Leaks internal architecture, file paths, dependencies\.*

Generic client message\. Full detail in server logs only\.

__Γ¥î NEVER__

__Unbounded list queries \(no pagination\)__

*Will cause OOM / timeout at scale\. Guaranteed\.*

Cursor\-based pagination on every list endpoint\.

__Γ¥î NEVER__

__Store passwords in plaintext__

*Any DB breach = immediate credential compromise\.*

bcrypt / argon2 with cost factor >= 12\.

__Γ¥î NEVER__

__CORS wildcard on authenticated API__

*Any origin can make authenticated requests on behalf of users\.*

Explicit origin allowlist only\.

__ΓÜá∩╕Å AVOID__

__Synchronous I/O in request handlers__

*Blocks the event loop\. Kills throughput under any load\.*

All I/O is async/await\. CPU work in worker threads\.

__ΓÜá∩╕Å AVOID__

__N\+1 query pattern__

*100 users in a list = 101 DB queries\. Scales to timeout\.*

Eager loading / DataLoader / JOIN\.

__ΓÜá∩╕Å AVOID__

__Missing FK constraints in DB schema__

*Application code is the only thing preventing orphaned data\.*

FK constraints enforced at database level\.

__ΓÜá∩╕Å AVOID__

__console\.log as logging strategy__

*No severity, no context, no correlation, not queryable\.*

Structured logger \(Winston/Pino/structlog\)\.

__ΓÜá∩╕Å AVOID__

__No retry logic on transient failures__

*Network blip or brief overload = permanent user error\.*

Retry with exponential backoff \+ jitter\.

__ΓÜá∩╕Å AVOID__

__No graceful shutdown handling__

*In\-flight requests dropped\. DB connections leaked\.*

SIGTERM handler with drain \+ clean close\.

__≡ƒæü WATCH__

__Growing service with no clear boundaries__

*Becomes a distributed monolith\. Hard to scale or deploy\.*

Define service boundaries\. Single responsibility per service\.

__≡ƒæü WATCH__

__DB migrations without rollback scripts__

*Failed deployment with no recovery path\.*

Every migration has a tested down migration\.

__≡ƒæü WATCH__

__No idempotency on webhook/event handlers__

*Message redelivery creates duplicate state\.*

Idempotency key tracked in DB\. Check before processing\.

__THE PRODUCTION MANDATE__

__A backend service is not finished when the happy path returns 200\.__

It is finished when it validates all input, rejects invalid requests with correct status codes, executes multi\-step writes atomically, handles dependency failures gracefully, times out on slow dependencies, logs structured events with correlation IDs, exposes health and readiness endpoints, shuts down cleanly under SIGTERM, and has tests covering success and failure paths\.

__That is the standard\. Follow it on every endpoint, in every service, without exception\.__

