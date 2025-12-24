import cors from 'cors';
import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import morgan from 'morgan';
import passport from 'passport';
import { Pool } from 'pg';

import { authRouter } from './auth';
import expertsRouter from './routes/experts';
import reportsRouter from './routes/reports';
import sessionsRouter from './routes/sessions';

const app = express();

const allowedOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true
  })
);
app.use(morgan('dev'));
app.use(express.json());

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

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/experts', expertsRouter);
app.use('/api/reports', reportsRouter);

app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

export default app;
