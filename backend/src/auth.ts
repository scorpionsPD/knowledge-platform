import passport from 'passport';
import { Strategy as OAuth2Strategy, InternalOAuthError } from 'passport-oauth2';
import { Router } from 'express';

const authRouter = Router();

const {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_AUTH_URL,
  OAUTH_TOKEN_URL,
  OAUTH_CALLBACK_URL,
  OAUTH_USERINFO_URL
} = process.env;

const isOAuthConfigured =
  Boolean(OAUTH_CLIENT_ID) &&
  Boolean(OAUTH_CLIENT_SECRET) &&
  Boolean(OAUTH_AUTH_URL) &&
  Boolean(OAUTH_TOKEN_URL) &&
  Boolean(OAUTH_CALLBACK_URL);

if (isOAuthConfigured) {
  passport.use(
    new OAuth2Strategy(
      {
        authorizationURL: OAUTH_AUTH_URL as string,
        tokenURL: OAUTH_TOKEN_URL as string,
        clientID: OAUTH_CLIENT_ID as string,
        clientSecret: OAUTH_CLIENT_SECRET as string,
        callbackURL: OAUTH_CALLBACK_URL as string
      },
      async (accessToken, _refreshToken, _params, profile, done) => {
        try {
          let userinfo: { sub?: string; email?: string; name?: string } | undefined;
          if (OAUTH_USERINFO_URL) {
            const resp = await fetch(OAUTH_USERINFO_URL, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (!resp.ok) {
              throw new InternalOAuthError('Failed to fetch user info', resp.statusText);
            }
            userinfo = (await resp.json()) as typeof userinfo;
          }
          const id = userinfo?.sub ?? (profile as { id?: string })?.id ?? 'unknown';
          return done(null, {
            id,
            displayName: userinfo?.name || (profile as { displayName?: string })?.displayName || 'User',
            email: userinfo?.email,
            raw: userinfo ?? profile,
            roles: ['member']
          });
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj: Express.User, done) => {
    done(null, obj);
  });

  authRouter.get('/login', passport.authenticate('oauth2'));

  authRouter.get(
    '/callback',
    passport.authenticate('oauth2', { failureRedirect: '/auth/failure' }),
    (req, res) => {
      res.redirect('/auth/success');
    }
  );
} else {
  authRouter.get('/login', (_req, res) => {
    res
      .status(501)
      .json({ message: 'OAuth not configured. Set OAUTH_* env vars or enable AUTH_DISABLED=true.' });
  });

  authRouter.get('/callback', (_req, res) => {
    res.status(501).json({ message: 'OAuth not configured.' });
  });
}

authRouter.get('/success', (req, res) => {
  res.json({ message: 'Authenticated', user: req.user ?? null });
});

authRouter.get('/failure', (_req, res) => {
  res.status(401).json({ message: 'Authentication failed' });
});

authRouter.get('/profile', (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ user: req.user });
});

authRouter.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.json({ message: 'Logged out' });
    });
  });
});

export { authRouter, isOAuthConfigured };
