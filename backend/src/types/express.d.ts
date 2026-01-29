import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      displayName: string;
      email?: string | null;
      raw?: unknown;
      roles?: string[];
    };
    isAuthenticated?: () => boolean;
  }
}
