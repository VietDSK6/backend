import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middlewares/error.middleware';

import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import eventsRouter from './modules/events/events.router';
import applicationsRouter from './modules/applications/applications.router';
import reviewsRouter from './modules/reviews/reviews.router';
import notificationsRouter from './modules/notifications/notifications.router';
import dashboardRouter from './modules/dashboard/dashboard.router';
import faqsRouter from './modules/faqs/faqs.router';
import badgesRouter from './modules/badges/badges.router';
import activityTypesRouter from './modules/activity-types/activity-types.router';
import uploadRouter from './modules/upload/upload.router';
import clubsRouter from './modules/clubs/clubs.router';
import rewardsRouter from './modules/rewards/rewards.router';

const app = express();
const PORT = process.env.PORT || 4000;

// Global middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'VolunConnect API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));
// Swagger JSON endpoint
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/events', eventsRouter);
app.use('/api/v1/applications', applicationsRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/faqs', faqsRouter);
app.use('/api/v1/badges', badgesRouter);
app.use('/api/v1/activity-types', activityTypesRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/clubs', clubsRouter);
app.use('/api/v1/rewards', rewardsRouter);


// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 VolunConnect API running on http://localhost:${PORT}`);
  console.log(`📚 Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
});

export default app;
