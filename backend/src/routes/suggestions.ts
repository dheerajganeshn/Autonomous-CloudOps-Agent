import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { notifySlack } from '../services/notifier.js';

const prisma = new PrismaClient();

export default async function suggestions(app: FastifyInstance) {
  app.post('/api/suggestions/:id/execute', async (req, res) => {
    const { id } = req.params as { id: string };
    const suggestion = await prisma.actionSuggestion.findUnique({ where: { id } });
    if (!suggestion) return res.code(404).send({ error: 'Not found' });

    await notifySlack(process.env.SLACK_WEBHOOK_URL, `Would execute: ${suggestion.actionType} — ${suggestion.description}`);
    return { ok: true, plan: `Simulated ${suggestion.actionType}` };
  });
}