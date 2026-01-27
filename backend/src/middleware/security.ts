import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware to prevent abuse
 * Limits requests per IP address to protect against DoS attacks
 * Different limits for different endpoint types
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later',
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      message: 'Too many requests, please try again later',
      retryAfter: Math.ceil(req.rateLimit.resetTime! / 1000)
    });
  }
});

/**
 * Stricter rate limiting for authentication endpoints
 * Prevents brute force attacks on login/auth endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true // Don't count successful auth attempts
});

/**
 * Request sanitization middleware
 * Validates and sanitizes request data to prevent injection attacks
 */
export function sanitizeRequest(req: Request, _res: Response, next: NextFunction) {
  // Remove any null bytes from request data
  const sanitize = (obj: unknown): unknown => {
    if (typeof obj === 'string') {
      return obj.replace(/\0/g, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query) as typeof req.query;
  req.params = sanitize(req.params) as typeof req.params;

  next();
}

/**
 * CORS validation middleware
 * Ensures requests come from allowed origins
 */
export function validateOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.FRONTEND_ORIGIN?.split(',') || ['http://localhost:3000'];

  // Allow requests with no origin (like mobile apps or curl)
  if (!origin) {
    return next();
  }

  if (allowedOrigins.includes(origin)) {
    return next();
  }

  return res.status(403).json({
    message: 'Origin not allowed',
    origin
  });
}

/**
 * Content Security Policy headers
 * Adds security headers to protect against XSS and other attacks
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
}
