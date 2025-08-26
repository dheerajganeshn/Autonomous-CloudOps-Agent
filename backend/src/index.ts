import Fastify from 'fastify';
import * as dotenv from 'dotenv';
dotenv.config();

import health from './routes/health.js';
import incidents from './routes/incidents.js';
import suggestions from './routes/suggestions.js';
import feedback from './routes/feedback.js';

const app = Fastify({ logger: true });
app.register(health);
app.register(incidents);
app.register(suggestions);
app.register(feedback);

const port = Number(process.env.PORT || 4000);
app.listen({ port, host: '0.0.0.0' }).then(() => console.log(`API on :${port}`));