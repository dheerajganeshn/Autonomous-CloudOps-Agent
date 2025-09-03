 # Autonomous CloudOps Agent

A full-stack (Node.js + React) CloudOps assistant for SRE/DevOps.  
It ingests alerts from AWS CloudWatch and Datadog, groups them into incidents, suggests remediation actions (restart pods, rollback, scale services), and learns from operator feedback (RLHF-lite).

  
## Current Progress
- ✅ Backend initialized (Node.js + TypeScript + Prisma)
- ✅ Database schema defined and first migration applied
- ✅ Fastify API routes
- ⬜ Incident analyzer service (Datadog/CloudWatch integration)
- ⬜ React frontend dashboard
- ⬜ Slack notifications + CI/CD pipelines
- ⬜ RLHF-lite feedback loop

## Setup & Commands

```bash
# install dependencies
npm install

# generate prisma client
npx prisma generate

# run DB migrations
npx prisma migrate dev --name init

# start backend in dev mode
npm run dev

Environment

Create a .env file in backend/:

Test APIs 
# Health check
curl http://localhost:4000/health

# Create a demo incident (mock alerts)
curl -X POST http://localhost:4000/api/incidents/ingest

# List incidents
curl http://localhost:4000/api/incidents

 here's  the end-to-end flow of what thes system does right now, and how each piece works together.

Big picture

We have built a small, vertical slice of an Autonomous CloudOps Agent:
	•	Persistence: SQLite DB managed by Prisma (tables: Incident, Alert, ActionSuggestion, Feedback).
	•	API: Fastify server exposes endpoints to list incidents, ingest demo alerts, and send feedback.
	•	Logic: An analyzer turns raw alerts into an Incident with suggested remediation actions.

What happens in each step

1) You start the API
	•	Command: npm run dev (via tsx watch)
	•	Fastify boots and registers routes:
	•	GET /health
	•	GET /api/incidents
	•	POST /api/incidents/ingest
	•	POST /api/feedback
	•	dotenv loads .env (e.g., PORT=4000)
	•	Prisma client is ready to talk to prisma/dev.db (created by your migration)

2) You apply the initial migration (already done)
	•	Command: npx prisma migrate dev --name init
	•	Prisma created the SQLite file and these tables (from your migration.sql):
	•	Incident (top-level record)
	•	Alert (many per incident)
	•	ActionSuggestion (many per incident)
	•	Feedback (many per suggestion)

This means the database structure now matches your Prisma models.

3) You call ingest to create a demo incident
	•	Command: POST /api/incidents/ingest
	•	Flow:
	1.	Route fabricates mock alerts (pretending to come from Datadog/CloudWatch).
	2.	Alerts go into the analyzer (simple rules):
	•	If message looks like OOM → suggest restart_pods
	•	If message looks like 5xx spike → suggest rollback
	•	If message looks like latency → suggest scale_service
	•	Otherwise → noop
	•	Sets an overall title and severity (low/medium/high)
	3.	The route creates an Incident in the DB via Prisma, with:
	•	Incident row (title, severity, description)
	•	Alert rows (one per alert)
	•	ActionSuggestion rows (one per suggestion)
	4.	Returns the full incident (including alerts + suggestions) as JSON.

Right now, this simulates ingestion. Later, you’ll swap the mock alerts for real Datadog/CloudWatch adapters that query APIs and feed the analyzer.

4) You list incidents
	•	Command: GET /api/incidents
	•	Flow:
	•	Fastify handler queries Prisma to fetch incidents (newest first) with related alerts and suggestions.
	•	Returns an array of incidents for your UI (or curl).

5) You send feedback on a suggestion
	•	Command: POST /api/feedback with JSON:

{ "suggestionId": "<id>", "value": 1, "comment": "looks good" }


	•	Flow:
	•	Route validates inputs (basic shape).
	•	Ensures suggestionId exists.
	•	Inserts a Feedback row linked to that suggestion.
	•	Returns { ok: true, feedbackId: ... }.

Later, a nightly job or endpoint can recompute confidence on suggestions using recent feedback (your RLHF-lite loop).

Why each component exists
	•	Fastify: minimal, fast HTTP server with TypeScript support.
	•	Prisma: schema-first ORM that generates a type-safe client and handles migrations.
	•	SQLite: simplest dev DB; no external service needed. You can switch to Postgres later by changing the datasource and re-migrating.
	•	Analyzer service: a separable layer for “decision logic” — easy to improve with more rules (or an LLM, later) without touching routes.

Typical request flows

A) Create data

Client → POST /api/incidents/ingest
  → analyzer(alerts) → [{suggestions…}, severity, title]
  → Prisma: create Incident + Alerts + Suggestions
  ← Incident JSON (with children)

B) Read data

Client → GET /api/incidents
  → Prisma: findMany(include alerts, suggestions)
  ← [Incident, …]

C) Feedback

Client → POST /api/feedback { suggestionId, value }
  → Prisma: create Feedback
  ← { ok: true, feedbackId }

What to do next (in order)
	1.	Add CORS so a browser frontend can call your API.
	•	npm i @fastify/cors
	•	Register it in src/index.ts (allow localhost origins during dev).
	2.	Frontend slice (Dashboard v0)
	•	Vite + React app (frontend/)
	•	Show incidents list, “Ingest alerts” button, 👍/👎 buttons.
	•	Point it at VITE_API_URL=http://localhost:4000.
	3.	API input validation and errors
	•	Use zod schemas in /api/feedback.
	•	Return clean 400/404s with messages.
	4.	OpenAPI contract
	•	Add backend/openapi.yaml documenting the 3 endpoints. Helpful for future frontend typing or external contributors.
	5.	CI
	•	GitHub Actions to build backend (and frontend once added). This keeps contributions healthy.
	6.	(Soon) Real adapters
	•	Implement adapters/datadog.ts & adapters/cloudwatch.ts.
	•	Use env vars for keys; add a feature flag USE_MOCK_ADAPTERS=true/false.

README additions you should make
	•	“Backend Setup” block (install, generate, migrate, run)
	•	“API Quick Test” block (three curl commands)
	•	“Roadmap” listing next slices (Dashboard, real ingestion, execute plan, auth, RLHF-lite)
	•	.env example (already done)

If you want, I’ll draft the frontend dashboard files next so you can see incidents in a browser and click through the whole slice.