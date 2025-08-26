import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function feedback(app: FastifyInstance) {
  app.post('/api/feedback', async (req, res) => {
    const body = req.body as { suggestionId: string; value: 1 | -1; comment?: string };
    if (!body?.suggestionId || ![1, -1].includes(body.value)) return res.code(400).send({ error: 'Bad input' });
    const fb = await prisma.feedback.create({ data: { suggestionId: body.suggestionId, value: body.value, comment: body.comment } });
    return { ok: true, feedbackId: fb.id };
  });
}