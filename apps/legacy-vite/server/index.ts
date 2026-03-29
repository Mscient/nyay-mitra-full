import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import rateLimit from "express-rate-limit";

const app = express();
let httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ── Rate Limiting (LexAI Security Spec: 100 req/min per IP) ─────────
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests, please slow down.' } },
  skip: (req) => req.path === '/api/health' || req.path === '/api/ready',
});

// Stricter limit for auth endpoints to prevent brute-force (10/min)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many auth attempts. Please wait a minute.' } },
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/login', authLimiter);
app.use('/api/register', authLimiter);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  httpServer = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
    const status = err.status || err.statusCode || 500;
    const isOperational = err.isOperational === true || status < 500;
    
    // Structured error logging
    const logData = {
      event: status >= 500 ? 'error.unhandled' : 'error.operational',
      requestId,
      status,
      message: err.message,
      stack: status >= 500 ? err.stack : undefined,
      path: req.path,
      method: req.method,
    };
    
    if (status >= 500) {
      console.error(JSON.stringify({ level: 'CRITICAL', ...logData }));
    } else {
      console.warn(JSON.stringify({ level: 'WARN', ...logData }));
    }

    if (res.headersSent) {
      return next(err);
    }

    // Required global error envelope shape from engineering guide
    return res.status(status).json({
      error: {
        code: isOperational ? (err.code || 'VALIDATION_ERROR') : 'INTERNAL_ERROR',
        message: isOperational ? err.message : 'An unexpected error occurred.',
        requestId,
      }
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  const isWindows = process.platform === "win32";
  const host = isWindows ? "127.0.0.1" : "0.0.0.0";
  const listenOptions = isWindows
    ? { port, host }
    : { port, host, reusePort: true };

  httpServer.listen(listenOptions, () => {
    log(`serving on port ${port}`);
  });
})();
