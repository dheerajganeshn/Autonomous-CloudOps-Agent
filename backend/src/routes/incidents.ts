import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { fetchDatadogAlerts } from '../adapters/datadog.js';
import { fetchCloudWatchAlerts } from '../adapters/cloudwatch.js';
import { analyzeIncidents } from '../services/analyzer.js';

const prisma = new PrismaClient();

export default async function incidents(app: FastifyInstance) {
  app.get('/api/incidents', async () => {
    const incidents = await prisma.incident.findMany({ include: { alerts: true, suggestions: true } });
    return incidents;
  });

  app.post('/api/incidents/ingest', async () => {
    const dd = await fetchDatadogAlerts();
    const cw = await fetchCloudWatchAlerts();
    const alerts = [...dd, ...cw].map(a => ({ source: 'mock', message: a.message, severity: a.severity }));
    const analysis = analyzeIncidents({ alerts });

    const incident = await prisma.incident.create({
      data: {
        title: analysis.title,
        severity: analysis.severity,
        description: 'Auto-generated from Datadog + CloudWatch',
        alerts: { create: alerts.map(a => ({ source: a.source, message: a.message, severity: a.severity })) },
        suggestions: { create: analysis.suggestions.map(s => ({ actionType: s.actionType, description: s.description, confidence: s.confidence })) }
      },
      include: { alerts: true, suggestions: true }
    });

    return incident;
  });
}