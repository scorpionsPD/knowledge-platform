import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      displayName: string;
      email?: string;
      raw?: unknown;
    };
    isAuthenticated?: () => boolean;
  }
}
