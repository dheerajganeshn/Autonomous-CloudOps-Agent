 # Autonomous CloudOps Agent

A full-stack (Node.js + React) CloudOps assistant for SRE/DevOps.  
It ingests alerts from AWS CloudWatch and Datadog, groups them into incidents, suggests remediation actions (restart pods, rollback, scale services), and learns from operator feedback (RLHF-lite).

## Current Progress
- ✅ Backend initialized (Node.js + TypeScript + Prisma)
- ✅ Database schema defined and first migration applied
- ⬜ Fastify API routes
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