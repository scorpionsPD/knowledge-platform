import cors from 'cors';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { Pool } from 'pg';

import { authRouter } from './auth';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter, sanitizeRequest, securityHeaders } from './middleware/security';
import expertsRouter from './routes/experts';
import feedbackRouter from './routes/feedback';
import invitesRouter from './routes/invites';
import roleMappingsRouter from './routes/roleMappings';
import reportsRouter from './routes/reports';
import sessionsRouter from './routes/sessions';
import usersRouter from './routes/users';

const app = express();

const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// Security middleware - helmet provides secure defaults
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:']
      }
    },
    crossOriginEmbedderPolicy: false // Allow embedding for development
  })
);

// Custom security headers
app.use(securityHeaders);

// CORS configuration
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true
  })
);

// Logging middleware
app.use(morgan('dev'));

// Request parsing and sanitization
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeRequest);

const sessionSecret = process.env.SESSION_SECRET || 'change-me';
const PgSession = connectPgSimple(session);
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/knowledge_platform'
});

app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      tableName: 'user_sessions',
      createTableIfMissing: true
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint (no rate limiting)
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Apply rate limiting to auth endpoints
app.use('/auth', authLimiter, authRouter);

// Apply general rate limiting to API endpoints
app.use('/api', apiLimiter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/experts', expertsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/users', usersRouter);
app.use('/api/invites', invitesRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/role-mappings', roleMappingsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
