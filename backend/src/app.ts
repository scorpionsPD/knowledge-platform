import cors from 'cors';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';

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
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false
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
